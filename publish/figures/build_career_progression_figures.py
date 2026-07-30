#!/usr/bin/env python3
"""Generate SVG figures for the Career Progression Guide."""

from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "assets" / "images" / "career-progression"

PAPER = "#f5efdc"
INK = "#111111"
MUTED = "#5f5a4e"
LIGHT = "#ddd5bf"
RED = "#ad0034"
CYAN = "#007f7b"
YELLOW = "#dcc61e"
GREEN = "#2f7d32"
WHITE = "#fffdf5"


class Figure:
    def __init__(self, title: str, subtitle: str, *, height: int = 760):
        self.width = 1200
        self.height = height
        self.parts = [
            (
                f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'viewBox="0 0 {self.width} {self.height}" role="img" '
                f'aria-labelledby="title desc">'
            ),
            f'<title id="title">{escape(title)}</title>',
            f'<desc id="desc">{escape(subtitle)}</desc>',
            """
<defs>
  <marker id="arrow-ink" markerWidth="10" markerHeight="10" refX="8.85" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#111111"/>
  </marker>
  <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8.85" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#ad0034"/>
  </marker>
  <style>
    text { font-family: "Helvetica Neue", Arial, sans-serif; }
  </style>
</defs>
""",
            f'<rect width="{self.width}" height="{self.height}" fill="{PAPER}"/>',
            (
                f'<rect x="18" y="18" width="{self.width - 36}" height="{self.height - 36}" '
                f'fill="none" stroke="{INK}" stroke-width="2"/>'
            ),
        ]
        self.text(58, 62, ["CAREER PROGRESSION"], 15, 800, fill=RED, spacing=1.8)
        self.text(58, 104, [title], 34, 800)
        self.text(58, 134, [subtitle], 17, 400, fill=MUTED)
        self.line(58, 154, 1142, 154, width=2)

    def add(self, value: str) -> None:
        self.parts.append(value)

    def text(
        self,
        x: float,
        y: float,
        lines: list[str],
        size: int = 16,
        weight: int = 400,
        *,
        fill: str = INK,
        anchor: str = "start",
        leading: int | None = None,
        spacing: float = 0,
    ) -> None:
        leading = leading or int(size * 1.3)
        attrs = (
            f'x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{spacing}"'
        )
        spans = []
        for index, line in enumerate(lines):
            spans.append(f'<tspan x="{x}" dy="{0 if index == 0 else leading}">{escape(line)}</tspan>')
        self.add(f"<text {attrs}>{''.join(spans)}</text>")

    def line(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        *,
        color: str = INK,
        width: int = 3,
        dash: str | None = None,
        marker: str | None = None,
    ) -> None:
        attrs = (
            f'x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{color}" stroke-width="{width}"'
        )
        if dash:
            attrs += f' stroke-dasharray="{dash}"'
        if marker:
            attrs += f' marker-end="url(#{marker})"'
        self.add(f"<line {attrs}/>")

    def path(
        self,
        points: list[tuple[float, float]],
        *,
        color: str = INK,
        width: int = 3,
        dash: str | None = None,
        marker: str | None = None,
    ) -> None:
        attrs = (
            f'd="M{" L".join(f"{x},{y}" for x, y in points)}" fill="none" '
            f'stroke="{color}" stroke-width="{width}"'
        )
        if dash:
            attrs += f' stroke-dasharray="{dash}"'
        if marker:
            attrs += f' marker-end="url(#{marker})"'
        self.add(f"<path {attrs}/>")

    def rect(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        *,
        fill: str = WHITE,
        stroke: str = INK,
        width: int = 2,
        dash: str | None = None,
    ) -> None:
        attrs = (
            f'x="{x}" y="{y}" width="{w}" height="{h}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"'
        )
        if dash:
            attrs += f' stroke-dasharray="{dash}"'
        self.add(f"<rect {attrs}/>")

    def label(self, x: float, y: float, value: str, *, fill: str = MUTED) -> None:
        self.text(x, y, [value.upper()], 12, 800, fill=fill, spacing=1.1)

    def note(self, value: str) -> None:
        self.line(58, self.height - 64, 1142, self.height - 64, color=LIGHT, width=2)
        self.text(58, self.height - 37, [value], 14, 600, fill=MUTED)

    def save(self, name: str) -> None:
        self.parts.append("</svg>")
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / name).write_text("\n".join(self.parts) + "\n", encoding="utf-8")


def four_separate_judgments() -> None:
    f = Figure(
        "One review, four separate judgments",
        "Each question uses different evidence and produces a different decision.",
        height=790,
    )
    f.rect(58, 184, 1084, 52, fill=WHITE, stroke=INK, width=2)
    f.label(600, 205, "Shared body of review evidence", fill=RED)
    f.text(
        600,
        225,
        ["Written outcomes • observed behavior • role context • agreed expectations"],
        14,
        600,
        fill=MUTED,
        anchor="middle",
    )

    cards = [
        (
            58,
            "01",
            "Career level",
            ["What scope and", "operating model describe", "the sustained work?"],
            "LEVEL",
            CYAN,
        ),
        (
            330,
            "02",
            "Period performance",
            ["How effectively were", "current-level expectations", "met this period?"],
            "PERFORMANCE RATING",
            RED,
        ),
        (
            602,
            "03",
            "Growth trajectory",
            ["What is changing, and", "what development should", "come next?"],
            "DEVELOPMENT PLAN",
            YELLOW,
        ),
        (
            874,
            "04",
            "Opportunity",
            ["Did the role provide", "scope at the target", "level?"],
            "SCOPE ACTION",
            GREEN,
        ),
    ]
    for x, number, title, question, output, accent in cards:
        center = x + 118
        f.line(center, 236, center, 272, color=accent, width=3)
        f.rect(x, 272, 236, 352, fill=WHITE, stroke=accent, width=3)
        f.rect(x, 272, 48, 40, fill=accent, stroke=accent, width=2)
        f.text(x + 24, 298, [number], 15, 800, fill=WHITE, anchor="middle")
        f.text(x + 18, 350, [title], 18, 800)
        f.line(x + 18, 366, x + 218, 366, color=LIGHT, width=2)
        f.label(x + 18, 398, "Question")
        f.text(x + 18, 429, question, 15, 500, fill=MUTED, leading=22)
        f.rect(x + 18, 548, 200, 52, fill=accent, stroke=accent, width=2)
        output_text = WHITE if accent != YELLOW else INK
        f.text(center, 580, [output], 12, 800, fill=output_text, anchor="middle", spacing=0.8)

    f.rect(264, 652, 672, 50, fill=WHITE, stroke=RED, width=3)
    f.text(
        600,
        683,
        ["DO NOT AVERAGE THESE INTO ONE LABEL"],
        15,
        800,
        fill=RED,
        anchor="middle",
        spacing=1.1,
    )
    f.note("A promotion decision can be incomplete without making current-level performance deficient.")
    f.save("four-separate-judgments.svg")


def operating_model_progression() -> None:
    f = Figure(
        "Progression changes the operating model",
        "Higher levels widen ownership and create results through increasing organizational leverage.",
        height=850,
    )

    stages = [
        (
            58,
            "EARLIER LEVELS",
            "IC1–IC3",
            CYAN,
            ["Task, procedure,", "or component"],
            ["Receives the task;", "follows a known path"],
            ["Direct execution"],
            ["Local system", "Hours to weeks"],
        ),
        (
            410,
            "SENIOR LEVELS",
            "IC4–IC5",
            YELLOW,
            ["Project, service outcome,", "or team roadmap"],
            ["Chooses the approach;", "defines the delivery plan"],
            ["Leads projects and", "coordinates contributors"],
            ["Team or domain", "Weeks to quarters"],
        ),
        (
            762,
            "STAFF+ LEVELS",
            "IC6–IC9",
            RED,
            ["Cross-team capability,", "portfolio, or direction"],
            ["Identifies the problem;", "creates the workstream"],
            ["Influence, standards,", "delegation, other leaders"],
            ["Cross-team to enterprise", "Multiple quarters to years"],
        ),
    ]

    for x, stage, grades, accent, ownership, definition, execution, horizon in stages:
        f.rect(x, 202, 320, 508, fill=WHITE, stroke=accent, width=3)
        f.rect(x, 202, 320, 66, fill=accent, stroke=accent, width=2)
        header_text = WHITE if accent != YELLOW else INK
        f.text(x + 18, 229, [stage], 13, 800, fill=header_text, spacing=1.0)
        f.text(x + 302, 249, [grades], 15, 800, fill=header_text, anchor="end")

        sections = [
            (300, "Unit of ownership", ownership),
            (410, "Problem definition", definition),
            (520, "Results through", execution),
            (630, "Typical horizon", horizon),
        ]
        for y, label, body in sections:
            f.label(x + 18, y, label, fill=accent)
            f.text(x + 18, y + 31, body, 16, 600, fill=INK, leading=22)
            if y < 630:
                f.line(x + 18, y + 84, x + 302, y + 84, color=LIGHT, width=2)

    f.line(378, 456, 400, 456, color=INK, width=3, marker="arrow-ink")
    f.line(730, 456, 752, 456, color=INK, width=3, marker="arrow-ink")
    f.label(600, 750, "The shift", fill=RED)
    f.text(
        600,
        779,
        ["Assigned work  →  owned outcomes  →  created organizational scope"],
        18,
        800,
        anchor="middle",
    )
    f.note("Progression is a change in ownership and leverage, not simply an increase in technical difficulty.")
    f.save("operating-model-progression.svg")


def scope_gap_diagnostic() -> None:
    f = Figure(
        "Diagnose the gap before assigning the rating",
        "Capability and opportunity require different evidence, owners, and corrective actions.",
        height=870,
    )

    f.label(700, 188, "Was target-level scope available and authorized?", fill=RED)
    f.rect(290, 204, 410, 64, fill=CYAN, stroke=CYAN, width=2)
    f.rect(700, 204, 410, 64, fill=RED, stroke=RED, width=2)
    f.text(495, 244, ["YES"], 16, 800, fill=WHITE, anchor="middle", spacing=1.2)
    f.text(905, 244, ["NO"], 16, 800, fill=WHITE, anchor="middle", spacing=1.2)

    row_headers = [
        (288, "TARGET-LEVEL OPERATION", ["DEMONSTRATED"]),
        (502, "NOT YET DEMONSTRATED", ["OR NOT EVIDENCED"]),
    ]
    for y, line1, line2 in row_headers:
        f.rect(58, y, 232, 214, fill=INK, stroke=INK, width=2)
        f.text(174, y + 89, [line1], 12, 800, fill=WHITE, anchor="middle", spacing=0.8)
        f.text(174, y + 116, line2, 12, 800, fill=WHITE, anchor="middle", spacing=0.8)

    cells = [
        (
            290,
            288,
            "Promotion assessment",
            ["Compare sustained evidence", "to the target level; confirm", "organizational need."],
            GREEN,
        ),
        (
            700,
            288,
            "Scope-starvation risk",
            ["Recognize evidence already", "shown; fix the role, placement,", "or withheld authority."],
            RED,
        ),
        (
            290,
            502,
            "Capability gap",
            ["Name the missing dimension;", "coach against observable", "evidence and expectations."],
            YELLOW,
        ),
        (
            700,
            502,
            "Opportunity gap",
            ["Capability cannot be inferred;", "create scope or state the", "role ceiling explicitly."],
            CYAN,
        ),
    ]
    for x, y, title, body, accent in cells:
        f.rect(x, y, 410, 214, fill=WHITE, stroke=accent, width=3)
        f.rect(x, y, 12, 214, fill=accent, stroke=accent, width=0)
        f.text(x + 32, y + 48, [title], 21, 800)
        f.line(x + 32, y + 67, x + 378, y + 67, color=LIGHT, width=2)
        f.text(x + 32, y + 101, body, 16, 500, fill=MUTED, leading=23)

    f.rect(206, 748, 936, 52, fill=WHITE, stroke=INK, width=2, dash="8 6")
    f.label(230, 769, "If the evidence is unclear", fill=RED)
    f.text(
        1120,
        782,
        ["Collect it; do not default to a lower level."],
        15,
        700,
        fill=INK,
        anchor="end",
    )
    f.note("The person who controls access to scope must not score its absence as a capability deficiency.")
    f.save("scope-gap-diagnostic.svg")


def promotion_evidence_chain() -> None:
    f = Figure(
        "A promotion case must show causation",
        "A reader should be able to trace the contribution from the original problem to a result that persists.",
        height=790,
    )

    stages = [
        ("01", "Problem", ["What needed", "to change?"], ["Baseline", "Consequence"], RED),
        ("02", "Ownership", ["What did the", "person own?"], ["Objective", "Scope • authority"], CYAN),
        ("03", "Decisions", ["What judgment", "did they add?"], ["Tradeoffs", "Direction"], YELLOW),
        ("04", "Adoption", ["Who changed", "behavior?"], ["Teams • leaders", "Systems"], CYAN),
        ("05", "Durable outcome", ["What continued", "afterward?"], ["Measured change", "Owner • mechanism"], GREEN),
    ]
    xs = [58, 276, 494, 712, 930]
    for x, (number, title, question, evidence, accent) in zip(xs, stages):
        f.rect(x, 220, 184, 262, fill=WHITE, stroke=accent, width=3)
        f.rect(x, 220, 44, 36, fill=accent, stroke=accent, width=2)
        number_text = WHITE if accent != YELLOW else INK
        f.text(x + 22, 244, [number], 13, 800, fill=number_text, anchor="middle")
        f.text(x + 16, 295, [title], 18, 800)
        f.text(x + 16, 333, question, 15, 500, fill=MUTED, leading=21)
        f.line(x + 16, 384, x + 168, 384, color=LIGHT, width=2)
        f.label(x + 16, 411, "Evidence", fill=accent)
        f.text(x + 16, 439, evidence, 13, 700, fill=INK, leading=19)

    for x in xs[:-1]:
        f.line(x + 184, 351, x + 208, 351, color=INK, width=3, marker="arrow-ink")

    f.label(58, 535, "Evidence foundation", fill=RED)
    foundations = [
        (58, "Artifacts", "Charters • designs • decisions"),
        (420, "Measures", "Before/after • risk • capacity"),
        (782, "Attribution", "Stakeholders • adoption • ownership"),
    ]
    for x, title, body in foundations:
        f.rect(x, 554, 330, 92, fill=WHITE, stroke=INK, width=2)
        f.text(x + 18, 585, [title], 16, 800)
        f.text(x + 18, 617, [body], 14, 500, fill=MUTED)

    f.rect(305, 679, 590, 48, fill=RED, stroke=RED, width=2)
    f.text(
        600,
        709,
        ["ACTIVITY IS NOT IMPACT"],
        15,
        800,
        fill=WHITE,
        anchor="middle",
        spacing=1.2,
    )
    f.note("Attendance, effort, relationships, and output volume cannot substitute for a traceable outcome.")
    f.save("promotion-evidence-chain.svg")


def main() -> None:
    four_separate_judgments()
    operating_model_progression()
    scope_gap_diagnostic()
    promotion_evidence_chain()
    print(f"Generated career figures in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
