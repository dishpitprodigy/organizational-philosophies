#!/usr/bin/env bash
set -euo pipefail

preview_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(git -C "$preview_dir" rev-parse --show-toplevel)"
manifest="$preview_dir/book.txt"
output_dir="$preview_dir/output"
part_filter="$preview_dir/part-dividers.lua"

cd "$repo_root"

python3 "$preview_dir/assemble.py" --check

title=""
subtitle=""
author="Jon Wroblewski"
slug=""
chapters=()
in_chapters=false

while IFS= read -r line || [[ -n "$line" ]]; do
  if $in_chapters; then
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    chapters+=("$line")
    continue
  fi
  case "$line" in
    chapters:) in_chapters=true ;;
    title:\ *) title="${line#title: }" ;;
    subtitle:\ *) subtitle="${line#subtitle: }" ;;
    author:\ *) author="${line#author: }" ;;
    slug:\ *) slug="${line#slug: }" ;;
  esac
done < "$manifest"

if [[ -z "$title" || -z "$slug" || ${#chapters[@]} -eq 0 ]]; then
  echo "error: incomplete preview manifest: $manifest" >&2
  exit 1
fi

for chapter in "${chapters[@]}"; do
  [[ -f "$chapter" ]] || {
    echo "error: missing preview chapter: $chapter" >&2
    exit 1
  }
done

mkdir -p "$output_dir"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mapfile -t rewritten_chapters < <(
  python3 publish/bin/rewrite_internal_links.py "${chapters[@]}" "$tmp_dir"
)

source_epoch="${SOURCE_DATE_EPOCH:-$(git -C "$repo_root" log -1 --format=%ct)}"
export SOURCE_DATE_EPOCH="$source_epoch"
export FORCE_SOURCE_DATE=1
doc_date="$(git -C "$repo_root" log -1 --format=%cs)"
meta_args=(-M title="$title" -M author="$author" -M date="$doc_date" -M identifier="$slug")
[[ -n "$subtitle" ]] && meta_args+=(-M subtitle="$subtitle")

echo "==> PDF  $output_dir/${slug}.pdf"
pandoc -d publish/book-pdf.yaml \
  --lua-filter="$part_filter" \
  --resource-path=".:book-preview/frontmatter:book-preview/parts:book-preview/chapters:book-preview/appendices:book-preview" \
  "${meta_args[@]}" \
  -o "$output_dir/${slug}.pdf" \
  "${rewritten_chapters[@]}"

echo "==> EPUB $output_dir/${slug}.epub"
pandoc -d publish/book-epub.yaml \
  --lua-filter="$part_filter" \
  --resource-path=".:book-preview/frontmatter:book-preview/parts:book-preview/chapters:book-preview/appendices:book-preview" \
  "${meta_args[@]}" \
  -o "$output_dir/${slug}.epub" \
  "${rewritten_chapters[@]}"

echo "Done."
