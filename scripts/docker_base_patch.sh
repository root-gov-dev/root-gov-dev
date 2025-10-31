#!/usr/bin/env bash
# Purpose: Patch a Dockerfile base image tag to a newer digest or tag in a controlled manner.
# Usage: docker_base_patch.sh Dockerfile "alpine:3.20" "alpine:3.20.1"
set -euo pipefail
FILE="${1:-Dockerfile}"
FROM_OLD="${2:-}"
FROM_NEW="${3:-}"
test -n "$FROM_OLD" && test -n "$FROM_NEW" || { echo "usage: $0 Dockerfile FROM_OLD FROM_NEW" >&2; exit 2; }
tmp="${FILE}.tmp.$RANDOM"
cp "$FILE" "$tmp"
sed -E -i "s|^FROM[[:space:]]+${FROM_OLD}|FROM ${FROM_NEW}|g" "$tmp"
if ! diff -u "$FILE" "$tmp" >/dev/null 2>&1; then
  mv "$tmp" "$FILE"
  echo "Patched $FILE: $FROM_OLD -> $FROM_NEW"
else
  rm -f "$tmp"
  echo "No changes"
fi
