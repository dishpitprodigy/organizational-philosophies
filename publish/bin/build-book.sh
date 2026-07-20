#!/usr/bin/env bash
# Assemble a curated set of chapters into one combined PDF and EPUB,
# styled by publish/book-pdf.yaml and publish/book-epub.yaml. Each
# chapter keeps its own '# Title' heading, which becomes a numbered
# chapter (PDF) / chapter file (EPUB) -- first chapter listed is
# Chapter 1, no separate foreword/preface is inserted.
#
# Usage: publish/bin/build-book.sh <manifest.txt>
#
# Manifest format (see publish/book/*.txt for examples):
#   title: Book Title
#   subtitle: Optional subtitle
#   author: Optional author (defaults to Jon Wroblewski)
#   slug: output-file-basename
#   chapters:
#   repo-root-relative/path/one.md
#   repo-root-relative/path/two.md
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <manifest.txt>" >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
manifest="$1"
[[ "$manifest" = /* ]] || manifest="$(pwd)/$manifest"
cd "$repo_root"

if [[ ! -f "$manifest" ]]; then
  echo "error: no such manifest: $manifest" >&2
  exit 1
fi

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

if [[ -z "$title" ]]; then
  echo "error: $manifest has no 'title:' line" >&2
  exit 1
fi
if [[ -z "$slug" ]]; then
  echo "error: $manifest has no 'slug:' line" >&2
  exit 1
fi
if [[ ${#chapters[@]} -eq 0 ]]; then
  echo "error: $manifest lists no chapters" >&2
  exit 1
fi

for f in "${chapters[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "error: manifest references missing file: $f" >&2
    exit 1
  fi
done

doc_date="$(date +%Y-%m-%d)"
mkdir -p publish/output

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

# Source docs link to each other via docs/*.html (correct on the
# website). Where the linked doc is itself a chapter in this book,
# repoint the link at that chapter instead of a website path that won't
# exist once the book leaves the repo.
mapfile -t rewritten_chapters < <(
  python3 publish/bin/rewrite_internal_links.py "${chapters[@]}" "$tmp_dir"
)

meta_args=(-M title="$title" -M author="$author" -M date="$doc_date")
[[ -n "$subtitle" ]] && meta_args+=(-M subtitle="$subtitle")

echo "==> PDF  publish/output/${slug}.pdf (${#chapters[@]} chapters)"
pandoc -d publish/book-pdf.yaml \
  "${meta_args[@]}" \
  -o "publish/output/${slug}.pdf" \
  "${rewritten_chapters[@]}"

echo "==> EPUB publish/output/${slug}.epub"
pandoc -d publish/book-epub.yaml \
  "${meta_args[@]}" \
  -o "publish/output/${slug}.epub" \
  "${rewritten_chapters[@]}"

echo "Done."
