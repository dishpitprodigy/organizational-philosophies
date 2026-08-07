#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <LAN-IP>" >&2
  exit 2
fi

public_ip=$1
base_url="https://$public_ip"
temporary_dir=$(mktemp -d /tmp/work-intake-check.XXXXXX)
trap 'rm -rf -- "$temporary_dir"' EXIT

curl -fsS -D "$temporary_dir/redirect.headers" "http://$public_ip/work-intake?check=redirect" -o /dev/null
grep -q '^HTTP/1.1 301' "$temporary_dir/redirect.headers"
grep -qi "^Location: https://$public_ip/work-intake?check=redirect" "$temporary_dir/redirect.headers"

curl -kfsS -D "$temporary_dir/page.headers" "$base_url/work-intake" -o "$temporary_dir/page.html"
grep -qi '^Content-Type: text/html' "$temporary_dir/page.headers"
grep -q '<!DOCTYPE html>' "$temporary_dir/page.html"

for asset in app.js model.js form-definition.js; do
  curl -kfsS -D "$temporary_dir/$asset.headers" "$base_url/work-intake-assets/$asset" -o "$temporary_dir/$asset"
  if ! grep -qi '^Content-Type: application/javascript' "$temporary_dir/$asset.headers"; then
    echo "$asset was not served as JavaScript" >&2
    exit 1
  fi
  if [[ $(sed -E 's/^[[:space:]]*//' "$temporary_dir/$asset" | head -c 1) == '<' ]]; then
    echo "$asset returned HTML; Firefox would report: expected expression, got '<'" >&2
    exit 1
  fi
  node --check "$temporary_dir/$asset"
done

definition=technical-work-proposal.v1.json
curl -kfsS -D "$temporary_dir/$definition.headers" \
  "$base_url/work-intake-assets/forms/definitions/$definition" \
  -o "$temporary_dir/$definition"
grep -qi '^Content-Type: application/json' "$temporary_dir/$definition.headers"
node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' \
  "$temporary_dir/$definition"

echo "HTTP redirect, HTTPS page, JavaScript, and form-definition checks passed for $base_url/work-intake"
