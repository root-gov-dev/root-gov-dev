#!/usr/bin/env bash
# Purpose: Attempt to auto-replace non-compliant container images with approved baselines.
# Notes:
# - Reads a list of images, searches manifests for occurrences, and replaces using a simple map.
# - Keep changes small and visible in PR diff for human review.

set -euo pipefail
IMAGES_FILE="${1:-.out/images.txt}"
MANIFESTS_DIR="${2:-manifests}"
TOOLS_CFG="${3:-supplychain/config/tools.yaml}"

echo "[auto-fix] images file=$IMAGES_FILE, manifests=$MANIFESTS_DIR, cfg=$TOOLS_CFG"

# 讀取替換表（簡化：使用內建 map；可進一步用 yq 從 ${TOOLS_CFG} 解析）
declare -A REPL
REPL["busybox:latest"]="ghcr.io/secure-baseline/busybox:1.36-secure"
REPL["alpine:latest"]="ghcr.io/secure-baseline/alpine:3.19-secure"

changed=0
while read -r IMG; do
  [[ -z "${IMG:-}" ]] && continue
  if [[ -n "${REPL[$IMG]:-}" ]]; then
    NEW="${REPL[$IMG]}"
    echo "[auto-fix] replace $IMG -> $NEW"
    # 在 manifests 中進行就地替換
    MATCHED=$(grep -RIl "$IMG" "$MANIFESTS_DIR" || true)
    if [[ -n "${MATCHED:-}" ]]; then
      echo "$MATCHED" | xargs sed -i "s|$IMG|$NEW|g"
      changed=1
    fi
  fi
done < "$IMAGES_FILE"

if [[ "$changed" -eq 1 ]]; then
  echo "[auto-fix] manifests updated; please review changes in PR diff."
else
  echo "[auto-fix] no replacements applied."
fi