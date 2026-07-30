#!/usr/bin/env python3
"""Build the tabbed Framing Technical Work Before Design HTML page."""

from __future__ import annotations

import html
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "Framing-Technical-Work-Before-Design.md"
TEMPLATE = ROOT / "docs" / "Work-Intake-Is-an-Organizational-System.html"
TARGET = ROOT / "docs" / "Framing-Technical-Work-Before-Design.html"

TITLE = "Framing Technical Work Before Design"
SUBTITLE = (
    "A pre-design framework for classifying ambiguous work, producing decision-ready "
    "evidence, and testing whether an architecture is ready for commitment."
)

TABS = [
    {
        "id": "framing",
        "label": "Framing",
        "summary": "Rule, scaffold, discovery",
        "headings": [
            "1-usage",
            "2-the-five-box-framing-scaffold",
            "3-determine-whether-the-work-is-ready-for-design-or-execution",
            "4-discovery-package-template",
        ],
    },
    {
        "id": "gates",
        "label": "Design Gates",
        "summary": "Fitness, operations, failure",
        "headings": [
            "5-design-gate-well-defined-requirements",
            "6-design-gate-performance-failure-and-recovery",
            "7-design-gate-operational-impact-and-accountability",
            "8-manage-complexity-where-people-can-afford-it",
            "9-evaluate-tooling-and-flexibility-as-operating-decisions",
            "10-design-gate-pre-mortems",
        ],
    },
    {
        "id": "application",
        "label": "Application",
        "summary": "DNS example and foundations",
        "headings": [
            "11-design-informing-example-a-dns-service",
            "appendix-formal-concepts-behind-the-framework",
        ],
    },
]


def render_markdown() -> tuple[str, str]:
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
    body = re.sub(r"^<h1[^>]*>.*?</h1>\s*", "", result.stdout, count=1, flags=re.DOTALL)
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
        r'<img\s+src="assets/(images/framing-technical-work/[^"]+\.svg)"',
        add_image_dimensions,
        body,
    )

    figure_number = 0

    def number_figure(match: re.Match[str]) -> str:
        nonlocal figure_number
        figure_number += 1
        return f'{match.group(1)}<span class="figure-number">Figure {figure_number}.</span> '

    body = re.sub(r"(<figcaption[^>]*>)", number_figure, body)

    first_h2 = re.search(r'<h2\s+id="', body)
    if not first_h2:
        raise RuntimeError("The source contains no level-two sections")
    return body[: first_h2.start()].strip(), body[first_h2.start() :]


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
        '<div class="toc-title"><span class="toc-kicker">Architecture Framing</span>'
        f"{TITLE}</div>\n"
        + "\n".join(groups)
        + "\n</nav>"
    )
    tabbar = '<div class="tabbar">' + "".join(buttons) + "</div>"
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
    preface, body = render_markdown()
    sections, titles = split_h2_sections(body)
    nav, tabbar = build_navigation(titles)
    panels = build_panels(sections)
    header = (
        '<header class="doc-header">\n'
        '<a class="home-link" href="index.html">Return to home</a>\n'
        '<p class="eyebrow">Closed-Loop Organization</p>\n'
        f"<h1>{TITLE}</h1>\n"
        f'<p class="sub">{SUBTITLE}</p>\n'
        f"{preface}\n"
        "</header>"
    )

    page = TEMPLATE.read_text(encoding="utf-8")
    page = replace_once(page, r"<title>.*?</title>", f"<title>{TITLE}</title>")
    page = replace_once(page, r'<nav class="toc".*?</nav>', nav)
    page = replace_once(page, r'<header class="doc-header">.*?</header>', header)
    page = replace_once(page, r'<div class="tabbar">.*?</div>', tabbar)
    page = replace_once(page, r'<div class="panels">.*?</div>\s*</main>', panels + "\n</main>")
    TARGET.write_text(page, encoding="utf-8")
    print(f"Rebuilt {TARGET.relative_to(ROOT)} from {SOURCE.name}")


if __name__ == "__main__":
    main()
