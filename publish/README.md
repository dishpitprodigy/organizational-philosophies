# PDF / EPUB publishing pipeline

Turns the root-level Markdown into typeset PDF and EPUB, styled like a
print nonfiction book rather than a reskin of the `docs/` website theme.
Built on Pandoc + XeLaTeX. `docs/` (the GitHub Pages site) is untouched by
any of this.

## Prerequisites

- `pandoc` (3.x) and `xelatex` on `PATH`.
- The `texlive-collection-latexextra` package (or at minimum: titlesec,
  titling, fancyhdr, booktabs, mdframed, framed, needspace, newunicodechar,
  microtype). On Fedora: `sudo dnf install texlive-collection-latexextra`.
- The `tex-gyre` font collection for PDF output (TeX Gyre Pagella / Heros /
  Cursor). Almost always present alongside the LaTeX packages above; if
  `fc-list | grep -i "tex gyre"` comes back empty, install
  `texlive-tex-gyre`. EPUB output doesn't need this system-wide — the same
  fonts are embedded from `publish/fonts/`.

## Typography

Body serif is TeX Gyre Pagella (a Palatino clone), headings are TeX Gyre
Heros (Helvetica), code/monospace is TeX Gyre Cursor (Courier) — the
classic technical-book trio, closer to O'Reilly/Pearson than to the site's
dark theme. One muted accent color (oxblood, `#7A1F2B`) marks links,
chapter numerals, and section rules; body text stays black/gray.

- `preamble.tex` / `chapter-style.tex` — shared LaTeX styling, pulled in
  via Pandoc's `include-in-header`.
- `epub.css` — the EPUB equivalent, using the same font families (embedded
  from `publish/fonts/*.otf` via `epub-fonts` in the defaults files).
- `pdf.yaml` / `epub.yaml` — single-document build settings.
- `book-pdf.yaml` / `book-epub.yaml` — combined-book build settings
  (`documentclass: book`, chapters instead of a flat section list).

## Usage

Single document → matching PDF + EPUB in `publish/output/`:

```
publish/bin/build-doc.sh "Talent-Development-Architecture.md"
```

The source file must open with a level-1 `# Title` heading — it's
stripped and promoted to the title page / EPUB metadata rather than also
rendering as an in-body heading. Everything from `##` down shifts up one
level to compensate.

Curated book (a hand-picked, ordered chapter list) → matching PDF + EPUB
in `publish/output/`:

```
publish/bin/build-book.sh publish/book/tda-collection.txt
```

Each book is defined by its own manifest file under `publish/book/` —
there's no single auto-generated "everything" book. A manifest is plain
text with a small metadata header followed by `chapters:` and one
repo-root-relative Markdown path per line, in reading order:

```
title: Book Title
subtitle: Optional subtitle
author: Optional author (defaults to Jon Wroblewski)
slug: output-file-basename
chapters:
path/to/chapter-one.md
path/to/chapter-two.md
```

Book chapters keep their own `# Title` as-is — it becomes a numbered
`\chapter`, so whatever's listed first is Chapter 1 (no foreword/preface
wrapper is inserted). To make a new book: copy an existing manifest
(`publish/book/full-corpus.txt` is the whole published corpus in
`docs/index.html`'s order; `publish/book/tda-collection.txt` is Talent
Development Architecture plus its implementation packet, the Socratic
Leadership Seminar, the career ladder, and the coaching/calibration
guide), edit the header and chapter list, and point the script at it.

A chapter doesn't have to already live in the corpus — it just has to be
a Markdown file with a `# Title` heading, reachable by a repo-root-relative
path at build time.

Both scripts `cd` to the repo root themselves, so run them from anywhere.
`publish/output/` is gitignored; outputs are build artifacts, not checked
in. Re-run the scripts any time the source Markdown changes.

## Known limitation

`Writing Work Items - Epics, Stories, and Tasks.md` and
`Process-Improvement-Framework.md` write their own manual heading numbers
("## 1. Why this exists"). In the book build, LaTeX's own numbering
stacks on top of that ("5.5 3. Writing outcomes (for epics)" instead of
just "5.5"). Cosmetic only — headings, links, and the TOC all still work
correctly — but it's not pretty. If it's worth fixing, the real fix is
dropping the manual "N. " prefixes from those two files' headings and
letting LaTeX/number-sections number them, rather than anything in this
pipeline.

## Extending

- New symbol shows up as a "Missing character" warning during a PDF
  build? Add a `\newunicodechar` line in `preamble.tex` next to the
  existing ones, pointing at a font that has it (`fc-list :charset=<hex>`
  finds candidates).
- Want a different accent color or fonts? Edit the `\definecolor{accent}`
  line and the `mainfont`/`sansfont`/`monofont` variables in `pdf.yaml`
  and `book-pdf.yaml`. Match `epub.css` and the font files copied into
  `publish/fonts/` for EPUB parity.
