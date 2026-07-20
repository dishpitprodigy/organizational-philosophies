#!/usr/bin/env bash
# Build one Markdown document into a matching PDF and EPUB, styled by
# publish/pdf.yaml and publish/epub.yaml.
#
# Usage: publish/bin/build-doc.sh <source.md> [output-slug]
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <source.md> [output-slug]" >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

src="$1"
if [[ ! -f "$src" ]]; then
  echo "error: no such file: $src" >&2
  exit 1
fi

slug="${2:-$(basename "$src" .md)}"
slug="${slug// /-}"

title="$(sed -n '1{/^# /{s/^# //;p}}' "$src")"
if [[ -z "$title" ]]; then
  echo "error: $src must start with a level-1 '# Title' heading" >&2
  exit 1
fi

mkdir -p publish/output
tmp_body="$(mktemp)"
trap 'rm -f "$tmp_body"' EXIT

# Drop the leading H1: it becomes the document's title block (\maketitle /
# EPUB title page) instead of also rendering as a duplicate first section.
tail -n +2 "$src" > "$tmp_body"

author="Jon Wroblewski"
doc_date="$(date +%Y-%m-%d)"

echo "==> PDF  publish/output/${slug}.pdf"
pandoc -d publish/pdf.yaml \
  -M title="$title" -M author="$author" -M date="$doc_date" \
  -o "publish/output/${slug}.pdf" \
  "$tmp_body"

echo "==> EPUB publish/output/${slug}.epub"
pandoc -d publish/epub.yaml \
  -M title="$title" -M author="$author" -M date="$doc_date" \
  -o "publish/output/${slug}.epub" \
  "$tmp_body"

echo "Done."
