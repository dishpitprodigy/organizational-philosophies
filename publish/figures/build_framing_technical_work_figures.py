#!/usr/bin/env python3
"""Generate SVG figures for Framing Technical Work Before Design."""

from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "assets" / "images" / "framing-technical-work"

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
  <marker id="arrow-ink" markerWidth="10" markerHeight="10" refX="8.95" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#111111"/>
  </marker>
  <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8.95" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#ad0034"/>
  </marker>
  <marker id="arrow-cyan" markerWidth="10" markerHeight="10" refX="8.95" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#007f7b"/>
  </marker>
  <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8.95" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#2f7d32"/>
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
        self.text(58, 62, ["FRAMING TECHNICAL WORK"], 15, 800, fill=RED, spacing=1.8)
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

    def box(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        title: str,
        body: list[str],
        *,
        accent: str = INK,
        fill: str = WHITE,
        number: str | None = None,
    ) -> None:
        self.rect(x, y, w, h, fill=fill, stroke=accent, width=3)
        title_x = x + 18
        if number:
            self.rect(x, y, 42, 34, fill=accent, stroke=accent, width=2)
            self.text(x + 21, y + 23, [number], 15, 800, fill=WHITE, anchor="middle")
            title_x = x + 55
        self.text(title_x, y + 28, [title], 19, 800)
        self.text(x + 18, y + 56, body, 14, 400, fill=MUTED, leading=19)

    def diamond(
        self,
        cx: float,
        cy: float,
        w: float,
        h: float,
        title: list[str],
        *,
        fill: str = WHITE,
        stroke: str = INK,
    ) -> None:
        points = (
            f"{cx},{cy - h / 2} {cx + w / 2},{cy} "
            f"{cx},{cy + h / 2} {cx - w / 2},{cy}"
        )
        self.add(f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>')
        first_y = cy - ((len(title) - 1) * 10)
        self.text(cx, first_y, title, 16, 800, anchor="middle", leading=21)

    def note(self, value: str) -> None:
        self.line(58, self.height - 64, 1142, self.height - 64, color=LIGHT, width=2)
        self.text(58, self.height - 37, [value], 14, 600, fill=MUTED)

    def save(self, name: str) -> None:
        self.parts.append("</svg>")
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / name).write_text("\n".join(self.parts) + "\n", encoding="utf-8")


def framing_to_execution() -> None:
    f = Figure(
        "Framing produces the evidence design still lacks",
        "Unanswered design-gate questions return to bounded discovery; implementation begins only after commitment.",
        height=760,
    )
    y = 232
    box_w = 180
    gap = 34
    xs = [58 + index * (box_w + gap) for index in range(5)]
    f.box(xs[0], y, box_w, 118, "Request", ["Problem, users,", "desired outcome"], accent=INK, number="1")
    f.box(xs[1], y, box_w, 118, "Five-Box", ["Intent, constraints,", "non-goals, artifact"], accent=CYAN, number="2")
    f.box(xs[2], y, box_w, 118, "Discovery", ["Answer the question;", "preserve evidence"], accent=YELLOW, number="3")
    f.box(xs[3], y, box_w, 118, "Design gates", ["Requirements, failure,", "operations, ownership"], accent=RED, number="4")
    f.box(xs[4], y, box_w, 118, "Commitment", ["Architecture, risk,", "delivery boundary"], accent=GREEN, number="5")
    for index in range(4):
        f.line(
            xs[index] + box_w,
            y + 59,
            xs[index + 1],
            y + 59,
            color=INK,
            marker="arrow-ink",
        )

    f.diamond(690, 474, 230, 112, ["Gate questions", "answered?"], fill=WHITE, stroke=RED)
    f.line(790, 350, 690, 418, color=RED, marker="arrow-red")
    f.line(575, 474, 576, 350, color=RED, marker="arrow-red")
    f.text(555, 455, ["NO"], 13, 800, fill=RED, anchor="end")
    f.text(555, 477, ["BOUNDED DISCOVERY"], 12, 800, fill=RED, anchor="end")
    f.path([(805, 474), (960, 474), (960, 350)], color=GREEN, marker="arrow-green")
    f.text(835, 459, ["YES"], 13, 800, fill=GREEN)

    f.box(
        850,
        552,
        290,
        92,
        "Execution planning",
        ["Epics, stories, work packages, tasks"],
        accent=GREEN,
    )
    f.path([(1048, 350), (1048, 520), (995, 520), (995, 552)], color=GREEN, marker="arrow-green")
    f.note("Discovery is complete when its question is answered, not when implementation quietly begins.")
    f.save("framing-to-execution.svg")


def intent_classification() -> None:
    f = Figure(
        "Classify the result before prescribing the work",
        "The primary value of the work determines its intent; unresolved completion conditions remain Discovery.",
        height=790,
    )
    f.diamond(600, 240, 300, 118, ["Do we know what", "done looks like?"], fill=WHITE, stroke=CYAN)
    f.path([(450, 240), (228, 240), (228, 354)], color=RED, marker="arrow-red")
    f.text(325, 223, ["NO"], 13, 800, fill=RED)
    f.box(
        78,
        354,
        300,
        112,
        "Discovery",
        ["Reduce uncertainty; produce", "a reusable decision artifact"],
        accent=RED,
    )
    f.path([(750, 240), (800, 240), (800, 339)], color=GREEN, marker="arrow-green")
    f.text(858, 223, ["YES"], 13, 800, fill=GREEN)
    f.diamond(800, 398, 280, 118, ["What primary result", "creates value?"], fill=WHITE, stroke=GREEN)

    targets = [
        (58, "Migration", ["Move state A", "to state B"], CYAN),
        (288, "Redesign", ["Change the", "structure"], RED),
        (518, "Enablement", ["Remove blockers", "for others"], YELLOW),
        (748, "Optimization", ["Improve efficiency", "or flow"], GREEN),
    ]
    for x, title, body, color in targets:
        f.box(x, 578, 194, 104, title, body, accent=color)
        f.path([(800, 457), (800, 528), (x + 97, 528), (x + 97, 578)], color=color, marker="arrow-ink")

    f.box(
        970,
        346,
        172,
        104,
        "Split it",
        ["Two primary results", "mean two packages"],
        accent=INK,
    )
    f.line(940, 398, 970, 398, color=INK, width=3, dash="8 6", marker="arrow-ink")
    f.text(955, 382, [">1"], 13, 800, fill=INK, anchor="middle")
    f.text(818, 492, ["1"], 13, 800, fill=GREEN)
    f.note("When two intents remain, splitting the work preserves separate completion conditions.")
    f.save("intent-classification.svg")


def design_gate_convergence() -> None:
    f = Figure(
        "A design commitment depends on several different proofs",
        "One strong answer cannot compensate for a missing requirement, operating owner, or failure boundary.",
        height=820,
    )
    gate_boxes = [
        (58, 210, "Requirements", ["Problem, users, scale,", "success conditions"], CYAN),
        (58, 390, "Performance & failure", ["Load, latency, degradation,", "recovery, RTO/RPO"], RED),
        (58, 570, "Operational impact", ["Intervention, cognitive load,", "transition, maintenance"], YELLOW),
        (822, 210, "Accountability", ["Operation, incidents, uptime,", "automation, risk acceptance"], GREEN),
        (822, 390, "Complexity & tooling", ["Where complexity lives;", "who pays support cost"], CYAN),
        (822, 570, "Pre-mortem", ["Hidden assumptions, stress,", "likely incident paths"], RED),
    ]
    for x, y, title, body, color in gate_boxes:
        f.box(x, y, 320, 116, title, body, accent=color)

    f.box(
        435,
        358,
        330,
        160,
        "Responsible design commitment",
        ["Fitness, authority, and operating", "boundaries are explicit"],
        accent=INK,
    )
    left_targets = [(390, CYAN), (438, RED), (486, YELLOW)]
    right_targets = [(390, GREEN), (438, CYAN), (486, RED)]
    for (x, y, _, _, _), (target_y, color) in zip(gate_boxes[:3], left_targets):
        start_y = y + 58
        f.path(
            [(x + 320, start_y), (410, start_y), (410, target_y), (435, target_y)],
            color=color,
            marker="arrow-ink",
        )
    for (x, y, _, _, _), (target_y, color) in zip(gate_boxes[3:], right_targets):
        start_y = y + 58
        f.path(
            [(x, start_y), (790, start_y), (790, target_y), (765, target_y)],
            color=color,
            marker="arrow-ink",
        )
    f.text(600, 690, ["DESIGN-INFORMING QUESTIONS"], 14, 800, fill=MUTED, anchor="middle", spacing=1.2)
    f.rect(300, 710, 600, 54, fill=WHITE, stroke=LIGHT, width=2, dash="7 6")
    f.text(
        600,
        742,
        ["Consumption model • delegation • record ownership • implementation options"],
        15,
        600,
        fill=MUTED,
        anchor="middle",
    )
    f.note("Design gates establish fitness and authority; design-informing questions shape the chosen implementation.")
    f.save("design-gate-convergence.svg")


def main() -> None:
    framing_to_execution()
    intent_classification()
    design_gate_convergence()
    print(f"Generated framing figures in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
