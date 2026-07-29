#!/usr/bin/env python3
"""Rebuild the tabbed Work Intake HTML page from its Markdown source."""

from __future__ import annotations

import html
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "Work-Intake-Is-an-Organizational-System.md"
TARGET = ROOT / "docs" / "Work-Intake-Is-an-Organizational-System.html"

TABS = [
    {
        "id": "foundations",
        "label": "Foundations",
        "summary": "Front door, provenance, demand",
        "headings": [
            "thesis",
            "the-receiving-team-trap",
            "start-with-the-front-door",
            "provenance-before-convenience",
        ],
    },
    {
        "id": "proposal",
        "label": "Proposal",
        "summary": "Evidence, discovery, classification",
        "headings": [
            "what-a-work-proposal-must-prove",
            "discovery-and-implementation-are-different-commitments",
            "requesters-supply-facts-the-system-derives-consequences",
        ],
    },
    {
        "id": "review",
        "label": "Review",
        "summary": "Sequence, authority, decisions",
        "headings": [
            "review-is-ordered-modular-and-decisive",
            "review-decisions",
        ],
    },
    {
        "id": "authorization",
        "label": "Authorization",
        "summary": "Execution, capacity, forecasts",
        "headings": [
            "preparation-buys-execution-freedom",
            "from-proposal-to-authorized-work",
            "capacity-is-an-acceptance-decision",
            "delivery-changes-the-forecast-not-the-past",
        ],
    },
    {
        "id": "learning",
        "label": "Learning",
        "summary": "Reconciliation, practice, adoption",
        "headings": [
            "close-the-loop",
            "relationship-to-established-practice",
            "common-failure-modes",
            "starting-with-one-team",
            "appendix-scope-and-related-documents",
        ],
    },
]


def render_markdown() -> str:
    result = subprocess.run(
        [
            "pandoc",
            "--from=markdown+smart+gfm_auto_identifiers",
            "--to=html5",
            str(SOURCE),
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    body = result.stdout

    body = re.sub(
        r"^<h1[^>]*>.*?</h1>\s*<p><em>.*?</em></p>\s*",
        "",
        body,
        count=1,
        flags=re.DOTALL,
    )
    body = body.replace('src="docs/assets/', 'src="assets/')
    body = re.sub(r'href="(\./[^"]+)\.md"', r'href="\1.html"', body)

    def add_image_dimensions(match: re.Match[str]) -> str:
        relative_path = match.group(1)
        svg_path = ROOT / "docs" / "assets" / relative_path
        svg = svg_path.read_text(encoding="utf-8")
        viewbox = re.search(r'viewBox="0 0 ([0-9.]+) ([0-9.]+)"', svg)
        if not viewbox:
            raise RuntimeError(f"No usable viewBox in {svg_path}")
        width = round(float(viewbox.group(1)))
        height = round(float(viewbox.group(2)))
        return f'{match.group(0)} width="{width}" height="{height}"'

    body = re.sub(
        r'<img\s+src="assets/(images/work-intake/[^"]+\.svg)"',
        add_image_dimensions,
        body,
    )

    figure_number = 0

    def number_figure(match: re.Match[str]) -> str:
        nonlocal figure_number
        figure_number += 1
        return (
            f"{match.group(1)}"
            f'<span class="figure-number">Figure {figure_number}.</span> '
        )

    return re.sub(r"(<figcaption[^>]*>)", number_figure, body)


def split_h2_sections(body: str) -> tuple[dict[str, str], dict[str, str]]:
    starts = list(re.finditer(r'<h2\s+id="([^"]+)">', body))
    sections: dict[str, str] = {}
    titles: dict[str, str] = {}

    for index, match in enumerate(starts):
        section_id = match.group(1)
        end = starts[index + 1].start() if index + 1 < len(starts) else len(body)
        chunk = body[match.start() : end].strip()
        heading_match = re.match(r'<h2\s+id="[^"]+">(.*?)</h2>', chunk, flags=re.DOTALL)
        if not heading_match:
            raise RuntimeError(f"Could not read heading for {section_id}")
        title = re.sub(r"<[^>]+>", "", heading_match.group(1))
        titles[section_id] = html.unescape(" ".join(title.split()))
        sections[section_id] = chunk

    return sections, titles


def build_navigation(titles: dict[str, str]) -> tuple[str, str]:
    groups = []
    buttons = []
    for index, tab in enumerate(TABS):
        active = " active" if index == 0 else ""
        links = "\n".join(
            f'<li><a href="#{section_id}">{html.escape(titles[section_id])}</a></li>'
            for section_id in tab["headings"]
        )
        groups.append(
            f'<div class="toc-group{active}" data-tab="{tab["id"]}">\n'
            f'<button class="toc-tab" data-tab="{tab["id"]}">'
            f'{html.escape(tab["label"])}'
            f'<span class="toc-sub">{html.escape(tab["summary"])}</span>'
            f"</button>\n<ul class=\"toc-list\">\n{links}\n</ul>\n</div>"
        )
        buttons.append(
            f'<button class="tabbtn{active}" data-tab="{tab["id"]}">'
            f'{html.escape(tab["label"])}</button>'
        )

    nav = (
        '<nav class="toc" aria-label="Contents">\n'
        '<div class="toc-title"><span class="toc-kicker">Organizational Governance</span>'
        "Work Intake Is an Organizational System</div>\n"
        + "\n".join(groups)
        + "\n</nav>"
    )
    tabbar = '<div class="tabbar">\n' + "\n".join(buttons) + "\n</div>"
    return nav, tabbar


def build_panels(sections: dict[str, str]) -> str:
    expected = {heading for tab in TABS for heading in tab["headings"]}
    actual = set(sections)
    if actual != expected:
        missing = sorted(expected - actual)
        unassigned = sorted(actual - expected)
        raise RuntimeError(
            f"Update TABS before publishing. Missing: {missing}; unassigned: {unassigned}"
        )

    panels = []
    for index, tab in enumerate(TABS):
        active = " active" if index == 0 else ""
        content = "\n".join(sections[heading] for heading in tab["headings"])
        panels.append(
            f'<section class="panel{active}" id="tab-{tab["id"]}" '
            f'data-tab="{tab["id"]}">\n{content}\n</section>'
        )
    return '<div class="panels">\n' + "\n".join(panels) + "\n</div>"


def replace_once(source: str, pattern: str, replacement: str) -> str:
    updated, count = re.subn(pattern, lambda _: replacement, source, count=1, flags=re.DOTALL)
    if count != 1:
        raise RuntimeError(f"Expected one match for {pattern!r}; found {count}")
    return updated


def main() -> None:
    body = render_markdown()
    sections, titles = split_h2_sections(body)
    nav, tabbar = build_navigation(titles)
    panels = build_panels(sections)

    page = TARGET.read_text(encoding="utf-8")
    page = replace_once(page, r'<nav class="toc".*?</nav>', nav)
    page = replace_once(page, r'<div class="tabbar">.*?</div>', tabbar)
    page = replace_once(page, r'<div class="panels">.*?</div>\s*</main>', panels + "\n</main>")
    TARGET.write_text(page, encoding="utf-8")
    print(f"Rebuilt {TARGET.relative_to(ROOT)} from {SOURCE.name}")


if __name__ == "__main__":
    main()
