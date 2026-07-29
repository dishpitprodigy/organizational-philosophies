#!/usr/bin/env python3
"""Generate the book-ready SVG figures used by the Work Intake chapter."""

from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "assets" / "images" / "work-intake"

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
    def __init__(self, title: str, subtitle: str = "", height: int = 720):
        self.width = 1200
        self.height = height
        self.parts = [
            (
                f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'viewBox="0 0 {self.width} {self.height}" role="img" '
                f'aria-labelledby="title desc">'
            ),
            f"<title id=\"title\">{escape(title)}</title>",
            f"<desc id=\"desc\">{escape(subtitle)}</desc>",
            """
<defs>
  <marker id="arrow-ink" markerWidth="10" markerHeight="10" refX="8" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#111111"/>
  </marker>
  <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#ad0034"/>
  </marker>
  <marker id="arrow-cyan" markerWidth="10" markerHeight="10" refX="8" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#007f7b"/>
  </marker>
  <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="3"
          orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,6 L9,3 z" fill="#2f7d32"/>
  </marker>
  <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <rect width="10" height="10" fill="#fffdf5"/>
    <line x1="0" y1="0" x2="0" y2="10" stroke="#111111" stroke-width="2" opacity=".22"/>
  </pattern>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="#f5efdc"/>
    <path d="M24 0H0V24" fill="none" stroke="#111111" stroke-width="1" opacity=".08"/>
  </pattern>
  <style>
    text { font-family: "Helvetica Neue", Arial, sans-serif; }
    .label { font-size: 15px; font-weight: 800; letter-spacing: 1.8px; }
    .title { font-size: 34px; font-weight: 800; }
    .subtitle { font-size: 17px; fill: #5f5a4e; }
    .box-title { font-size: 20px; font-weight: 800; }
    .box-copy { font-size: 16px; fill: #3f3b34; }
    .small { font-size: 14px; fill: #5f5a4e; }
    .tiny { font-size: 12px; fill: #5f5a4e; letter-spacing: .5px; }
  </style>
</defs>
""",
            f'<rect width="{self.width}" height="{self.height}" fill="{PAPER}"/>',
            f'<rect x="18" y="18" width="{self.width - 36}" height="{self.height - 36}" '
            f'fill="none" stroke="{INK}" stroke-width="2"/>',
            f'<rect x="30" y="30" width="{self.width - 60}" height="{self.height - 60}" '
            f'fill="none" stroke="none"/>',
        ]
        self.text(58, 60, ["WORK INTAKE / SYSTEM FIGURE"], 15, 800, fill=RED, spacing=1.8)
        self.text(58, 102, [title], 34, 800)
        if subtitle:
            self.text(58, 132, [subtitle], 17, 400, fill=MUTED)
        self.line(58, 151, 1142, 151, color=INK, width=2)

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
        italic: bool = False,
    ) -> None:
        leading = leading or int(size * 1.28)
        attrs = (
            f'x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{spacing}"'
        )
        if italic:
            attrs += ' font-style="italic"'
        spans = []
        for index, line in enumerate(lines):
            dy = 0 if index == 0 else leading
            spans.append(f'<tspan x="{x}" dy="{dy}">{escape(line)}</tspan>')
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
        fill: str = "none",
    ) -> None:
        d = "M" + " L".join(f"{x},{y}" for x, y in points)
        attrs = f'd="{d}" fill="{fill}" stroke="{color}" stroke-width="{width}"'
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
        radius: int = 0,
        dash: str | None = None,
    ) -> None:
        attrs = (
            f'x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{width}"'
        )
        if dash:
            attrs += f' stroke-dasharray="{dash}"'
        self.add(f"<rect {attrs}/>")

    def circle(
        self,
        cx: float,
        cy: float,
        r: float,
        *,
        fill: str = WHITE,
        stroke: str = INK,
        width: int = 2,
    ) -> None:
        self.add(
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{width}"/>'
        )

    def box(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        title: str,
        body: list[str] | None = None,
        *,
        accent: str = INK,
        fill: str = WHITE,
        dashed: bool = False,
        number: str | None = None,
        title_size: int = 19,
    ) -> None:
        self.rect(x, y, w, h, fill=fill, stroke=accent, width=3, dash="9 7" if dashed else None)
        if number:
            self.rect(x, y, 42, 35, fill=accent, stroke=accent)
            self.text(x + 21, y + 24, [number], 16, 800, fill=WHITE, anchor="middle")
            title_x = x + 54
        else:
            title_x = x + 16
        self.text(title_x, y + 28, [title], title_size, 800, fill=INK)
        if body:
            self.text(x + 16, y + 55, body, 15, 400, fill=MUTED, leading=20)

    def pill(
        self,
        x: float,
        y: float,
        w: float,
        text: str,
        *,
        fill: str = LIGHT,
        stroke: str = INK,
        ink: str = INK,
    ) -> None:
        self.rect(x, y, w, 34, fill=fill, stroke=stroke, width=2, radius=17)
        self.text(x + w / 2, y + 23, [text], 13, 800, fill=ink, anchor="middle", spacing=.4)

    def diamond(
        self,
        cx: float,
        cy: float,
        w: float,
        h: float,
        *,
        fill: str = WHITE,
        stroke: str = INK,
    ) -> None:
        points = f"{cx},{cy - h / 2} {cx + w / 2},{cy} {cx},{cy + h / 2} {cx - w / 2},{cy}"
        self.add(f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>')

    def note(self, text: str) -> None:
        self.line(58, self.height - 66, 1142, self.height - 66, color=LIGHT, width=2)
        self.text(58, self.height - 38, [text], 14, 600, fill=MUTED)

    def save(self, name: str) -> None:
        self.parts.append("</svg>")
        OUTPUT.mkdir(parents=True, exist_ok=True)
        svg_path = OUTPUT / name
        svg_path.write_text("\n".join(self.parts) + "\n", encoding="utf-8")


def front_door() -> None:
    f = Figure(
        "Route demand before a team accepts it",
        "The front door preserves different kinds of requests instead of forcing everything through project intake.",
        820,
    )
    f.box(60, 330, 190, 110, "Authenticated", ["demand"], accent=RED, fill="#fff8e0")
    f.line(250, 385, 335, 385, marker="arrow-ink")
    f.diamond(405, 385, 140, 140, fill="#fff8e0", stroke=RED)
    f.text(405, 378, ["What kind", "of request?"], 17, 800, anchor="middle", leading=22)

    routes = [
        (175, "INCIDENT", ["Stabilize harm", "Record follows"], RED),
        (285, "STANDARD SERVICE", ["Use known path", "Known outcome"], CYAN),
        (395, "GENERAL INQUIRY", ["Bounded answer", "No proposal"], INK),
        (505, "ASSISTED INTAKE", ["Navigate process", "Do not do discovery"], YELLOW),
        (615, "WORK PROPOSAL", ["Evidence + sponsor", "Review before delivery"], RED),
    ]
    for y, title, body, accent in routes:
        f.path([(475, 385), (520, 385), (520, y + 40), (565, y + 40)], color=accent, marker="arrow-ink")
        f.box(565, y, 255, 80, title, body, accent=accent)

    f.box(885, 175, 250, 80, "OPERATIONAL PATH", ["Immediate response"], accent=RED, fill="#fff8e0")
    f.box(885, 285, 250, 80, "SERVICE CATALOG", ["Repeatable fulfillment"], accent=CYAN)
    f.box(885, 395, 250, 80, "ANSWER OR REDIRECT", ["The requester chooses next"], accent=INK)
    f.box(885, 505, 250, 80, "PROCESS ROUTE", ["Missing owner or prerequisite"], accent=YELLOW)
    f.box(885, 615, 250, 80, "GOVERNED REVIEW", ["Authority before capacity"], accent=RED)
    for y, color in [(215, RED), (325, CYAN), (435, INK), (545, YELLOW), (655, RED)]:
        f.line(820, y, 885, y, color=color, marker="arrow-ink")
    f.note("Assistance may identify discovery work; it may not hide discovery inside an intake ticket.")
    f.save("front-door-routing.svg")


def proposal_evidence() -> None:
    f = Figure(
        "A Work Proposal proves a change is worth evaluating",
        "The core argument runs from the present condition to an observable outcome; the surrounding evidence makes it governable.",
    )
    f.box(60, 230, 250, 120, "CURRENT STATE", ["Condition, failure,", "constraint, or cost"], accent=INK, number="1")
    f.box(475, 230, 250, 120, "REQUIRED DIFFERENCE", ["The material gap", "the work must close"], accent=RED, number="2")
    f.box(890, 230, 250, 120, "DESIRED OUTCOME", ["What becomes true", "and how we will know"], accent=CYAN, number="3")
    f.line(310, 290, 475, 290, marker="arrow-ink")
    f.line(725, 290, 890, 290, marker="arrow-ink")

    groups = [
        (60, "BOUNDARIES", ["Requirements", "Non-goals"], INK),
        (335, "PROOF", ["Acceptance conditions", "Timing evidence"], CYAN),
        (610, "FEASIBILITY", ["Dependencies", "Known uncertainty"], RED),
        (885, "STEWARDSHIP", ["Operational owner", "Sponsor"], YELLOW),
    ]
    for x, title, body, accent in groups:
        f.box(x, 430, 255, 115, title, body, accent=accent)
    f.path([(188, 430), (188, 390), (600, 390), (600, 350)], dash="8 7", marker="arrow-ink")
    f.path([(462, 430), (462, 390)], dash="8 7")
    f.path([(738, 430), (738, 390)], dash="8 7")
    f.path([(1012, 430), (1012, 390), (600, 390)], dash="8 7")
    f.note("The proposal governs one top-level outcome; effort changes decomposition, not the completion condition.")
    f.save("work-proposal-evidence.svg")


def discovery_vs_implementation() -> None:
    f = Figure(
        "Learning and building require different authority",
        "Discovery may produce evidence for an implementation proposal, but it never authorizes implementation by itself.",
        760,
    )
    f.text(60, 197, ["BOUNDED DISCOVERY"], 16, 800, fill=CYAN, spacing=1.2)
    discovery = [
        (60, "QUESTION", ["Decision-critical"]),
        (285, "TIMEBOX", ["Capacity bounded"]),
        (510, "ARTIFACT", ["Evidence produced"]),
        (735, "DECISION", ["Stop, continue,", "or propose change"]),
    ]
    for index, (x, title, body) in enumerate(discovery):
        f.box(x, 220, 185, 105, title, body, accent=CYAN, number=str(index + 1))
        if index < len(discovery) - 1:
            f.line(x + 185, 272, x + 225, 272, color=CYAN, marker="arrow-cyan")

    f.path([(920, 325), (920, 385), (600, 385), (600, 438)], color=INK, dash="9 7", marker="arrow-ink")
    f.pill(472, 365, 256, "NEW AUTHORIZATION REQUIRED", fill="#fff8e0", stroke=RED)

    f.text(60, 447, ["IMPLEMENTATION"], 16, 800, fill=RED, spacing=1.2)
    implementation = [
        (60, "DESIGN EVIDENCE", ["Architecture", "and boundaries"]),
        (285, "GOVERNED REVIEW", ["Risk, money,", "ownership"]),
        (510, "CAPACITY", ["Teams accept", "named work"]),
        (735, "DELIVERY", ["Build inside", "approved scope"]),
        (960, "ACCEPTANCE", ["Test the", "prediction"]),
    ]
    for index, (x, title, body) in enumerate(implementation):
        f.box(x, 470, 180, 110, title, body, accent=RED, number=str(index + 1), title_size=16)
        if index < len(implementation) - 1:
            f.line(x + 180, 525, x + 225, 525, color=RED, marker="arrow-red")
    f.note("A research label does not make production access, sensitive data, or material spending risk-free.")
    f.save("discovery-vs-implementation.svg")


def ordered_review() -> None:
    f = Figure(
        "Review order follows decision dependencies",
        "An earlier gate must clear before functions that depend on its decision spend time or commit resources.",
        780,
    )
    stages = [
        (65, 205, "ADMIN AUTHORITY", ["May this proposal", "consume evaluation", "capacity?"], RED),
        (285, 270, "SECURITY", ["Is cross-cutting risk", "inside tolerance?"], RED),
        (505, 335, "SPECIALIST REVIEWS", ["Finance, Procurement,", "Privacy, technical teams"], CYAN),
        (725, 400, "ASSEMBLY", ["Are accepted records", "current and complete?"], INK),
        (945, 465, "DELIVERY READINESS", ["Have teams accepted", "capacity and ownership?"], YELLOW),
    ]
    for index, (x, y, title, body, accent) in enumerate(stages):
        f.box(x, y, 190, 118, title, body, accent=accent, number=str(index + 1), title_size=16)
        if index < len(stages) - 1:
            nx, ny = stages[index + 1][0], stages[index + 1][1]
            f.path([(x + 190, y + 59), (nx - 18, y + 59), (nx - 18, ny + 59), (nx, ny + 59)], marker="arrow-ink")

    for x, y in [(160, 323), (380, 388), (600, 453)]:
        f.path([(x, y), (x, 640)], color=RED, dash="8 7", marker="arrow-red")
        f.pill(x - 61, 630, 122, "STOP", fill="#fff8e0", stroke=RED, ink=RED)
    f.text(597, 610, ["A mandatory no stops every review and delivery decision that depends on it."], 16, 700, anchor="middle")
    f.note("Organizations may use different stages; the sequence still follows the dependencies among decisions.")
    f.save("ordered-review.svg")


def conditional_approval() -> None:
    f = Figure(
        "Conditional Approval authorizes proof, not implementation",
        "A testable unknown may justify the minimum work needed to resolve it; the reviewing authority still decides what follows.",
        800,
    )
    f.box(60, 295, 210, 110, "REVIEW QUESTION", ["A critical variable", "is still unknown"], accent=INK)
    f.line(270, 350, 345, 350, marker="arrow-ink")
    f.diamond(430, 350, 170, 150, fill="#fff8e0", stroke=RED)
    f.text(430, 338, ["Can a bounded", "test resolve it?"], 17, 800, anchor="middle", leading=22)

    f.path([(515, 350), (585, 350)], color=CYAN, marker="arrow-cyan")
    f.text(550, 334, ["YES"], 13, 800, anchor="middle", fill=CYAN)
    f.box(585, 285, 235, 130, "CONDITIONAL APPROVAL", ["Named variable", "Pass/fail evidence", "Owner + timebox"], accent=CYAN)
    f.line(820, 350, 875, 350, color=CYAN, marker="arrow-cyan")
    f.box(875, 285, 260, 130, "MINIMUM PROOF ONLY", ["No general implementation", "No vague cleanup list"], accent=CYAN, dashed=True)

    f.path([(1005, 415), (1005, 500), (600, 500)], marker="arrow-ink")
    f.diamond(515, 500, 170, 140, fill=WHITE, stroke=INK)
    f.text(515, 491, ["What did", "the test show?"], 17, 800, anchor="middle", leading=22)

    f.path([(430, 425), (430, 610), (245, 610)], color=RED, marker="arrow-red")
    f.text(400, 450, ["NO"], 13, 800, anchor="end", fill=RED)
    f.box(60, 560, 185, 100, "REJECTED", ["No responsible", "proof path"], accent=RED, fill="#fff8e0")

    f.path([(430, 500), (325, 500), (325, 610), (245, 610)], color=RED, marker="arrow-red")
    f.text(335, 486, ["FAIL"], 13, 800, anchor="middle", fill=RED)
    f.path([(515, 570), (515, 630), (600, 630)], color=CYAN, marker="arrow-cyan")
    f.box(600, 580, 215, 100, "ANOTHER TEST", ["New question,", "owner, and timebox"], accent=CYAN, dashed=True)
    f.text(558, 615, ["UNKNOWN"], 13, 800, anchor="middle", fill=CYAN)
    f.path([(600, 500), (1000, 500), (1000, 580)], color=GREEN, marker="arrow-green")
    f.box(900, 580, 200, 100, "APPROVED", ["Recorded scope", "may proceed"], accent=GREEN)
    f.text(755, 486, ["PASS"], 13, 800, anchor="middle", fill=CYAN)

    f.line(815, 630, 900, 630, color=GREEN, dash="8 7", marker="arrow-green")
    f.text(858, 615, ["PASS"], 12, 800, anchor="middle", fill=GREEN)
    f.path([(707, 680), (707, 710), (152, 710), (152, 660)], color=RED, dash="8 7", marker="arrow-red")
    f.text(430, 700, ["FAIL"], 12, 800, anchor="middle", fill=RED)
    f.note("If bounded proof could responsibly answer the question, asking for that proof is not Review Rejection.")
    f.save("conditional-approval.svg")


def golf_consequence() -> None:
    f = Figure(
        "Small deviations widen downstream",
        "The visible miss may occur far from the decision that created it.",
        720,
    )
    f.add(
        f'<path d="M150 560 Q600 250 1110 205 L1110 600 Q600 575 150 560 Z" '
        f'fill="#fff8e0" stroke="{INK}" stroke-width="2"/>'
    )
    f.path([(160, 555), (1110, 400)], color=CYAN, width=4, marker="arrow-cyan")
    f.path([(160, 555), (1110, 220)], color=RED, width=4, marker="arrow-red")
    f.path([(160, 555), (1110, 585)], color=INK, width=2, dash="10 9")
    f.line(137, 505, 168, 607, color=INK, width=10)
    f.line(145, 510, 185, 600, color=RED, width=4)
    f.circle(160, 555, 9, fill=WHITE, stroke=INK, width=3)

    f.path([(214, 536), (235, 508), (250, 534)], color=RED, width=2)
    f.text(260, 515, ["MILLIMETERS", "AT CONTACT"], 15, 800, fill=RED, leading=19)
    f.text(938, 188, ["OFF INTO THE WOODS"], 16, 800, fill=RED)
    f.text(920, 382, ["DOWN THE FAIRWAY"], 16, 800, fill=CYAN)
    f.text(905, 625, ["UNQUESTIONED ASSUMPTION"], 14, 800, fill=INK)

    f.line(680, 324, 680, 461, color=INK, width=2)
    f.line(664, 324, 696, 324, color=INK, width=2)
    f.line(664, 461, 696, 461, color=INK, width=2)
    f.text(705, 383, ["THE GAP GROWS", "WITH EVERY HANDOFF"], 16, 800, leading=21)
    f.note("Early review does not prevent every miss; it keeps known questions from becoming avoidable downstream failures.")
    f.save("clubface-consequence.svg")


def authorized_assembly() -> None:
    f = Figure(
        "One proposal, intact specialist records",
        "Assembly validates the shared contract and provenance without flattening each function's evidence into one universal schema.",
        800,
    )
    modules = [
        (60, 205, "SECURITY", ["Threat model", "Control evidence"], RED),
        (60, 350, "FINANCE", ["Cost model", "Funding condition"], YELLOW),
        (60, 495, "TECHNICAL", ["Feasibility", "Operating burden"], CYAN),
        (930, 205, "PRIVACY / LEGAL", ["Applicable duties", "Required conditions"], INK),
        (930, 350, "PROCUREMENT", ["Vendor evidence", "Contract terms"], RED),
        (930, 495, "DELIVERY TEAMS", ["Capacity decision", "Ownership"], CYAN),
    ]
    for x, y, title, body, accent in modules:
        f.box(x, y, 210, 105, title, body, accent=accent)

    f.rect(365, 220, 470, 375, fill="#fff8e0", stroke=INK, width=4)
    f.rect(395, 250, 410, 315, fill=WHITE, stroke=RED, width=3)
    f.text(600, 290, ["AUTHORIZED WORK PROPOSAL"], 23, 800, anchor="middle")
    f.pill(510, 310, 180, "REVISION 3 / FIXED", fill=YELLOW, stroke=INK)
    center = [
        "Authenticated demand + sponsor",
        "Outcome, scope, and acceptance",
        "Review decisions + provenance",
        "Dependencies + capacity evidence",
        "Owners + dates + version history",
    ]
    for index, value in enumerate(center):
        y = 376 + index * 38
        f.line(435, y - 6, 455, y - 6, color=CYAN, width=5)
        f.text(470, y, [value], 16, 600)

    for x, y, _, _, accent in modules:
        start_x = x + 210 if x < 600 else x
        end_x = 365 if x < 600 else 835
        f.path([(start_x, y + 52), (end_x, y + 52)], color=accent, marker="arrow-ink")

    f.text(600, 645, ["SPECIALIST RECORDS REMAIN INTACT"], 16, 800, fill=RED, anchor="middle", spacing=1.2)
    f.text(600, 674, ["The common envelope proves whose decision applies to which proposal revision."], 15, 500, anchor="middle", fill=MUTED)
    f.note("Delivery records may refine execution; changing authority requires a superseding proposal revision.")
    f.save("authorized-work-assembly.svg")


def dependency_reservation() -> None:
    f = Figure(
        "A reservation turns an established priority into usable capacity",
        "The dependency team leaves one slot open so higher-priority work can enter mid-period without pretending every late arrival outranks the queue.",
        800,
    )
    f.text(60, 195, ["AT INTERVAL PLANNING"], 16, 800, fill=RED, spacing=1.2)
    f.text(650, 195, ["WHEN THE DEPENDENCY ARRIVES"], 16, 800, fill=CYAN, spacing=1.2)

    for x in (60, 650):
        f.text(x, 238, ["TEAM CAPACITY"], 13, 800, fill=MUTED, spacing=1)
        f.rect(x, 255, 490, 220, fill=WHITE, stroke=INK, width=3)
        f.line(x, 365, x + 490, 365, color=LIGHT, width=2)

    f.rect(75, 275, 145, 70, fill=LIGHT, stroke=INK, width=2)
    f.text(147, 316, ["WORK A"], 16, 800, anchor="middle")
    f.rect(235, 275, 145, 70, fill=LIGHT, stroke=INK, width=2)
    f.text(307, 316, ["WORK B"], 16, 800, anchor="middle")
    f.rect(395, 275, 140, 70, fill=LIGHT, stroke=RED, width=3, dash="8 6")
    f.text(465, 307, ["RESERVED"], 16, 800, anchor="middle", fill=RED)
    f.text(465, 328, ["SLOT"], 14, 800, anchor="middle", fill=RED)

    f.rect(75, 385, 145, 70, fill=WHITE, stroke=INK, width=2)
    f.text(147, 426, ["WORK C"], 16, 800, anchor="middle")
    f.text(245, 413, ["QUEUED"], 13, 800, fill=MUTED, spacing=1)
    f.path([(220, 420), (375, 420)], dash="8 7", marker="arrow-ink")

    f.rect(665, 275, 145, 70, fill=LIGHT, stroke=INK, width=2)
    f.text(737, 316, ["WORK A"], 16, 800, anchor="middle")
    f.rect(825, 275, 145, 70, fill=LIGHT, stroke=INK, width=2)
    f.text(897, 316, ["WORK B"], 16, 800, anchor="middle")
    f.rect(985, 275, 140, 70, fill="#fff8e0", stroke=CYAN, width=4)
    f.text(1055, 307, ["OS MIGRATION"], 15, 800, anchor="middle", fill=CYAN)
    f.text(1055, 329, ["STARTS NOW"], 13, 800, anchor="middle", fill=CYAN)
    f.rect(665, 385, 145, 70, fill=WHITE, stroke=INK, width=2)
    f.text(737, 426, ["WORK C"], 16, 800, anchor="middle")
    f.text(840, 413, ["STILL QUEUED"], 13, 800, fill=MUTED, spacing=1)

    f.path([(465, 255), (465, 225), (1055, 225), (1055, 275)], color=CYAN, dash="10 8", marker="arrow-cyan")
    f.pill(690, 208, 230, "NEW IMAGE AVAILABLE", fill="#fff8e0", stroke=CYAN, ink=CYAN)

    f.text(60, 525, ["WHY IT JUMPS THE QUEUE"], 15, 800, fill=RED, spacing=1.1)
    f.box(60, 545, 330, 90, "PRIORITY ALREADY DECIDED", ["The expiring contract creates", "the organizational consequence."], accent=RED)
    f.box(435, 545, 330, 90, "CAPACITY HELD OPEN", ["The team did not commit", "the reserved slot elsewhere."], accent=INK)
    f.box(810, 545, 330, 90, "NO PRIORITY INVENTED", ["The reservation implements", "the decision; it does not make it."], accent=CYAN)
    f.note("If nothing activates or renews the reservation by its cutoff, the team releases the slot.")
    f.save("conditional-dependency-reservation.svg")


def baseline_forecast() -> None:
    f = Figure(
        "The forecast moves; the approved baseline does not",
        "Learning changes what the organization expects, while the original commitment remains available for comparison.",
        740,
    )
    f.line(110, 600, 1110, 600, color=INK, width=3, marker="arrow-ink")
    for x, label in [(160, "AUTHORIZATION"), (430, "DELIVERY"), (700, "MORE EVIDENCE"), (1010, "COMPLETION")]:
        f.line(x, 590, x, 612, color=INK, width=3)
        f.text(x, 636, [label], 12, 800, anchor="middle", fill=MUTED, spacing=.8)

    f.path([(160, 265), (1010, 265)], color=RED, width=4)
    f.circle(160, 265, 11, fill=RED, stroke=RED)
    f.text(185, 236, ["APPROVED DELIVERY BASELINE"], 17, 800, fill=RED)
    f.text(185, 282, ["Fixed record of the estimate used to commit capacity"], 15, 500, fill=MUTED)

    forecast_points = [(160, 475), (430, 440), (700, 365), (1010, 405)]
    f.path(forecast_points, color=CYAN, width=5, marker="arrow-cyan")
    for index, (x, y) in enumerate(forecast_points):
        f.circle(x, y, 10, fill=WHITE, stroke=CYAN, width=4)
        f.text(x, y - 24, [f"F{index + 1}"], 13, 800, anchor="middle", fill=CYAN)
    f.text(185, 515, ["DELIVERY FORECAST"], 17, 800, fill=CYAN)
    f.text(185, 544, ["Updated as implementation exposes new evidence"], 15, 500, fill=MUTED)

    f.path([(700, 365), (700, 190), (920, 190)], color=INK, dash="9 7", marker="arrow-ink")
    f.box(920, 165, 220, 90, "NEW AUTHORITY", ["Required only if outcome,", "scope, or boundary changes"], accent=INK, dashed=True)
    f.note("Keeping both records supports honest planning without rewriting whether the original assumptions were any good.")
    f.save("baseline-and-forecast.svg")


def close_loop() -> None:
    f = Figure(
        "Work Intake closes the same delivery loop",
        "Authorize, deliver, measure, compare, and adapt are the same lifecycle used by SDLC, DevOps, and process improvement.",
        760,
    )
    stages = [
        (55, "AUTHORIZE", ["Record the", "prediction"], RED),
        (280, "DELIVER", ["Execute inside", "the boundaries"], INK),
        (505, "MEASURE", ["Ending state", "Intake history"], CYAN),
        (730, "COMPARE", ["Outcome vs. proposal", "Flow vs. expectation"], CYAN),
        (955, "ADAPT", ["Operating action", "Process refinement"], RED),
    ]
    for index, (x, title, body, accent) in enumerate(stages):
        f.box(x, 250, 190, 125, title, body, accent=accent, number=str(index + 1))
        if index < len(stages) - 1:
            f.line(x + 190, 312, x + 225, 312, color=accent, marker="arrow-ink")

    f.box(585, 440, 235, 100, "OUTCOME", ["Did the work do", "what we approved?"], accent=CYAN)
    f.box(840, 440, 250, 100, "PROCESS", ["Where did intake create", "rework or delay?"], accent=RED)

    f.path([(565, 375), (565, 410), (702, 410), (702, 440)], color=CYAN, dash="8 7", marker="arrow-cyan")
    f.path([(635, 375), (635, 425), (965, 425), (965, 440)], color=RED, dash="8 7", marker="arrow-red")

    f.path([(1050, 375), (1120, 375), (1120, 600), (150, 600), (150, 375)], color=INK, width=3, marker="arrow-ink")
    f.pill(487, 580, 225, "NEXT ITERATION", fill="#fff8e0", stroke=INK)
    f.text(150, 625, ["The next authorization receives the evidence; the original prediction remains unchanged."], 15, 600, fill=MUTED)

    f.note("The loop is ordinary: plan, deliver, measure, learn, and use the learning in the next decision.")
    f.save("close-the-loop.svg")


def main() -> None:
    front_door()
    proposal_evidence()
    discovery_vs_implementation()
    ordered_review()
    conditional_approval()
    golf_consequence()
    authorized_assembly()
    dependency_reservation()
    baseline_forecast()
    close_loop()
    print(f"Generated 10 figures in {OUTPUT}")


if __name__ == "__main__":
    main()
