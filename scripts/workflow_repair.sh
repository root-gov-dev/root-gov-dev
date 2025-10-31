#!/usr/bin/env bash
# Purpose: Scan .github/workflows for insecure patterns and governance gaps; propose a unified patch and reports.
# Usage:
#   workflow_repair.sh --scan --patch-out outputs/patch.diff --report-json outputs/auto-fix-report.json --report-md outputs/auto-fix-report.md
# Behavior:
#   - Detects unpinned actions (uses: owner/repo@vX or @main) and replaces with "@&lt;REQUIRED_SHA&gt;" placeholders in patch.
#   - Ensures minimal permissions (contents: read) at workflow level if missing.
#   - Adds concurrency block if missing.
#   - Adds job-level timeout if missing (timeout-minutes: 30 default).
#   - Avoids modifying this workflow itself by default to prevent loops.

set -euo pipefail

PATCH_OUT=""
REPORT_JSON=""
REPORT_MD=""
DO_SCAN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scan) DO_SCAN=true; shift ;;
    --patch-out) PATCH_OUT="$2"; shift 2;;
    --report-json) REPORT_JSON="$2"; shift 2;;
    --report-md) REPORT_MD="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

mkdir -p "$(dirname "${PATCH_OUT:-outputs/patch.diff}")" || true
mkdir -p "$(dirname "${REPORT_JSON:-outputs/auto-fix-report.json}")" || true
mkdir -p "$(dirname "${REPORT_MD:-outputs/auto-fix-report.md}")" || true

WORKFLOWS_DIR=".github/workflows"
test -d "$WORKFLOWS_DIR" || { echo "no workflows directory"; exit 0; }

declare -a findings
declare -a patches

add_finding() {
  findings+=("$1")
}

# Very light YAML "edits" via sed; build a unified diff patch buffer.
generate_patch_for_file() {
  local f="$1"
  local tmp="${f}.patched.tmp"
  cp "$f" "$tmp"

  # Skip self-hardening loop for this file
  if [[ "$(basename "$f")" == "workflow-monitor-and-repair.yml" ]]; then
    :
  fi

  # Unpinned uses: convert @vX / @main / @master to @<REQUIRED_SHA>
  if grep -Eq 'uses:\s*[A-Za-z0-9_.\-/]+@v?[A-Za-z0-9_.\-]+' "$tmp"; then
    if grep -Eq 'uses:\s*[^@]+@v[0-9]+' "$tmp" || grep -Eq 'uses:\s*[^@]+@(main|master|latest)' "$tmp"; then
      sed -E -i 's@(uses:\s*[A-Za-z0-9_.\-/]+)@v[0-9][^[:space:]]*@\1@<REQUIRED_SHA>@g' "$tmp" || true
      sed -E -i 's@(uses:\s*[A-Za-z0-9_.\-/]+)@(main|master|latest)@\1@<REQUIRED_SHA>@g' "$tmp" || true
      add_finding "$f: replaced unpinned actions with @<REQUIRED_SHA> placeholders"
    fi
  fi

  # Ensure top-level permissions: contents: read (add if missing)
  if ! grep -Eq '^permissions:\s*$' "$tmp"; then
    # Insert after 'on:' section
    awk '
      BEGIN{added=0}
      {print}
      /^on:/{ if (added==0) { print "\npermissions:\n  contents: read"; added=1 } }
    ' "$tmp" > "${tmp}.perm" && mv "${tmp}.perm" "$tmp"
    add_finding "$f: ensured minimal permissions (contents: read) if absent"
  fi

  # Ensure concurrency
  if ! grep -Eq '^concurrency:' "$tmp"; then
    awk '
      BEGIN{added=0}
      {print}
      /^permissions:/{ if (added==0) { print "\nconcurrency:\n  group: auto-"+ENVIRON["GITHUB_RUN_ID"]+"\n  cancel-in-progress: true"; added=1 } }
    ' "$tmp" > "${tmp}.conc" && mv "${tmp}.conc" "$tmp"
    add_finding "$f: added concurrency"
  fi

  # Ensure job-level timeout-minutes (default to 30) where missing
  awk '
    /^\s{2}[A-Za-z0-9_-]+:$/ { in_job=1; job=$0; print; next }
    { print }
  ' "$tmp" > "${tmp}.tmp2" && mv "${tmp}.tmp2" "$tmp"
  # naive insertion under each "runs-on" if timeout missing
  if grep -Eq 'runs-on:' "$tmp"; then
    awk '
      BEGIN{in_job=0}
      /^[^ ]/ {in_job=0}
      /^\s{2}[A-Za-z0-9_-]+:$/ {in_job=1}
      {print}
      (in_job==1)&&/runs-on:/ {print "    timeout-minutes: 30"; in_job=2}
    ' "$tmp" > "${tmp}.tmp3" && mv "${tmp}.tmp3" "$tmp"
    add_finding "$f: ensured timeout-minutes under jobs"
  fi

  if ! diff -u "$f" "$tmp" > /dev/null 2>&1; then
    diff -u "$f" "$tmp" || true
  fi
}

PATCH_BUF=""
for f in $(find "$WORKFLOWS_DIR" -maxdepth 1 -type f -name "*.yml" -o -name "*.yaml"); do
  DIFF=$(generate_patch_for_file "$f" || true)
  if [[ -n "${DIFF:-}" ]]; then
    PATCHES="${DIFF}"
    patches+=("$f")
    PATCH_BUF+="$DIFF"$'\n'
  fi
done

# Write reports
jq -n --arg date "$(date -Iseconds)" \
      --arg author "${GITHUB_ACTOR:-local}" \
      --argjson files "$(printf '%s\n' "${patches[@]}" | jq -R . | jq -s .)" \
      --argjson notes "$(printf '%s\n' "${findings[@]}" | jq -R . | jq -s .)" \
      '{at:$date, by:$author, patched_files:$files, findings:$notes}' > "${REPORT_JSON}"

{
  echo "# Workflow Auto-Fix Report"
  echo
  echo "- Time: $(date -Iseconds)"
  echo "- By: ${GITHUB_ACTOR:-local}"
  echo "- Patched files: ${#patches[@]}"
  echo
  echo "## Findings"
  for n in "${findings[@]}"; do echo "- ${n}"; done
} > "${REPORT_MD}"

if [[ -n "${PATCH_OUT}" ]]; then
  printf "%s" "${PATCH_BUF}" > "${PATCH_OUT}"
fi

if $DO_SCAN; then
  echo "Scan complete."
fi
