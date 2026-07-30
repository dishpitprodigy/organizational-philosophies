# Closing the Loop: Preview Manuscript

This directory contains a book-specific assembly of the organizational-philosophy corpus. The source articles remain unchanged in the repository root. This preview cuts, merges, and redistributes their material according to `0.Organizational-Excellence-Book-Gaps.md`.

Start here:

- [manuscript.md](manuscript.md) is the complete Markdown preview.
- [frontmatter/working-glossary.md](frontmatter/working-glossary.md) fixes the current distinctions among decision states, evidence records, completion terms, and trust boundaries.
- [source-map.md](source-map.md) records where each chapter came from and which chapters are provisional.
- [editorial-redundancy-notes.md](editorial-redundancy-notes.md) distinguishes useful recurrence from article-style restatement, overlapping mechanisms, and reference material that inflates the physical book.
- `parts/` contains the reader-journey dividers that organize the source cuts into a book rather than a flat article collection.
- `chapters/` contains the narrative chapter cuts.
- `appendices/` contains worksheets, templates, case studies, and selected reference material.
- `output/closing-the-loop-preview.pdf` and `output/closing-the-loop-preview.epub` are generated reading copies.

## Editorial-note convention

Visible blockquotes labeled **Preview note — future edition** mark a real source or synthesis gap. They are part of this preview so the reader can see where the current argument changes altitude, depends on a missing operating mechanism, or ends before the promised loop is complete.

These notes are not claims that every gap needs a standalone chapter. A future edition may close one by adding a section, merging another source, moving an instrument, or deleting a seam that only exists because the current articles were written independently.

## Rebuild

From the repository root:

```bash
python3 book-preview/assemble.py
book-preview/build.sh
```

`assemble.py` regenerates the part dividers, chapter cuts, appendices, manuscript, manifest, source map, and copied figure assets from the root-level source documents. `build.sh` creates the PDF and EPUB inside `book-preview/output/`.

Generated reading copies in `output/` are ignored by Git. The assembled Markdown is tracked so the preview can be reviewed without rebuilding it.
