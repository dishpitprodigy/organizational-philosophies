#!/usr/bin/env python3
"""Rewrite docs/*.html and docs/templates/*.html links into in-book
anchors when the linked document is itself one of the chapters being
assembled into this book.

Source docs are shared between the docs/ website (where a relative link
like docs/templates/tda-personal-development-plan.html resolves fine) and
this PDF/EPUB pipeline (where that path doesn't exist once the file
leaves the repo). When the linked document is included as a chapter in
the same book, point the link at that chapter's own heading instead.
Links to documents *not* included in this particular book are left
untouched -- there's nothing better to point them at here.

A chapter's heading ID isn't just slugify(its title): Pandoc assigns
plain slugs to the *first* heading with a given text across the whole
concatenated document and suffixes every later duplicate (-1, -2, ...),
in document order. If some other chapter has a subsection that happens
to share a chapter's title text (as Talent Development Architecture's
"Socratic Leadership Seminar" subsection does with the standalone
Socratic Leadership Seminar chapter), the chapter's own heading can get
bumped to a suffixed ID. This script walks every heading in every
chapter, in manifest order, to reproduce that numbering before rewriting
any links -- rewriting to a bare slugify(title) guess would silently
point at the wrong place instead of raising an error.

Usage: rewrite_internal_links.py <chapter.md>... <output-dir>
Prints the rewritten file paths, one per line, in the same order given.
"""
import os
import re
import sys

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*\S)\s*$")
LINK_RE = re.compile(r"\]\(docs/(?:templates/)?([A-Za-z0-9._-]+)\.html\)")
INLINE_MARKUP_RE = re.compile(r"[`*_]")
INLINE_LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")


def clean_heading_text(text):
    text = INLINE_LINK_RE.sub(r"\1", text)
    text = INLINE_MARKUP_RE.sub("", text)
    return text


def slugify(title):
    s = clean_heading_text(title).strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s


def heading_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            m = HEADING_RE.match(line)
            if m:
                yield m.group(2)


def main():
    chapters = sys.argv[1:-1]
    out_dir = sys.argv[-1]
    os.makedirs(out_dir, exist_ok=True)

    # Simulate Pandoc's duplicate-heading-ID suffixing across the whole
    # concatenated document, then remember each chapter's OWN final ID
    # (from its first heading, i.e. its '# Title').
    seen_counts = {}
    chapter_final_id = {}
    for path in chapters:
        first = True
        for text in heading_lines(path):
            base = slugify(text)
            n = seen_counts.get(base, 0)
            final_id = base if n == 0 else f"{base}-{n}"
            seen_counts[base] = n + 1
            if first:
                chapter_final_id[path] = final_id
                first = False

    # Map the base slug a docs/*.html href would use back to whichever
    # chapter actually owns that title, so we can look up its real
    # (possibly suffixed) final ID.
    base_to_chapter = {}
    for path in chapters:
        for text in heading_lines(path):
            base_to_chapter.setdefault(slugify(text), path)
            break  # only the chapter's own H1 counts as "owning" a slug

    out_paths = []
    for path in chapters:
        with open(path, encoding="utf-8") as f:
            content = f.read()

        def replace(m):
            target_base = m.group(1).lower()
            target_chapter = base_to_chapter.get(target_base)
            if target_chapter is None:
                return m.group(0)
            return f"](#{chapter_final_id[target_chapter]})"

        rewritten = LINK_RE.sub(replace, content)
        out_path = os.path.join(out_dir, os.path.basename(path))
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(rewritten)
        out_paths.append(out_path)

    print("\n".join(out_paths))


if __name__ == "__main__":
    main()
