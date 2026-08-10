#!/usr/bin/env python3
"""Build two SVG prototypes for the book's canonical organizational method."""

from __future__ import annotations

from html import escape
from pathlib import Path
import textwrap


OUT = Path(__file__).resolve().parent

INK = "#122033"
MUTED = "#506176"
LINE = "#24364b"
PAPER = "#f7f8fa"
WHITE = "#ffffff"

STAGES = [
    ("Observation", "#dce7f2", "#315c82"),
    ("Question", "#d9e9fb", "#2f6ea6"),
    ("Background research", "#dcefe8", "#32755e"),
    ("Hypothesis", "#fff0c9", "#9a6a00"),
    ("Adaptive business implementation", "#dff2d9", "#477b37"),
    ("Results", "#ffe2d8", "#a64f33"),
    ("Examine and reconcile", "#e7def7", "#6a4e9f"),
    ("Communicate and route", "#d8eff0", "#34767a"),
    ("Change knowledge, system, or next decision", "#dbe1f5", "#455b9b"),
]


def wrap_lines(value: str, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in value.split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=width) or [""])
    return lines


def text_block(
    x: float,
    y: float,
    value: str,
    *,
    width: int = 30,
    size: int = 26,
    line_height: int | None = None,
    weight: int = 500,
    fill: str = INK,
    anchor: str = "middle",
    family: str = "Inter, Liberation Sans, Arial, sans-serif",
) -> str:
    lines = wrap_lines(value, width)
    line_height = line_height or int(size * 1.2)
    first_y = y - ((len(lines) - 1) * line_height / 2)
    spans = []
    for index, line in enumerate(lines):
        dy = 0 if index == 0 else line_height
        spans.append(
            f'<tspan x="{x:.1f}" dy="{dy}">{escape(line)}</tspan>'
        )
    return (
        f'<text x="{x:.1f}" y="{first_y:.1f}" text-anchor="{anchor}" '
        f'font-family="{family}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}">'
        + "".join(spans)
        + "</text>"
    )


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    *,
    fill: str = WHITE,
    stroke: str = LINE,
    stroke_width: int = 3,
    radius: int = 20,
    dash: str | None = None,
    shadow: bool = False,
) -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    shadow_attr = ' filter="url(#shadow)"' if shadow else ""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"'
        f'{dash_attr}{shadow_attr}/>'
    )


def arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    *,
    dash: str | None = None,
    width: int = 4,
    color: str = LINE,
) -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
        f'stroke="{color}" stroke-width="{width}" fill="none" '
        f'marker-end="url(#arrow)"{dash_attr}/>'
    )


def path_arrow(
    d: str,
    *,
    dash: str | None = None,
    width: int = 4,
    color: str = LINE,
) -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="{d}" stroke="{color}" stroke-width="{width}" fill="none" '
        f'stroke-linecap="round" stroke-linejoin="round" '
        f'marker-end="url(#arrow)"{dash_attr}/>'
    )


def svg_start(width: int, height: int, title: str, description: str) -> list[str]:
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" '
            f'height="{height}" viewBox="0 0 {width} {height}" role="img" '
            f'aria-labelledby="title description">'
        ),
        f'<title id="title">{escape(title)}</title>',
        f'<desc id="description">{escape(description)}</desc>',
        "<defs>",
        (
            '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" '
            'markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
            f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{LINE}"/></marker>'
        ),
        (
            '<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">'
            '<feDropShadow dx="0" dy="4" stdDeviation="5" '
            'flood-color="#122033" flood-opacity="0.14"/></filter>'
        ),
        "</defs>",
        f'<rect width="{width}" height="{height}" fill="{PAPER}"/>',
    ]


def write_svg(path: Path, content: list[str]) -> None:
    path.write_text("\n".join(content + ["</svg>", ""]), encoding="utf-8")


def build_canonical() -> None:
    width, height = 1600, 2200
    svg = svg_start(
        width,
        height,
        "Canonical Organizational Method",
        (
            "A closed-loop organizational method beginning with observation, "
            "question, research, and hypothesis. Business expands the scientific "
            "experiment into adaptive implementation, then produces results that "
            "must be examined, reconciled, communicated, and used to change the "
            "system or next decision."
        ),
    )

    svg.append(
        text_block(
            width / 2,
            64,
            "Canonical Organizational Method",
            width=45,
            size=42,
            weight=750,
        )
    )
    svg.append(
        text_block(
            width / 2,
            116,
            (
                "The scientific method with an outcome-directed, adaptive "
                "business implementation phase"
            ),
            width=85,
            size=24,
            weight=450,
            fill=MUTED,
        )
    )

    center_x, box_w, box_h = 450, 700, 104
    top_stages = [
        (0, 165, "Notice a condition"),
        (1, 320, "Ask a question"),
        (2, 475, "Investigate the current and external state"),
        (3, 630, "Form a hypothesis"),
    ]
    for stage_index, y, label in top_stages:
        fill, stroke = STAGES[stage_index][1], STAGES[stage_index][2]
        svg.append(
            rect(
                center_x,
                y,
                box_w,
                box_h,
                fill=fill,
                stroke=stroke,
                shadow=True,
            )
        )
        svg.append(
            text_block(
                center_x + 62,
                y + box_h / 2,
                str(stage_index + 1),
                size=27,
                weight=750,
                fill=stroke,
            )
        )
        svg.append(
            text_block(
                center_x + box_w / 2 + 28,
                y + box_h / 2,
                label,
                width=38,
                size=28,
                weight=700,
            )
        )

    for y in (269, 424, 579):
        svg.append(arrow(width / 2, y + 8, width / 2, y + 44))

    # An observation may be retained without creating work.
    side_x, side_y, side_w, side_h = 1200, 155, 315, 150
    svg.append(
        rect(
            side_x,
            side_y,
            side_w,
            side_h,
            fill=WHITE,
            stroke=STAGES[0][2],
            dash="10 8",
            radius=18,
        )
    )
    svg.append(
        text_block(
            side_x + side_w / 2,
            side_y + side_h / 2,
            "May remain background context.\nNo question or action required.",
            width=26,
            size=22,
            weight=600,
        )
    )
    svg.append(
        arrow(
            center_x + box_w,
            217,
            side_x,
            217,
            dash="10 8",
            width=3,
            color=STAGES[0][2],
        )
    )

    # Business implementation expands the scientific experiment.
    impl_x, impl_y, impl_w, impl_h = 115, 785, 1370, 590
    impl_fill, impl_stroke = STAGES[4][1], STAGES[4][2]
    svg.append(
        rect(
            impl_x,
            impl_y,
            impl_w,
            impl_h,
            fill="#f4faF1",
            stroke=impl_stroke,
            stroke_width=4,
            radius=28,
            shadow=True,
        )
    )
    svg.append(
        text_block(
            impl_x + 75,
            impl_y + 55,
            "5",
            size=28,
            weight=750,
            fill=impl_stroke,
        )
    )
    svg.append(
        text_block(
            width / 2,
            impl_y + 52,
            "Adaptive Business Implementation",
            width=45,
            size=34,
            weight=750,
        )
    )
    svg.append(
        text_block(
            width / 2,
            impl_y + 98,
            (
                "Science runs a controlled experiment here. Business funds an "
                "intervention intended to make a desired condition true."
            ),
            width=94,
            size=20,
            weight=450,
            fill=MUTED,
        )
    )
    svg.append(arrow(width / 2, 734, width / 2, impl_y))

    internal = [
        (170, 930, "Define desired outcome\nand guardrails"),
        (620, 930, "Authorize capacity\nand risk"),
        (1070, 930, "Decompose the\nintervention"),
        (170, 1145, "Implement a\nbounded increment"),
        (620, 1145, "Inspect and test\nthe increment"),
        (1070, 1145, "Update approach\nand forecast"),
    ]
    card_w, card_h = 355, 118
    for x, y, label in internal:
        svg.append(
            rect(
                x,
                y,
                card_w,
                card_h,
                fill=impl_fill,
                stroke=impl_stroke,
                stroke_width=3,
                radius=18,
            )
        )
        svg.append(
            text_block(
                x + card_w / 2,
                y + card_h / 2,
                label,
                width=25,
                size=22,
                weight=650,
            )
        )

    svg.extend(
        [
            arrow(525, 989, 620, 989, width=3),
            arrow(975, 989, 1070, 989, width=3),
            path_arrow("M 1247 1048 L 1247 1095 L 347 1095 L 347 1145", width=3),
            arrow(525, 1204, 620, 1204, width=3),
            arrow(975, 1204, 1070, 1204, width=3),
            path_arrow(
                "M 1247 1263 L 1247 1322 L 347 1322 L 347 1263",
                dash="10 8",
                width=3,
                color=impl_stroke,
            ),
        ]
    )
    svg.append(
        text_block(
            800,
            1345,
            "Repeat while evidence supports another increment",
            width=60,
            size=19,
            weight=600,
            fill=impl_stroke,
        )
    )

    lower = [
        (5, 1460, "Produce results"),
        (6, 1615, "Examine, analyze, and reconcile results"),
        (7, 1770, "Communicate and route results"),
        (8, 1925, "Change knowledge, the system, or the next decision"),
    ]
    for stage_index, y, label in lower:
        fill, stroke = STAGES[stage_index][1], STAGES[stage_index][2]
        svg.append(
            rect(
                center_x,
                y,
                box_w,
                box_h,
                fill=fill,
                stroke=stroke,
                shadow=True,
            )
        )
        svg.append(
            text_block(
                center_x + 62,
                y + box_h / 2,
                str(stage_index + 1),
                size=27,
                weight=750,
                fill=stroke,
            )
        )
        svg.append(
            text_block(
                center_x + box_w / 2 + 28,
                y + box_h / 2,
                label,
                width=42,
                size=27,
                weight=700,
            )
        )

    svg.append(
        path_arrow(
            "M 1247 1263 L 1247 1410 L 800 1410 L 800 1460",
            width=4,
        )
    )
    svg.append(
        text_block(
            1325,
            1402,
            "Complete, stop,\nor disprove",
            width=18,
            size=19,
            weight=600,
            fill=MUTED,
        )
    )
    for y in (1564, 1719, 1874):
        svg.append(arrow(width / 2, y + 8, width / 2, y + 44))

    svg.append(
        path_arrow(
            "M 450 1977 C 210 1977 145 1860 145 1650 "
            "L 145 360 C 145 230 245 217 450 217",
            width=5,
            color=STAGES[8][2],
        )
    )
    svg.append(
        text_block(
            250,
            2070,
            "The changed context produces future observations and questions.",
            width=48,
            size=21,
            weight=650,
            fill=STAGES[8][2],
            anchor="start",
        )
    )
    svg.append(
        text_block(
            width / 2,
            2150,
            (
                "Observation may stop without action. Results produced by an "
                "intentional intervention must be examined."
            ),
            width=100,
            size=22,
            weight=700,
            fill=INK,
        )
    )

    write_svg(OUT / "canonical-organizational-method.svg", svg)


def build_crosswalk() -> None:
    width, height = 2800, 2080
    svg = svg_start(
        width,
        height,
        "Organizational Method Domain Crosswalk",
        (
            "A graphical crosswalk mapping hiring, work intake, vendor acquisition, "
            "talent development, defect correction, and managed runoff onto the "
            "same nine-stage organizational method."
        ),
    )
    svg.append(
        text_block(
            width / 2,
            66,
            "One Method, Six Organizational Domains",
            width=60,
            size=42,
            weight=750,
        )
    )
    svg.append(
        text_block(
            width / 2,
            118,
            (
                "Domain records and authorities differ; the inquiry, "
                "implementation, and reconciliation architecture does not."
            ),
            width=100,
            size=24,
            weight=450,
            fill=MUTED,
        )
    )

    domains = [
        "Hiring",
        "Work intake",
        "Vendor acquisition",
        "Talent development",
        "Defect correction",
        "Managed runoff",
    ]
    domain_groups = [
        [
            (0, 1, "Capability need"),
            (2, 3, "Role reality\n+\nCandidate forecast"),
            (4, 4, "Selection + onboarding"),
            (5, 5, "Live work"),
            (6, 7, "Post-hire reconciliation"),
            (8, 8, "Change role, support,\nor hiring system"),
        ],
        [
            (0, 1, "Observed demand"),
            (2, 3, "Authenticated need\n+\nProposal claim"),
            (4, 4, "Authorize + deliver"),
            (5, 5, "Delivered condition"),
            (6, 7, "Acceptance + benefits review"),
            (8, 8, "Continue, change, stop,\nor reprioritize"),
        ],
        [
            (0, 1, "External capability gap"),
            (2, 3, "Buyer requirements\n+\nVendor claim"),
            (4, 4, "RFP, POC, contract\n+ implementation"),
            (5, 5, "Burn-in + operation"),
            (6, 7, "Acceptance + post-implementation review"),
            (8, 8, "Renew, remediate,\nor replace"),
        ],
        [
            (0, 1, "Capability or utilization signal"),
            (2, 3, "Target capability\n+\nSafe-reps hypothesis"),
            (4, 4, "Assign, coach + support"),
            (5, 5, "Demonstrated behavior"),
            (6, 7, "Calibration + development review"),
            (8, 8, "More scope, practice,\nsupport, or reassignment"),
        ],
        [
            (0, 1, "Failure or nonconformance"),
            (2, 3, "Cause analysis\n+\nCorrection hypothesis"),
            (4, 4, "Contain, correct,\ntest + deploy"),
            (5, 5, "Post-correction behavior"),
            (6, 7, "Conformity + guardrail review"),
            (8, 8, "Close, reopen,\nor revise"),
        ],
        [
            (0, 1, "Liability or exit signal"),
            (2, 3, "Exposure inventory\n+\nRunoff hypothesis"),
            (4, 4, "Freeze, migrate + retire"),
            (5, 5, "Remaining dependency + risk"),
            (6, 7, "Exit checkpoint + routed evidence"),
            (8, 8, "Kill, extend, or\napprove exception"),
        ],
    ]

    left = 70
    stage_w = 330
    gap = 14
    domain_w = 380
    domain_x = [left + stage_w + 24 + i * (domain_w + gap) for i in range(6)]
    header_y = 165
    row_y = 265
    row_h = 174
    row_gap = 14
    stage_display = [
        "Observation",
        "Question",
        "Background\nresearch",
        "Hypothesis",
        "Adaptive business\nimplementation",
        "Results",
        "Examine\nand reconcile",
        "Communicate\nand route",
        "Change knowledge,\nsystem, or next decision",
    ]

    svg.append(
        rect(
            left,
            header_y,
            stage_w,
            78,
            fill=INK,
            stroke=INK,
            radius=16,
        )
    )
    svg.append(
        text_block(
            left + stage_w / 2,
            header_y + 39,
            "Canonical stage",
            width=25,
            size=24,
            weight=700,
            fill=WHITE,
        )
    )
    for x, domain in zip(domain_x, domains):
        svg.append(
            rect(x, header_y, domain_w, 78, fill=INK, stroke=INK, radius=16)
        )
        svg.append(
            text_block(
                x + domain_w / 2,
                header_y + 39,
                domain,
                width=26,
                size=23,
                weight=700,
                fill=WHITE,
            )
        )

    for stage_index, (stage_name, fill, stroke) in enumerate(STAGES):
        y = row_y + stage_index * (row_h + row_gap)
        svg.append(
            rect(
                left - 12,
                y - 6,
                width - 2 * left + 24,
                row_h + 12,
                fill=fill,
                stroke=fill,
                stroke_width=0,
                radius=18,
            )
        )
        svg.append(
            rect(
                left,
                y,
                stage_w,
                row_h,
                fill=fill,
                stroke=stroke,
                stroke_width=4,
                radius=18,
                shadow=True,
            )
        )
        svg.append(
            text_block(
                left + 45,
                y + row_h / 2,
                str(stage_index + 1),
                size=29,
                weight=750,
                fill=stroke,
            )
        )
        svg.append(
            text_block(
                left + stage_w / 2 + 28,
                y + row_h / 2,
                stage_display[stage_index],
                width=20,
                size=21,
                line_height=25,
                weight=700,
            )
        )
        if stage_index < len(STAGES) - 1:
            svg.append(
                arrow(
                    left + stage_w / 2,
                    y + row_h,
                    left + stage_w / 2,
                    y + row_h + row_gap,
                    width=3,
                    color=stroke,
                )
            )

    # Domain blocks span canonical stages the way TCP/IP layers span OSI layers.
    stride = row_h + row_gap
    for domain_index, x in enumerate(domain_x):
        for start, end, label in domain_groups[domain_index]:
            y = row_y + start * stride + 10
            h = (end - start + 1) * row_h + (end - start) * row_gap - 20
            stroke = STAGES[start][2]
            fill = STAGES[start][1]
            svg.append(
                rect(
                    x,
                    y,
                    domain_w,
                    h,
                    fill=fill,
                    stroke=stroke,
                    stroke_width=3,
                    radius=16,
                    shadow=True,
                )
            )
            svg.append(
                text_block(
                    x + domain_w / 2,
                    y + h / 2,
                    label,
                    width=29,
                    size=22 if start != end else 20,
                    line_height=26,
                    weight=680,
                )
            )

    final_stage_center_y = row_y + 8 * (row_h + row_gap) + row_h / 2
    observation_center_y = row_y + row_h / 2
    svg.append(
        path_arrow(
            f"M {left} {final_stage_center_y} "
            f"C 18 {final_stage_center_y}, 18 {observation_center_y}, "
            f"{left} {observation_center_y}",
            width=4,
            color=STAGES[8][2],
        )
    )
    svg.append(
        text_block(
            width / 2,
            2020,
            (
                "The final decision changes the conditions from which the next "
                "observation or question emerges."
            ),
            width=100,
            size=23,
            weight=700,
            fill=INK,
        )
    )

    write_svg(OUT / "organizational-method-domain-crosswalk.svg", svg)


def main() -> None:
    build_canonical()
    build_crosswalk()
    print("Built canonical-organizational-method.svg")
    print("Built organizational-method-domain-crosswalk.svg")


if __name__ == "__main__":
    main()
