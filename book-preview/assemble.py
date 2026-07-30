#!/usr/bin/env python3
"""Assemble a book-specific preview from the root organizational-philosophy sources."""

from __future__ import annotations

import argparse
import html
import re
import sys
from dataclasses import dataclass
from pathlib import Path


PREVIEW_DIR = Path(__file__).resolve().parent
ROOT = PREVIEW_DIR.parent
CHAPTER_DIR = PREVIEW_DIR / "chapters"
APPENDIX_DIR = PREVIEW_DIR / "appendices"
ASSET_DIR = PREVIEW_DIR / "assets"


@dataclass(frozen=True)
class BookItem:
    path: str
    title: str
    part: str
    source: str
    status: str


ITEMS: list[BookItem] = [
    BookItem("frontmatter/working-glossary.md", "Working Glossary", "Front matter", "Book assembly synthesis", "Reader aid"),
    BookItem("parts/part-1.md", "Part I: Learning to See the Loop", "I", "Assembly structure", "Part divider"),
    BookItem("chapters/01-open-loop-enterprise.md", "The Open-Loop Enterprise", "I — Learning to See the Loop", "The-Open-Loop-Enterprise.md", "Chapter anchor"),
    BookItem("parts/part-2.md", "Part II: Deciding What Deserves Organizational Attention", "II", "Assembly structure", "Part divider"),
    BookItem("chapters/02-front-door.md", "The Front Door", "II — Deciding What Deserves Organizational Attention", "Work-Intake-Is-an-Organizational-System.md", "Assembled source cut"),
    BookItem("chapters/03-portfolio-judgment.md", "Future Edition: Portfolio Judgment", "II — Deciding What Deserves Organizational Attention", "Gap-map synthesis plus Work Intake and Process Improvement", "Unnumbered editorial placeholder"),
    BookItem("parts/part-3.md", "Part III: Framing and Authorizing Work", "III", "Assembly structure", "Part divider"),
    BookItem("chapters/04-frame-before-design.md", "Frame the Work Before Designing It", "III — Framing and Authorizing Work", "Framing-Technical-Work-Before-Design.md", "Assembled source cut"),
    BookItem("chapters/05-legitimate-commitment.md", "Make the Commitment Legitimate", "III — Framing and Authorizing Work", "Work-Intake-Is-an-Organizational-System.md", "Assembled source cut"),
    BookItem("chapters/06-executable-work.md", "Turn Decisions Into Executable Work", "III — Framing and Authorizing Work", "Writing Work Items - Epics, Stories, and Tasks.md", "Assembled source cut"),
    BookItem("parts/part-4.md", "Part IV: Operating, Improving, and Retiring the System", "IV", "Assembly structure", "Part divider"),
    BookItem("chapters/07-visible-operating-system.md", "Make the Operating System Visible", "IV — Operating, Improving, and Retiring the System", "Process-Improvement-Framework.md", "Assembled source cut"),
    BookItem("chapters/08-convert-recurrence.md", "Convert Recurrence Into Improvement", "IV — Operating, Improving, and Retiring the System", "Process-Improvement-Framework.md", "Assembled source cut"),
    BookItem("chapters/09-operating-cadence.md", "Future Edition: Operating Cadence", "IV — Operating, Improving, and Retiring the System", "Gap-map synthesis plus distributed operating practices", "Unnumbered editorial placeholder"),
    BookItem("chapters/10-managed-runoff.md", "Managed Runoff", "IV — Operating, Improving, and Retiring the System", "Managed-Runoff-for-Deprecated-Services.md", "Chapter anchor"),
    BookItem("parts/part-5.md", "Part V: Developing and Acquiring Capability", "V", "Assembly structure", "Part divider"),
    BookItem("chapters/11-development-architecture.md", "Development Is an Organizational Architecture", "V — Developing and Acquiring Capability", "Talent-Development-Architecture.md", "Assembled source cut"),
    BookItem("chapters/12-management-evidence.md", "Management Is Evidence Infrastructure", "V — Developing and Acquiring Capability", "Coaching-and-Calibration-Guide.md plus TDA", "Merged source cut"),
    BookItem("chapters/13-safe-reps-and-opportunity.md", "Create Safe Reps and Allocate Opportunity", "V — Developing and Acquiring Capability", "Talent-Development-Architecture.md", "Assembled source cut"),
    BookItem("chapters/14-hiring-capability.md", "Future Edition: Hiring Capability", "V — Developing and Acquiring Capability", "TDA plus gap-map synthesis", "Unnumbered editorial placeholder with current source"),
    BookItem("chapters/15-selecting-external-capability.md", "Selecting External Capability", "V — Developing and Acquiring Capability", "RFPs-and-Vendor-Selection-as-Evidence-Systems.md", "Assembled source cut"),
    BookItem("chapters/16-proving-external-capability.md", "Proving and Accepting External Capability", "V — Developing and Acquiring Capability", "RFPs-and-Vendor-Selection-as-Evidence-Systems.md", "Assembled source cut"),
    BookItem("parts/part-6.md", "Part VI: Reconciling the Enterprise", "VI", "Assembly structure", "Part divider"),
    BookItem("chapters/17-reconciling-enterprise.md", "Future Edition: Reconciling the Enterprise", "VI — Reconciling the Enterprise", "Gap-map synthesis from domain reconciliation chapters", "Unnumbered editorial placeholder"),
    BookItem("chapters/18-ai-context-leverage.md", "Future Edition: AI, Context, and Organizational Leverage", "VI — Reconciling the Enterprise", "TDA plus gap-map synthesis", "Unnumbered editorial placeholder with current source"),
    BookItem("chapters/19-implementation-roadmap.md", "An Implementation Roadmap", "VI — Reconciling the Enterprise", "Process-Improvement-Framework.md plus gap-map synthesis", "Provisional synthesis"),
    BookItem("appendices/00-appendices.md", "Reusable Instruments and References", "Appendices", "Assembly boundary", "Appendix divider"),
    BookItem("appendices/a-framing-and-work-item-tools.md", "Appendix A: Framing and Work-Item Tools", "Appendices", "Framing and Writing Work Items", "Selected instruments"),
    BookItem("appendices/b-conversation-planner.md", "Appendix B: Conversation Planner", "Appendices", "Conversation Planner.md", "Worksheet"),
    BookItem("appendices/c-tda-workbook.md", "Appendix C: Talent Development Workbook", "Appendices", "Four TDA templates", "Implementation workbook"),
    BookItem("appendices/d-career-reference.md", "Appendix D: Career Progression Reference", "Appendices", "Career-Progression-Guide.md", "Selected reference"),
    BookItem("appendices/e-rfp-tools.md", "Appendix E: Vendor-Selection Tools", "Appendices", "RFP appendix", "Selected instruments"),
    BookItem("appendices/f-socratic-seminar.md", "Appendix F: Socratic Leadership Seminar", "Appendices", "Socratic-Leadership-Seminar.md", "Case study and implementation guide"),
]


def read_source(name: str) -> str:
    path = ROOT / name
    if not path.is_file():
        raise FileNotFoundError(f"missing source: {path}")
    return path.read_text(encoding="utf-8")


def without_title(name: str) -> str:
    lines = read_source(name).splitlines()
    if not lines or not lines[0].startswith("# "):
        raise ValueError(f"{name} must begin with an H1 title")
    return "\n".join(lines[1:]).strip()


def sections(name: str, headings: list[str]) -> str:
    lines = read_source(name).splitlines()
    level_two: dict[str, tuple[int, int]] = {}
    starts: list[tuple[str, int]] = []
    for index, line in enumerate(lines):
        if line.startswith("## "):
            starts.append((line[3:].strip(), index))
    for position, (heading, start) in enumerate(starts):
        end = starts[position + 1][1] if position + 1 < len(starts) else len(lines)
        level_two[heading] = (start, end)

    missing = [heading for heading in headings if heading not in level_two]
    if missing:
        raise ValueError(f"{name} is missing sections: {', '.join(missing)}")

    blocks = []
    for heading in headings:
        start, end = level_two[heading]
        blocks.append("\n".join(lines[start:end]).strip())
    return "\n\n".join(blocks)


def shift_headings(markdown: str, levels: int = 1) -> str:
    shifted = []
    for line in markdown.splitlines():
        match = re.match(r"^(#{1,6})(\s+.*)$", line)
        if match:
            count = min(6, len(match.group(1)) + levels)
            line = "#" * count + match.group(2)
        shifted.append(line)
    return "\n".join(shifted)


def strip_manual_heading_numbers(markdown: str) -> str:
    """Let the book renderer own section numbering inside assembled cuts."""
    markdown = re.sub(r"^(#{2,6}\s+)\d+\.\s+", r"\1", markdown, flags=re.MULTILINE)
    return re.sub(r"(\]\(#)\d+-", r"\1", markdown)


def mark_subheadings_unlisted(markdown: str) -> str:
    """Keep editorial-interlude subheads out of chapter numbering and the TOC."""
    lines = []
    for line in markdown.splitlines():
        if re.match(r"^#{2,6}\s+", line):
            line += " {.unnumbered .unlisted}"
        lines.append(line)
    return "\n".join(lines)


def future_note(text: str) -> str:
    paragraphs = text.strip().split("\n\n")
    rendered = ["> **Preview note — future edition**", ">"]
    for paragraph in paragraphs:
        for line in paragraph.splitlines():
            rendered.append(f"> {line}")
        rendered.append(">")
    return "\n".join(rendered[:-1])


def compose(
    title: str,
    part: str,
    intro: str,
    content: str = "",
    future: str = "",
    closing: str = "",
    provenance: str = "",
    unnumbered: bool = False,
) -> str:
    heading = f"# {title}"
    if unnumbered:
        heading += " {.unnumbered}"
    chunks = [heading]
    if part:
        chunks.append(f"*Part {part}*")
    chunks.append(intro.strip())
    if future:
        chunks.append(future_note(future))
    if content:
        chunks.append(content.strip())
    if closing:
        chunks.append(closing.strip())
    if provenance:
        chunks.append(f"<!-- Preview assembly source: {html.escape(provenance)} -->")
    assembled = "\n\n".join(chunk for chunk in chunks if chunk).strip() + "\n"
    if unnumbered:
        assembled = mark_subheadings_unlisted(assembled)
    return strip_manual_heading_numbers(assembled)


def part_divider(title: str, purpose: str) -> str:
    return (
        f"# {title} {{.part .unnumbered}}\n\n"
        f"{purpose.strip()}\n"
    )


def referenced_assets(markdown: str) -> dict[Path, bytes]:
    assets: dict[Path, bytes] = {}
    for match in re.finditer(r"docs/assets/([^)\"'\s]+)", markdown):
        relative = Path(match.group(1))
        source = ROOT / "docs" / "assets" / relative
        target = ASSET_DIR / relative
        if not source.is_file():
            raise FileNotFoundError(f"missing referenced asset: {source}")
        assets[target] = source.read_bytes()
    return assets


def adjust_assets(markdown: str, relative_path: str) -> str:
    depth = len(Path(relative_path).parent.parts)
    prefix = "../" * depth
    return markdown.replace("docs/assets/", f"{prefix}assets/")


def replace_many(markdown: str, replacements: dict[str, str]) -> str:
    for old, new in replacements.items():
        markdown = markdown.replace(old, new)
    return markdown


def chapter_contents() -> dict[str, str]:
    work_intake = "Work-Intake-Is-an-Organizational-System.md"
    framing = "Framing-Technical-Work-Before-Design.md"
    work_items = "Writing Work Items - Epics, Stories, and Tasks.md"
    process = "Process-Improvement-Framework.md"
    tda = "Talent-Development-Architecture.md"
    rfp = "RFPs-and-Vendor-Selection-as-Evidence-Systems.md"

    chapters: dict[str, str] = {}
    chapters["frontmatter/working-glossary.md"] = compose(
        "Working Glossary",
        "",
        """\\markboth{Working Glossary}{Working Glossary}

The book uses ordinary words as operating terms. Several are related but not interchangeable. This glossary records the current distinctions so later chapters can apply them without quietly redefining them.

The definitions are specific to this book. They are not claims that every cited discipline uses the same word in exactly the same way.""",
        content="""## The decision lifecycle

| Term | Meaning here |
|---|---|
| **Front door** | The visible entry point that classifies demand before every request becomes a project. |
| **Intake** | The organizational system that authenticates a need, preserves its provenance, gathers evidence, routes distinct decisions to their owners, and either rejects the request or turns it into an authorized commitment. An RFP is external intake. |
| **Admission** | The decision that a request is real and complete enough to compete for further attention. Admission is not priority, approval, or authorization. |
| **Selection / priority** | The comparative decision that one eligible claim should consume capacity or funding before another. It must preserve what the decision displaces. |
| **Review** | A bounded examination by an actor with a defined concern and decision right. A review produces a recorded decision or changed state, not merely discussion. |
| **Approval** | A decision owner concludes that the proposal satisfies the concern within that owner's authority. Approval by one authority does not spend another authority's money, risk, or capacity. |
| **Conditional approval** | Permission to perform only the minimum bounded work needed to resolve a testable unknown. It is not general permission to implement. The evidence must return to the original authority. |
| **Authorization** | The assembled organizational decision that defined work may proceed within stated scope, constraints, accepted risks, and review decisions. |
| **Capacity acceptance** | The delivery owner explicitly commits named capacity to authorized work. Organizational approval does not manufacture delivery capacity. |
| **Acceptance** | The authorized actor decides that a delivered result satisfies the previously defined proof and operating conditions. Delivery is evidence presented for acceptance, not acceptance itself. |
| **Reconciliation** | A later comparison of the original claim, assumptions, and expected outcome with what actually happened, followed by a decision about what changes next. |

## Claims, records, and evidence

| Term | Meaning here |
|---|---|
| **Claim** | A statement the organization may later need to test: a need exists, a design will work, a person demonstrated a capability, a vendor can meet a requirement, or an outcome will justify a cost. |
| **Decision record** | The durable record of a decision, its owner, material context, alternatives, assumptions, accepted risks, and review condition. Domain records may carry this function without duplicating a generic form. |
| **Baseline** | The accepted account of what is true at a decision point. A baseline preserves the past; later changes do not rewrite it. |
| **Forecast** | The current best estimate of a future outcome, timing, cost, or capacity need. A forecast changes when evidence changes. |
| **Evidence** | Material strong enough to inform or challenge a claim. Its strength depends on provenance, conditions, relevance, and the decision it is meant to change. |
| **Evidence path** | The route from a claim, through observation or proof, to an actor required and authorized to read it. |
| **Claim register** | A structured record of externally or internally supplied claims, their source, proof condition, status, and later disposition. |
| **Evidence ledger** | A case-level, append-only record that preserves observations and context rather than reconstructing a summary from memory. |
| **Behavioral scoreboard** | A deliberately limited aggregate of patterns from individual evidence. It directs organizational attention but does not replace the case-level ledger. |

## Work and completion

| Term | Meaning here |
|---|---|
| **Framing** | Classifying the kind of problem, stating constraints and non-goals, identifying the reasoning artifact required, and deciding whether the work is ready for discovery, design, or execution. |
| **Discovery** | Bounded work whose outcome is decision-ready knowledge. Discovery is legitimate company work even when the responsible result is not to implement. |
| **Implementation** | Work authorized to make a selected change real. It commits capacity, risk, ownership, and later acceptance obligations that discovery may not. |
| **Output** | An activity performed or artifact produced. Output is not proof that the intended change occurred. |
| **Outcome / exit condition** | The observable change that justifies the work and determines whether the governing Epic or initiative can close. |
| **Acceptance criteria** | The item-specific conditions that prove a story, work package, requirement, or delivered capability did what it promised. |
| **Definition of Done** | A standing workmanship bar applied to every item of a given kind. It is not the item-specific acceptance criterion or the governing outcome. |
| **Work type** | A stable classification of the work's operating shape, such as incident, standard request, or proposed change. |
| **Investment class** | The rule governing what kind of capacity the work may receive: ordinary delivery, improvement, discovery, managed runoff, or another explicitly defined class. |

## Actors and boundaries

| Term | Meaning here |
|---|---|
| **Requester** | The actor asking the organization to consider a need or claim. The requester supplies facts and evidence but does not automatically own priority or approval. |
| **Sponsor** | The accountable actor who authenticates the organizational need, carries the proposal, and accepts the burden of supplying missing evidence. Sponsorship is an act, not a name in a field. |
| **Decision owner** | The actor with the competence and authority to decide the concern under review. |
| **Review facilitator** | The actor who assembles reviewers, preserves questions and evidence, tracks clocks, and records the result without acquiring decision authority merely by facilitating. |
| **Delivery owner** | The actor accountable for executing authorized work and maintaining the delivery forecast. |
| **Acceptance authority** | The actor authorized to decide whether the result satisfies the agreed proof and operating conditions. |
| **Internal intake** | Intake across a shared organizational boundary. Participants may disagree, but they remain obligated to the same enterprise outcome and should cooperate in producing a valid decision. |
| **External intake / RFP** | The same intake system across a commercial trust boundary. The counterparty benefits from selection and is therefore an interested claimant, not a neutral source of proof. |
| **Adversarial posture** | A control stance that makes incentive conflict explicit. It does not require hostility. It requires the buyer to own the need, proof conditions, evaluation, acceptance, and payment gates rather than treating sales claims as evidence. |
| **Closed loop** | A system that records a claim, preserves its context, routes evidence to an accountable reader, reconciles the claim with reality, and changes the next decision. |
| **Safe reps** | Bounded real work that lets a person practice the next operating mode without exposing the person or organization to unacceptable harm. |
""",
        provenance="Book assembly synthesis from repeated terminology across the current source corpus",
        unnumbered=True,
    )
    chapters["parts/part-1.md"] = part_divider(
        "Part I: Learning to See the Loop",
        "The opening establishes the governing failure: organizations keep the score while discarding the reasoning, conditions, and evidence needed to understand how the result was produced.",
    )
    chapters["parts/part-2.md"] = part_divider(
        "Part II: Deciding What Deserves Organizational Attention",
        "The next problem is admission and selection: which demands are real, which deserve comparison, and who owns the consequences when one claim on capacity displaces another.",
    )
    chapters["parts/part-3.md"] = part_divider(
        "Part III: Framing and Authorizing Work",
        "Selected demand must become a bounded, reviewable commitment before implementation distributes unresolved judgment across a backlog.",
    )
    chapters["parts/part-4.md"] = part_divider(
        "Part IV: Operating, Improving, and Retiring the System",
        "Authorized work enters an operating system that must control flow, learn from recurrence, respond to risk, and stop investing in assets that should disappear.",
    )
    chapters["parts/part-5.md"] = part_divider(
        "Part V: Developing and Acquiring Capability",
        "Organizations create capability through development and acquire it through hiring and vendors. Each path requires evidence before the decision and reconciliation after it.",
    )
    chapters["parts/part-6.md"] = part_divider(
        "Part VI: Reconciling the Enterprise",
        "Local reviews become organizational learning only when their evidence changes portfolio and executive decisions without losing the context that made the evidence trustworthy.",
    )

    chapters["chapters/01-open-loop-enterprise.md"] = compose(
        "The Open-Loop Enterprise",
        "I — Learning to See the Loop",
        "The book begins with a diagnosis: organizations preserve results more reliably than they preserve the judgments that produced them. The consequence is not merely weak documentation. It is an enterprise that cannot distinguish good reasoning from luck, cannot grade its own forecasts, and cannot make the next decision from anything better than institutional memory.",
        without_title("The-Open-Loop-Enterprise.md"),
        closing="The rest of the book follows the claim into the operating system. If every important decision needs an owner, expected outcome, evidence path, and review point, the next question is which demands deserve to become important decisions at all.",
        provenance="The-Open-Loop-Enterprise.md, complete article",
    )

    chapters["chapters/02-front-door.md"] = compose(
        "The Front Door",
        "II — Deciding What Deserves Organizational Attention",
        "A receiving team usually encounters organizational demand after the consequential decisions should already have been made. The request arrives without an authenticated owner, a stable problem statement, an accepted priority, or evidence that the organization intends to spend capacity on it. The team can either reconstruct those decisions in engineering labor or make the absence visible and return each decision to its owner.",
        sections(
            work_intake,
            [
                "Thesis",
                "The Receiving-Team Trap",
                "Start With the Front Door",
                "Provenance Before Convenience",
                "What a Work Proposal Must Prove",
            ],
        ),
        closing="A front door makes unlike demand visible and prevents receiving teams from manufacturing sponsorship. It does not decide which eligible proposal should displace another. That is a portfolio judgment, and the current corpus only partly defines it.",
        provenance=f"{work_intake}: Thesis through What a Work Proposal Must Prove",
    )

    chapters["chapters/03-portfolio-judgment.md"] = compose(
        "Future Edition: Portfolio Judgment",
        "II — Deciding What Deserves Organizational Attention",
        """Intake can establish that a request is real without establishing that the organization should do it. That distinction is easy to lose because both decisions may end with the same visible state: a proposal moves forward. The first decision admits a claim into consideration. The second spends scarce capacity and changes what other work can happen.

A portfolio decision needs more than a ranked list. It needs an accountable body or role, comparable evidence, a record of what was funded or displaced, and a condition that forces the decision back into review when assumptions change. Otherwise priority becomes a property attached to work rather than a judgment made by someone with authority over the consequences.

The current sources already supply several controls. Work Intake requires sponsorship, distinguishes routing from commitment, treats capacity as an acceptance decision, and records an Accountable Priority Override when leadership interrupts committed work. Process Improvement makes work and queue pressure visible. Writing Work Items shows how recurring demand can create roadmap work. Together they establish the evidence a portfolio process would need. They do not yet define the portfolio process itself.""",
        future="""A future version will define the comparative decision: who ranks eligible proposals, which evidence must be comparable, how funding and named capacity enter the decision, how regulatory or urgent work changes the queue, what an approval displaces, and when a forecast change requires reprioritization.

It will also separate portfolio governance from a generic steering committee. A meeting becomes part of a closed loop only when its decision rights, inputs, outputs, owners, and next review conditions are explicit.""",
        content="""## The minimum shape

Until that operating model is complete, the manuscript can state the minimum obligations:

1. A proposal must earn admission before it competes for capacity.
2. Priority must be assigned by an actor who owns the displacement, not inferred by the receiving team.
3. The decision must preserve the evidence and assumptions used at the time.
4. Approval must identify which funding, expertise, and capacity it expects to consume.
5. A change in outcome, cost, dependency, risk, or forecast must return to the authority affected by that change.
6. Stopping work is a portfolio decision, not evidence that the original team failed.

These obligations are enough to expose a fake prioritization system. They are not yet enough to operate a good one.""",
        closing="Once the organization has selected a claim on its attention, the work is still not ready for implementation. Selection authorizes deeper judgment; it does not make the design true.",
        provenance="0.Organizational-Excellence-Book-Gaps.md synthesis; mechanisms from Work Intake, Process Improvement, and Writing Work Items",
        unnumbered=True,
    )

    chapters["chapters/04-frame-before-design.md"] = compose(
        "Frame the Work Before Designing It",
        "III — Framing and Authorizing Work",
        "Selection gives a problem permission to consume discovery and design effort. It does not justify premature decomposition. Framing keeps the problem class, constraints, non-goals, expected reasoning artifact, and downstream decisions visible long enough for design to respond to reality rather than to the wording of the initial request.",
        replace_many(
            sections(
                framing,
                [
                    "1. Usage",
                    "2. The Five-Box Framing Scaffold",
                    "3. Determine Whether the Work Is Ready for Design or Execution",
                    "5. Design Gate: Well-Defined Requirements",
                    "6. Design Gate: Performance, Failure, and Recovery",
                    "7. Design Gate: Operational Impact and Accountability",
                    "8. Manage Complexity Where People Can Afford It",
                    "9. Evaluate Tooling and Flexibility as Operating Decisions",
                    "10. Design Gate: Pre-Mortems",
                ],
            ),
            {
                "The questions in this guide": "The questions in this chapter",
                "This guide uses **discovery package**": "This chapter uses **discovery package**",
            },
        ),
        future="A future version will sharpen the diagnostic between the visible instance and the underlying problem class, add a full enterprise example of a locally defensible decision exporting incoherence across team boundaries, and name field vision more directly: preserving likely change paths without pretending to predict every future feature.",
        closing="Framing produces the evidence a responsible design commitment requires. The organization still needs a legitimate authorization path: reviewers must exercise distinct authority, conditions must remain real, dependencies must become commitments, and delivery capacity must be accepted by the people who own it.",
        provenance=f"{framing}: sections 1–3 and 5–10",
    )

    chapters["chapters/05-legitimate-commitment.md"] = compose(
        "Make the Commitment Legitimate",
        "III — Framing and Authorizing Work",
        "A good frame can still enter a bad governance process. Review bodies can average unlike authorities, conditional approval can become soft permission to build, and delivery teams can inherit dependencies that were listed but never committed. Authorization is legitimate only when each decision remains attached to the actor allowed to make it and when the assembled record states exactly what may happen next.",
        sections(
            work_intake,
            [
                "Discovery and Implementation Are Different Commitments",
                "Requesters Supply Facts; the System Derives Consequences",
                "Review Is Ordered, Modular, and Decisive",
                "Review Decisions",
                "Preparation Buys Execution Freedom",
                "From Proposal to Authorized Work",
                "Capacity Is an Acceptance Decision",
                "Delivery Changes the Forecast, Not the Past",
            ],
        ),
        future="A future version will generalize decision-record rules beyond Work Intake, RFPs, and Managed Runoff. It will explain how reversibility changes the evidence burden, who owns later reconciliation when decision and delivery ownership differ, and when a domain record should supersede rather than duplicate the general decision record.",
        closing="Authorization preserves the organizational decision. Delivery planning must now translate that decision into executable work without quietly changing its outcome, boundary, or acceptance conditions.",
        provenance=f"{work_intake}: Discovery and Implementation through Delivery Changes the Forecast",
    )

    chapters["chapters/06-executable-work.md"] = compose(
        "Turn Decisions Into Executable Work",
        "III — Framing and Authorizing Work",
        "Work decomposition is a translation step. An Epic, work package, story, or task should make one layer of completion legible without replacing the decision that authorized the work. When decomposition begins before the outcome, uncertainty, and boundaries are stable enough, the backlog does not reduce ambiguity; it distributes ambiguity across smaller containers.",
        replace_many(
            sections(
                work_items,
                [
                    "1. Why this exists",
                    "2. The work hierarchy",
                    "3. Writing outcomes (for epics)",
                    "4. Acceptance criteria (for stories / work packages)",
                    "5. Three things people confuse: DoD vs. Acceptance vs. Outcome",
                    "6. Demand-driven work is first-class",
                    "7. Splitting & sizing",
                    "8. Definition of Ready",
                ],
            ),
            {
                "Everything else in this document": "Everything else in this chapter",
                "the rest of the doc": "the rest of the chapter",
                "out of scope for this document": "outside the present argument",
                "which is the whole point of this document": "which is the governing point of this chapter",
                "the limit case of everything in this document": "the limit case of the work-definition model",
                "[Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome)": "[the distinction among DoD, acceptance, and outcome](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome)",
                "[Section 7](#7-splitting--sizing)": "[splitting and sizing](#7-splitting--sizing)",
                "[Section 2](#2-the-work-hierarchy)": "[the work hierarchy](#2-the-work-hierarchy)",
                "[Section 3](#3-writing-outcomes-for-epics)": "[writing outcomes](#3-writing-outcomes-for-epics)",
                "[Section 4](#4-acceptance-criteria-for-stories--work-packages)": "[acceptance criteria](#4-acceptance-criteria-for-stories--work-packages)",
                " (Section 6)": "",
                "This is where the epic/outcome machinery in Sections 2–5 lives.": "This is where the outcome, acceptance, and workmanship machinery above applies.",
                "Epics with outcomes (Sections 2–5)": "Epics with outcomes and item-level proof",
                "Sections 2–5 are all machinery": "The outcome, acceptance, and workmanship rules above are machinery",
                "Full machinery, Sections 2–5": "Full outcome, acceptance, and workmanship machinery",
                " (Section 3)": "",
                " (Section 2)": " described above",
                " (Section 4)": "",
                " (Section 5)": "",
                " (Section 7)": "",
            },
        ),
        closing="Once work is executable, the organization needs an operating system that can see it, control how much is active, distinguish planned work from interruption, and turn repeated demand into evidence that the system itself should change.",
        provenance=f"{work_items}: sections 1–8; templates moved to Appendix A",
    )

    chapters["chapters/07-visible-operating-system.md"] = compose(
        "Make the Operating System Visible",
        "IV — Operating, Improving, and Retiring the System",
        "An organization cannot improve work it cannot see, and it cannot see work merely because tickets exist somewhere. Visibility requires a stable taxonomy, a common record, explicit work-in-progress policy, a baseline, and enough protection from interruption for planned improvement to survive contact with ordinary demand.",
        replace_many(
            sections(
                process,
                [
                    "1. Why Process Improvement",
                    "2. The Maturity Ladder",
                    "3. Work Taxonomy",
                    "4. Establishing the Foundation",
                    "5. Handling Operational Reality",
                ],
            ),
            {
                "The examples in this document": "The examples here",
            },
        ),
        future="A future version will add the Eight Wastes of Engineering before the improvement method. The gate will ask whether work should exist before helping a team execute it more efficiently, while preserving the distinction between genuine waste and necessary discovery, resilience, recovery, security, compliance, or documentation.",
        closing="Visibility exposes recurrence. The organization can now decide whether repeated manual work should remain delivery, become standard work, or justify changing the system that keeps producing it.",
        provenance=f"{process}: sections 1–5",
    )

    chapters["chapters/08-convert-recurrence.md"] = compose(
        "Convert Recurrence Into Improvement",
        "IV — Operating, Improving, and Retiring the System",
        "Recurring work is not merely a queue-management problem. It is evidence about the operating model. The improvement loop begins when the organization stops treating each repeated request as an isolated success and asks whether the pattern should be documented, standardized, automated, prevented, or consciously retained.",
        replace_many(
            sections(
                process,
                [
                    "6. The Standardization and Automation Ladder",
                    "7. Planning and Execution",
                    "8. Measuring Success",
                    "9. Retrospectives",
                ],
            ),
            {
                "For more information: [Scrum.org — What is a Sprint Review]": "The distinction between a retrospective and a Sprint Review is documented by [Scrum.org — What is a Sprint Review]",
            },
        ),
        closing="Retrospectives, metrics, and recurring-demand evidence create several review loops. Without a defined cadence and decision boundary, those loops tend to collapse into status meetings or operate as unrelated ceremonies.",
        provenance=f"{process}: sections 6–9",
    )

    chapters["chapters/09-operating-cadence.md"] = compose(
        "Future Edition: Operating Cadence",
        "IV — Operating, Improving, and Retiring the System",
        """A cadence is the time structure that forces claims back into judgment. It determines when the organization reviews flow, risk, delivery forecasts, process defects, talent evidence, portfolio assumptions, and completed outcomes. The meeting is only the visible container; the operating mechanism is the recurring obligation to read a defined artifact and leave behind a decision, changed state, or explicit decision not to act.

The existing sources define several credible loops in isolation. Process Improvement supplies daily flow visibility, periodic retrospectives, and stakeholder review. Work Intake defines proposal review, delivery readiness, forecast changes, and outcome reconciliation. Managed Runoff defines lifecycle checkpoints. TDA puts development evidence into one-on-ones, quarterly reconciliation, and review cycles. RFPs add selection, acceptance, burn-in, and post-implementation review. The corpus does not yet define how these loops coexist without asking the same people to review the same evidence in several rooms.""",
        future="""A future version will define a minimum viable cadence by decision rather than by inherited meeting name. It will state what must be reviewed daily, weekly, monthly, quarterly, and annually; which role or body may make each decision; which artifact enters; which state change must leave; and which urgent risks may bypass normal timing.

It will also define what must not travel. Retrospectives and developmental conversations lose signal when they are converted into upward performance reports. Executive visibility requires selected operational evidence, not universal access to every learning record.""",
        content="""## The current design rules

Until the full cadence exists, the distributed source material supports six rules:

1. Separate flow review, learning review, portfolio judgment, risk escalation, people development, and formal performance decisions.
2. Give each review a named decision right; a meeting that can only discuss status is not a control loop.
3. Identify the authoritative input and the state change or artifact the review must produce.
4. Route exceptions back to the authority that owns the affected risk, funding, priority, or capacity.
5. Expire exceptions and conditional approvals; time does not make an unmet condition true.
6. Aggregate only the evidence needed for the next decision. Preserve case-level context where aggregation would change its meaning.

These rules are sufficient to audit an existing meeting system. They are not a finished operating calendar.""",
        closing="Cadence keeps active systems under review. Lifecycle discipline answers a different question: what changes when the organization has decided that a system should no longer receive normal investment at all?",
        provenance="Gap-map synthesis from Process Improvement, Work Intake, Managed Runoff, TDA, and RFP source material",
        unnumbered=True,
    )

    runoff_sections = [
        "Purpose",
        "The Core Distinction",
        "Relationship to Existing Frameworks",
        "When Managed Runoff Applies",
        "KO Is Not Kill",
        "The Zombie Service Failure Mode",
        "Allowed, Questionable, and Disallowed Work",
        "Operating Model",
        "Process Shape",
        "Decision Checkpoints",
        "Evidence and Artifacts",
        "Risk and Exception Handling",
        "What To Strip Down Under Lower-Risk Conditions",
        "Common Anti-Patterns",
        "What Managed Runoff Changes",
    ]
    chapters["chapters/10-managed-runoff.md"] = compose(
        "Managed Runoff",
        "IV — Operating, Improving, and Retiring the System",
        "Continuous improvement becomes incoherent when the organization keeps improving an asset it has already decided should disappear. Managed runoff changes the investment classification: the old path may still require safety, continuity, migration, knowledge extraction, and shutdown work, but it no longer receives ordinary product logic.",
        sections("Managed-Runoff-for-Deprecated-Services.md", runoff_sections),
        future="A future version will add a lightweight decision record, examples beyond deprecated services, clearer exception authorities by risk type, and the connection between runoff decisions and broader architecture or portfolio records.",
        closing="The operating system now covers demand, commitment, execution, improvement, and retirement. The same loop applies to capability: organizations must decide what to develop internally, what to acquire externally, which evidence supports those judgments, and how the result changes the next decision.",
        provenance="Managed-Runoff-for-Deprecated-Services.md, complete argument with open TODO list converted to future-edition note",
    )

    chapters["chapters/11-development-architecture.md"] = compose(
        "Development Is an Organizational Architecture",
        "V — Developing and Acquiring Capability",
        "Organizations often treat development as a manager trait or an employee responsibility. That framing hides the allocation decisions that determine who receives useful work, who receives observation, who gets safe opportunities to practice, and whose evidence survives long enough to support the next decision. Development is an operating system before it is a conversation.",
        sections(
            tda,
            [
                "Purpose",
                "The Core Model",
                "What TDA Owns—and Where It Stops",
                "The Implementation Packet",
            ],
        ).replace(
            "The public templates are here:",
            "The implementation packet uses four connected artifacts, reproduced together in Appendix C:",
        ).replace(
            "[TDA Personal Development Plan](docs/templates/tda-personal-development-plan.html)",
            "[TDA Personal Development Plan](../appendices/c-tda-workbook.md#tda-personal-development-plan)",
        ).replace(
            "[TDA Competency Calibration](docs/templates/tda-competency-calibration.html)",
            "[TDA Competency Calibration](../appendices/c-tda-workbook.md#tda-competency-calibration)",
        ).replace(
            "[TDA 70-20-10 Development Plan](docs/templates/tda-70-20-10-development-plan.html)",
            "[TDA 70-20-10 Development Plan](../appendices/c-tda-workbook.md#tda-70-20-10-development-plan)",
        ).replace(
            "[TDA Performance Evidence Ledger](docs/templates/tda-performance-evidence-ledger.html)",
            "[TDA Performance Evidence Ledger](../appendices/c-tda-workbook.md#tda-performance-evidence-ledger)",
        ),
        closing="The architecture identifies the loop and its records. Managers still need a recurring practice for producing evidence without turning feedback into character judgment or annual memory reconstruction.",
        provenance=f"{tda}: Purpose, Core Model, boundaries, and implementation packet",
    )

    coaching = replace_many(
        sections(
            "Coaching-and-Calibration-Guide.md",
            [
                "Purpose",
                "Part 1 — Describe Behavior, Not Character",
                "Part 2 — The Evidence Ledger",
                "Part 3 — Separating the Concerns",
                "How this guide relates to the ladder",
            ],
        ),
        {
            "## How this guide relates to the ladder": "## How the evidence practice relates to the ladder",
            "This guide is about the integrity of the *act of judging* against them:": "The evidence practice protects the integrity of the *act of judging* against them:",
            "This guide addresses those three.": "This chapter addresses those three.",
        },
    )
    management_practice = replace_many(
        sections(
            tda,
            [
                "Principle 4: Coaching Updates the Mental Model",
                "One-on-Ones",
                "Two Levels of Evidence",
            ],
        ),
        {
            "The full practice of running one-on-ones well deserves its own, dedicated, piece. TDA only provides the operating requirement:": "The current source material establishes the minimum operating requirement:",
        },
    )
    chapters["chapters/12-management-evidence.md"] = compose(
        "Management Is Evidence Infrastructure",
        "V — Developing and Acquiring Capability",
        "A career ladder does not make people decisions fair. The judgment depends on the quality of the evidence, the language used to describe it, the incentives of the person reading it, and whether the organization created the work that could have produced the expected evidence in the first place.",
        coaching + "\n\n" + management_practice,
        future="A future version will expand one-on-ones from a minimum operating requirement into the recurring management venue: cadence, preparation, agenda shape, confidentiality, constraint discovery, career alignment, coaching follow-up, evidence capture, and the boundary with formal performance management.",
        closing="Evidence can diagnose capability honestly only when the organization also examines opportunity. A person cannot demonstrate an operating mode the system never permits them to practice.",
        provenance="Coaching-and-Calibration-Guide.md: Purpose through ladder relationship; Talent-Development-Architecture.md: coaching, One-on-Ones, and Two Levels of Evidence",
    )

    chapters["chapters/13-safe-reps-and-opportunity.md"] = compose(
        "Create Safe Reps and Allocate Opportunity",
        "V — Developing and Acquiring Capability",
        "Development becomes real when the organization changes work allocation. Preference, stretch, and career direction only produce capability when they lead to legitimate practice under boundaries that protect both the person and the system.",
        sections(
            tda,
            [
                "Principle 1: Preference Is Evidence, Not a Perk",
                "Principle 2: Forced Stretch Has an Elastic Limit",
                "Principle 3: Diagnose Utilization Before Judging Performance",
                "Principle 5: Every Career Transition Gate Needs a Safe-Reps Path",
                "Stretch Proposals",
                "The Internal Farm System",
                "Career Pathing Needs Architecture",
                "Career-Stage Development",
                "Leadership Discovery and Development",
                "Organizational Learning From Talent Evidence",
            ],
        ),
        closing="Internal development is one answer to a capability gap. External hiring is another. The organization needs to know which capability it lacks, whether it can create that capability in time, and what evidence should survive whichever path it chooses.",
        provenance=f"{tda}: preference, forced stretch, utilization, safe reps, opportunity systems, career stages, and organizational learning",
    )

    chapters["chapters/14-hiring-capability.md"] = compose(
        "Future Edition: Hiring Capability",
        "V — Developing and Acquiring Capability",
        """Hiring is external talent intake. It should begin with the capability the organization needs, preserve what selection evidence actually showed, and deliver likely support or development needs into onboarding rather than discarding them after the offer.

The current reader-facing corpus establishes that relationship but does not yet supply a hiring system. TDA distinguishes hiring from internal development and succession, and it requires the evidence gathered during selection to become manager context and safe-reps planning. That is enough to locate hiring in the book. It is not enough to tell a reader how to evaluate an application or run a valid AI-era interview.""",
        sections(tda, ["Hiring and Free Agency"]),
        future="""A future version will add the Hiring Guide. Its working argument begins with an advertised quality contract: candidates should know that the application is their first submitted work artifact, that AI-assisted review tools are permitted, and that they remain accountable for the truth and quality of the result.

The interview material will evaluate the work the job now requires: decomposition, tool direction, verification, correction, security judgment, and explanation of why the result is trustworthy. It will also identify where foundational unaided knowledge still matters and prevent AI assistance from hiding incompetence.

The final hiring loop will preserve the original capability need, application evidence, interview claims, work-sample evidence, assumptions, selection rationale, post-hire support needs, and a later reconciliation against actual performance and organizational support.""",
        closing="Hiring acquires capability through a person. Vendor selection acquires capability through a commercial and technical relationship. The ethical, legal, and developmental obligations differ, but both decisions expose how easily an organization can confuse a persuasive claim with proof.",
        provenance=f"{tda}: Hiring and Free Agency; future scope from 0.Organizational-Excellence-Book-Gaps.md",
        unnumbered=True,
    )

    chapters["chapters/15-selecting-external-capability.md"] = compose(
        "Selecting External Capability",
        "V — Developing and Acquiring Capability",
        """An RFP is external work intake. It is the same evidence-and-authorization system used for internal proposals after the request crosses a commercial trust boundary.

The need must still be authenticated. Claims must still be preserved. Distinct authorities must still review the consequences they own. Unknowns must still become bounded proof. Capacity, risk, and acceptance must still be explicit. The result must still be reconciled against the original claim. What changes is the posture toward the claimant.""",
        """## One intake system, two trust boundaries

Internal intake is cooperative even when it is contentious. The requester, sponsor, reviewers, and receiving teams remain accountable to the same enterprise. Their incentives may conflict locally, but each has a duty to help the organization reach a valid decision and expose facts that could change it.

External intake is adversarial. That does not mean every vendor is dishonest or that the buyer should behave with hostility. It means the counterparty is paid when the buyer says yes. For control-design purposes, assume that making the sale is the vendor's dominant objective and that fit, implementation burden, long-term support, and the buyer's exit problem are secondary until the agreement makes them material.

The vendor is therefore an interested claimant, not an authority on whether its own claim has been proved. A polished demonstration is testimony. A benchmark selected and run by the seller is seller-supplied evidence. A reassuring relationship with one sales representative is not a durable operating control: the people involved in the sale may not own implementation, support, renewal, or the consequences years later. The record and the contract must survive everyone in the room.

The lifecycle does not change:

| Decision function | Internal work intake | External intake / RFP |
|---|---|---|
| Establish the need | Authenticated Work Proposal and sponsor | Buyer-owned capability statement and accountable sponsor |
| Preserve the claim | Requester facts, assumptions, target condition | Vendor response, exceptions, assumptions, and claim register |
| Route authority | Architecture, Security, Finance, operations, portfolio, and delivery reviews | The same internal authorities plus Procurement and Legal |
| Resolve uncertainty | Bounded discovery or Conditional Approval | Buyer-controlled demonstration, benchmark, reference check, or proof of concept |
| Authorize commitment | Authorized Work Proposal plus accepted delivery capacity | Award decision, negotiated obligations, funding, and implementation authority |
| Prove completion | Delivery evidence against acceptance conditions | Layered acceptance, burn-in, remedies, and payment gates |
| Reconcile | Baseline and forecast against delivered outcome | Original need and vendor claims against production operation |

The adversarial boundary changes the burden of proof. Internally, missing evidence may be repaired through shared discovery because the participants are working for the same outcome. Externally, an unsupported claim remains the seller's burden, proof conditions belong to the buyer, and ambiguity that survives into the contract usually becomes the buyer's cost.

This is the book's main rule crossing a trust boundary. The RFP does not introduce a separate procurement philosophy. It makes the intake philosophy easier to see because sales incentives punish every missing control.

"""
        + sections(
            rfp,
            [
                "Why RFPs Exist",
                "The Failure Mode: Buying Activity Instead of Capability",
                "RFP as Operational Risk Transfer",
                "Before the RFP",
                "RFP Document Anatomy",
                "Requirements Structure",
                "Process Stages",
                "Scoring and Evaluation Principles",
                "Vendor Demonstrations and Proofs of Concept",
                "The Vendor Claim Register",
                "Decision Records",
            ],
        ),
        closing="A strong selection record preserves the need, the claims, the comparison, and the accepted risks. The capability still does not exist. Delivery, burn-in, acceptance, payment, and later operation must grade the selected claim against reality.",
        provenance=f"Book-level synthesis connecting Work Intake to external acquisition; {rfp}: Why RFPs Exist through Decision Records",
    )

    chapters["chapters/16-proving-external-capability.md"] = compose(
        "Proving and Accepting External Capability",
        "V — Developing and Acquiring Capability",
        "Procurement ends too early when delivery, installation, or a green dashboard becomes evidence that the organization received the capability it intended to buy. Acceptance must remain attached to the requirements, failure conditions, operational handoff, support obligations, and proof defined before production pressure made rejection politically expensive.",
        sections(
            rfp,
            [
                "Acceptance, Burn-In, and Payment",
                "What to Strip Down Under Lower-Risk Conditions",
                "Common Failure Modes",
                "Post-Implementation Review",
            ],
        ),
        future="A future version will make the shared intake lifecycle even more explicit with a paired internal/external example: the same need, claim, review, proof, authorization, acceptance, and reconciliation decisions shown on both sides of the trust boundary. The implementation detail will remain inline because the reader must be able to derive the method from a complete example, not merely be told to choose appropriate requirements or metrics.",
        closing="Each domain now has some form of reconciliation: work, systems, talent, and vendors. Enterprise learning begins when those local reviews change portfolio and executive decisions without destroying the context that made the evidence honest.",
        provenance=f"{rfp}: Acceptance through Post-Implementation Review; tools moved to Appendix E",
    )

    chapters["chapters/17-reconciling-enterprise.md"] = compose(
        "Future Edition: Reconciling the Enterprise",
        "VI — Reconciling the Enterprise",
        """Local loops do not automatically produce organizational learning. A team can reconcile a delivery forecast, a selection group can grade vendor claims, a manager can preserve development evidence, and a retirement owner can track remaining dependencies while the enterprise continues making the same class of decision from scratch somewhere else.

The enterprise layer has two obligations that pull in opposite directions. It must move enough evidence across boundaries for repeated patterns to change funding, policy, staffing, and governance. It must also preserve enough local context that the aggregate does not turn unlike cases into one clean but misleading score.

The current sources contain the pieces. Work Intake preserves an Approved Delivery Baseline and a changing Delivery Forecast. RFPs connect claims to acceptance and operating outcomes. Managed Runoff compares lifecycle intent with actual dependencies and exceptions. TDA separates the individual ledger from the aggregate Behavioral Scoreboard. Process Improvement distinguishes internal instrumentation from the narrow number leadership may need. What is missing is the rule for combining them.""",
        future="""A future version will define benefits realization across projects and portfolios, the executive translation layer, evidence-retention and data-quality rules, and the boundary between local learning records and upward reporting.

It will specify which claims roll up, which artifacts remain protected, who owns interpretation, what decision the aggregate evidence is meant to change, and how a person affected by a correction can distinguish a revised record from rewritten history.

It will also address opportunity capture alongside risk capture. An evidence system designed only to prevent loss will teach the organization to see danger more clearly than possibility.""",
        content="""## The current enterprise rule

The strongest rule the current material can support is this:

> Aggregate a claim only to the level required by the decision it is meant to change, and preserve the case-level evidence needed to challenge the aggregate.

That rule prevents several familiar failures. A performance rating cannot replace the assignments, constraints, and observed behavior behind it. A project status cannot replace the baseline, forecast history, and expected benefit. A vendor score cannot replace the claims, proof conditions, and operating burden. An executive number may direct attention; it cannot explain the system by itself.

Enterprise reporting should therefore begin with the decision, not the dashboard. Who can act? What evidence would change the action? Which comparison is legitimate? What context would make the number misleading? When will the decision be reviewed again? A report that cannot answer those questions is another box score detached from the game.""",
        closing="The enterprise evidence problem becomes sharper when AI can produce, summarize, and recombine organizational artifacts at very low cost. Cheap documentation can close loops, or it can make loop theater cheaper.",
        provenance="0.Organizational-Excellence-Book-Gaps.md synthesis from Work Intake, RFPs, Managed Runoff, TDA, and Process Improvement",
        unnumbered=True,
    )

    chapters["chapters/18-ai-context-leverage.md"] = compose(
        "Future Edition: AI, Context, and Organizational Leverage",
        "VI — Reconciling the Enterprise",
        """AI changes the economics of work whose value arrives later than its cost. Decision records, reconciliations, evidence ledgers, structured intake, runbook drafts, and context maintenance often fail because the person doing the work pays now while an unknown future reader receives the benefit. Lowering the activation energy can make those artifacts economically possible.

That does not make every generated artifact useful. AI can produce forms, summaries, dashboards, policies, and meeting records faster than an organization can create a reason for anyone to read them. The same tool that makes context preservation cheaper also makes procedural theater cheaper.""",
        sections(tda, ["Technology Cannot Substitute for Development Architecture"])
        + "\n\n"
        + """## The operating test

AI should enter a closed loop as labor, not authority.

It may reconstruct context, identify missing fields, compare a forecast with an outcome, draft a discussion artifact, surface contradictory records, or make deferred-payoff documentation cheaper. The accountable actor still decides what is true, what risk is accepted, what action follows, and what evidence would cause the decision to change.

If generated work is not routed to someone required to read it and no later decision is reconciled against it, the organization has automated document production rather than organizational learning.""",
        future="""A future version will develop the context-control-plane argument: how an organization reconstructs the right context for a decision, aligns tools with its cognitive capital, preserves authority boundaries, and prevents generated synthesis from replacing accountable judgment.

It will distinguish high-value stranded toil from work whose difficulty is itself the control. It will also define verification, provenance, access, retention, correction, and review expectations for AI-produced organizational artifacts.""",
        closing="A book about operating systems should end by showing how to begin without installing the whole system at once. Adoption has its own capacity cost, evidence requirements, and failure modes.",
        provenance=f"{tda}: Technology Cannot Substitute for Development Architecture; future scope from gap map",
        unnumbered=True,
    )

    chapters["chapters/19-implementation-roadmap.md"] = compose(
        "An Implementation Roadmap",
        "VI — Reconciling the Enterprise",
        """The complete system is not a responsible starting point. Every new artifact creates maintenance, every review consumes attention, and every metric creates an incentive whether the designer intended one or not. Adoption should begin with the smallest set of controls that makes a real failure visible and produces evidence for the next change.

The current source material supports a sequence:

1. Make work visible.
2. Standardize the front door and work types.
3. Define completion conditions.
4. Record important decisions and assumptions.
5. Add a risk-find path with an urgent exception route.
6. Add post-implementation reconciliation.
7. Add people-system evidence loops.
8. Add aggregate leverage metrics only after the capture layers produce trustworthy data.

The order is causal. Metrics arrive after records. Enterprise synthesis arrives after local reconciliation. Automation arrives after the work is understood well enough to know which behavior should become repeatable.""",
        content="""## Start with one closed loop

Do not begin by rolling out the book. Begin with one recurring organizational failure whose cost is already visible to the people doing the work.

A responsible pilot needs six things before it starts:

| Pilot element | Minimum answer |
|---|---|
| **Observed failure** | The repeated condition the organization wants to change, stated without prescribing the solution |
| **Baseline** | What happens now, how often, under which conditions, and how trustworthy the current measurement is |
| **Owner** | The actor accountable for the outcome and the actors who own affected risk, capacity, and acceptance |
| **Outcome** | The observable condition that would justify calling the intervention successful |
| **Evidence path** | Which fields, artifacts, tests, and observations will supply the answer, and who must read them |
| **Review point** | The date or event that forces a decision to continue, change, scale, stop, or investigate further |

The pilot is not funded merely because the table exists. Leadership must also say what stops or receives less capacity while the team builds the new records, learns the workflow, and performs the review. If nothing stops, the pilot is spare-time work with executive branding.

## A tracer-bullet implementation

Return to the registration example from the work-item chapter. Over a rolling ninety days, the demand queue shows twenty-three incidents caused by manual registration re-runs after endpoint certificate rotation. The incidents consumed approximately thirty-one staff-hours.

That evidence is enough to justify attention. It is not enough to justify a favorite solution. The implementation proceeds through the same loop the book has applied everywhere else.

### 1. Make the demand observable

The incident type requires a closed, resolution-gated cause field. One allowed cause is **manual registration re-run after endpoint certificate rotation**. Time comes from the worklog rather than a hand-entered estimate. The first review checks classification quality as well as incident count; a precise total built from optional or inconsistently used fields is false confidence.

The initial baseline records:

- 23 matching incidents in 90 days;
- approximately 31 staff-hours of recorded handling time;
- the number of certificate rotations during the same period;
- the environments and endpoint regions affected;
- time to restore registration;
- how many records lack a valid cause or worklog; and
- any customer-visible or security consequence.

This is not measurement theater. Each field answers a later decision. Incident count establishes recurrence. Hours estimate capacity cost. Rotation count supplies the denominator that distinguishes a frequent trigger from a generally unreliable system. Region and environment expose scope. Restore time and consequence protect against optimizing labor while making recovery or risk worse. Missing-field rate states how much confidence the organization should place in the baseline.

### 2. Authorize discovery before authorizing a build

The discovery package asks why certificate rotation requires manual registration, which systems own certificate issuance and registration, whether the behavior differs by region, what failure and recovery paths exist, and which constraints a safe change must preserve.

Its completion condition is a decision-ready artifact: the observed failure mechanism, viable options, non-goals, affected owners, proof conditions, and a recommendation. A responsible result may be that the apparent pattern combines several causes and should not become one automation project. That is useful company work. Discovery prevented the organization from automating a false category.

### 3. Define the outcome before choosing the metric

Assume discovery confirms one repairable cause. The governing Epic receives this outcome:

> No host requires a manual registration re-run after certificate rotation, verified by zero demand incidents with this cause for ninety consecutive days after rollout and successful automated re-registration observed across at least two regional endpoints.

The metric follows from the claim:

| Role | Metric | Why it exists |
|---|---|---|
| **Primary outcome** | Matching incidents per rolling 90 days | Directly tests whether the demand source disappeared |
| **Capacity consequence** | Staff-hours spent on the matching cause | Tests whether the change reclaimed effort rather than relabeling it |
| **Exposure denominator** | Certificate rotations and affected hosts | Prevents a quiet period with no rotations from looking like success |
| **Leading implementation evidence** | Successful automated re-registration tests across two regions | Shows that the mechanism exists before the full outcome horizon passes |
| **Data-quality control** | Percentage of relevant incidents with valid cause and worklog | States whether the outcome metric can be trusted |
| **Guardrails** | Failed registrations, restore time, security exceptions, and manual-override success | Prevents local labor reduction from exporting greater operational risk |

Velocity is not the outcome. Scripts written is not the outcome. Tickets closed is not the outcome. Automation coverage may describe the intervention, but the intervention earns its value only if the original demand falls without violating the guardrails.

The team did not “decide which metrics are relevant” in the abstract. It wrote a falsifiable outcome, identified the ways that outcome could appear true while the system remained bad, and chose the smallest set of measures that expose those failure modes.

### 4. Build through bounded work

The authorized Epic can now decompose into discovery already completed, implementation work packages, tests, deployment, documentation, and operational handoff. Each child item gets its own acceptance criteria. Standing workmanship gates still apply. Closing every child does not close the Epic if matching demand continues.

The team keeps a manual recovery path until the acceptance authority has seen successful behavior under representative rotation conditions. If implementation changes the failure model, risk owner, operational burden, or expected horizon, the delivery forecast changes and the affected authority receives the new decision. The original baseline remains unchanged.

### 5. Review at the cadence required by the evidence

The board may be reviewed weekly for flow and blockage. Automated re-registration evidence is reviewed after each representative certificate rotation. Data quality is checked while incidents are still being classified. The outcome cannot be reconciled until the ninety-day horizon has passed under enough actual exposure to make the result meaningful.

Those are different reviews because they answer different questions. Combining them into one generic status meeting would either delay operational decisions or pretend the outcome is known before reality has had time to answer.

### 6. Reconcile before scaling

At the review point, the owner compares the original baseline, discovery claims, forecast history, implementation evidence, outcome metric, and guardrails. The decision is not automatically “roll this process out everywhere.”

Possible results include:

- the cause disappeared and the approach is safe enough to standardize;
- the cause declined but the remaining cases reveal another problem class;
- handling time fell while operational risk rose, requiring correction or rollback;
- the automation works but the capture system is too incomplete to support the claim;
- the intervention failed and should stop; or
- discovery and measurement produced a better target than the one the pilot began with.

The pilot succeeds organizationally when it produces a better next decision. A technically successful automation with no preserved baseline, no guardrails, and no later review may save time, but it does not yet prove the operating system.

## Scale the mechanism, not the ceremony

After one complete loop works, reuse only what proved necessary: the classification field, decision record shape, review boundary, acceptance evidence, metric logic, or escalation path. Do not copy every meeting and artifact into a domain with different risk.

The next pilot should begin with another costly open loop, not with a mandate that every team adopt the template. The reusable object is the causal pattern: claim, context, owner, evidence, review, reconciliation, next decision. The implementation remains accountable to local conditions.
""",
        future="""A future version will define how process assets are versioned, tailored, reviewed, corrected, and retired. A process that can only be added is another managed-runoff problem waiting to happen.

The Risk Find step remains unresolved. Future work must define structured triage, urgency, ownership, escalation, and the conditions under which a significant issue bypasses normal operating cadence. Until that work is complete, the sequence names the missing control without pretending to supply a reader-facing standard.""",
        closing="The preview ends where implementation begins: with an operating hypothesis small enough to test, evidence strong enough to grade it, and a review point that forces the next decision.",
        provenance="Book-level synthesis from Process Improvement adoption guidance, Work Intake, Writing Work Items, and the gap-map implementation sequence",
    )

    chapters["appendices/00-appendices.md"] = (
        "# Reusable Instruments and References {.unnumbered}\n\n"
        "\\appendix\n\n"
        "The narrative explains why each instrument exists. The appendices preserve the fields, prompts, and reference structures needed to use the operating model without forcing the main argument to carry every implementation detail.\n"
    )

    chapters["appendices/a-framing-and-work-item-tools.md"] = compose(
        "Appendix A: Framing and Work-Item Tools",
        "Appendices",
        "These instruments support the transition from ambiguity to a reviewable frame and from an authorized outcome to executable work.",
        sections(framing, ["4. Discovery Package Template", "11. Design-Informing Example: A DNS Service"])
        + "\n\n"
        + sections(work_items, ["9. Templates", "10. Quick reference"]),
        provenance=f"{framing}: Discovery Package Template and DNS example; {work_items}: Templates and Quick reference",
    )

    chapters["appendices/b-conversation-planner.md"] = compose(
        "Appendix B: Conversation Planner",
        "Appendices",
        "Use this worksheet before a difficult, high-stakes, or emotionally loaded conversation. It supports the management-evidence chapter without converting the worksheet itself into narrative.",
        without_title("Conversation Planner.md"),
        provenance="Conversation Planner.md, complete worksheet",
    )

    tda_templates = [
        ("TDA-Personal-Development-Plan-Template.md", "TDA Personal Development Plan"),
        ("TDA-Competency-Calibration-Template.md", "TDA Competency Calibration"),
        ("TDA-70-20-10-Development-Plan-Template.md", "TDA 70-20-10 Development Plan"),
        ("TDA-Performance-Evidence-Ledger-Template.md", "TDA Performance Evidence Ledger"),
    ]
    workbook_blocks = []
    for filename, title in tda_templates:
        workbook_blocks.append(f"## {title}\n\n{shift_headings(without_title(filename), 1)}")
    chapters["appendices/c-tda-workbook.md"] = compose(
        "Appendix C: Talent Development Workbook",
        "Appendices",
        "The four instruments form one loop: personal context becomes competency calibration, calibration becomes a real-work development plan, and the resulting evidence feeds the next decision.",
        "\n\n".join(workbook_blocks),
        provenance="; ".join(filename for filename, _ in tda_templates),
    )

    chapters["appendices/d-career-reference.md"] = compose(
        "Appendix D: Career Progression Reference",
        "Appendices",
        "This preview includes the book-level portions of the career framework: the progression model, scope and opportunity distinctions, management crosswalk, calibration operating model, and promotion evidence. The complete level-by-level ladder remains available as a companion source document.",
        sections(
            "Career-Progression-Guide.md",
            [
                "Purpose",
                "Executive Summary",
                "How to Use the Ladder",
                "Individual Contributor Ladder at a Glance",
                "Staff+ Operating Archetypes",
                "Finding and Creating Next-Level Scope",
                "Management and Executive Track Crosswalk",
                "Performance Management and Calibration Operating Model",
                "Promotion Calibration Rules",
                "Common Miscalibrations",
                "Promotion Packet Template",
            ],
        ),
        future="A future assembly decision will determine whether the full IC1–IC9 and MGR4–EX11 ladder belongs inside the book or remains a separately published companion reference. This preview keeps the narrative moving while preserving the framework needed to understand the people chapters.",
        provenance="Career-Progression-Guide.md, selected reference sections; detailed grade descriptions omitted from preview",
    )

    chapters["appendices/e-rfp-tools.md"] = compose(
        "Appendix E: Vendor-Selection Tools",
        "Appendices",
        "These templates make the acquisition evidence system reusable without forcing the narrative chapters to carry every row, scorecard, participation condition, and acceptance-test field.",
        sections(rfp, ["Appendix: Lightweight Templates"]),
        provenance=f"{rfp}: Appendix: Lightweight Templates",
    )

    chapters["appendices/f-socratic-seminar.md"] = compose(
        "Appendix F: Socratic Leadership Seminar",
        "Appendices",
        "This implementation guide is a bounded example of leadership development that deliberately refuses compliance metrics. It remains useful as a complete companion practice, but its specialized procedure does not need to interrupt the main talent-development argument.",
        without_title("Socratic-Leadership-Seminar.md"),
        provenance="Socratic-Leadership-Seminar.md, complete article",
    )

    return chapters


def manifest_text() -> str:
    lines = [
        "title: Closing the Loop",
        "subtitle: A Guide to Organizational Excellence — Preview Manuscript",
        "author: Jon Wroblewski",
        "slug: closing-the-loop-preview",
        "chapters:",
    ]
    lines.extend(f"book-preview/{item.path}" for item in ITEMS)
    return "\n".join(lines) + "\n"


def source_map_text() -> str:
    lines = [
        "# Preview Source Map",
        "",
        "This map records editorial treatment, not merely file provenance. “Provisional” means the chapter exposes a real seam using current material and visible future-edition notes; it does not mean the subject necessarily survives as a standalone chapter.",
        "",
        "| Preview item | Part | Source material | Status |",
        "|---|---|---|---|",
    ]
    for item in ITEMS:
        link = f"[{item.title}]({item.path})"
        lines.append(f"| {link} | {item.part} | {item.source} | {item.status} |")
    lines.extend(
        [
            "",
            "## Assembly decisions demonstrated in this preview",
            "",
            "- A front-matter glossary fixes the book's current vocabulary for decision states, evidence records, completion, and trust boundaries.",
            "- Work Intake is split across the front door, legitimate authorization, and later enterprise-reconciliation synthesis.",
            "- Process Improvement is split across visibility and recurrence; the implementation chapter now synthesizes those mechanisms through one end-to-end tracer bullet instead of replaying the source article's adoption section.",
            "- Framing keeps its main argument while the discovery template and DNS example move to Appendix A.",
            "- Writing Work Items keeps its detailed real-Epic repair and implementation mechanics inline by design; only templates and quick reference move to Appendix A.",
            "- Coaching, the evidence ledger, evidence aggregation, one-on-ones, and the Conversation Planner form the management-evidence cluster; the planner remains a worksheet.",
            "- TDA splits into architecture, management evidence and coaching, safe reps and opportunity allocation, hiring, enterprise synthesis, and a connected workbook.",
            "- Vendor selection is treated as the same intake lifecycle across an adversarial commercial trust boundary, then split between selecting capability and proving and accepting it. Detailed procedure remains inline; reusable instruments also appear in Appendix E.",
            "- The Career Progression Guide is represented by selected book-level reference material rather than eleven full level descriptions.",
            "- The Socratic Leadership Seminar remains a complete case study and implementation guide outside the main narrative.",
            "",
            "## Chapter contracts",
            "",
            "These contracts describe the movement each narrative chapter is responsible for. The five future-edition interludes are deliberately unnumbered: they expose missing connective tissue without pretending the current source corpus contains finished chapters.",
            "",
            "| Chapter | Entering question | Governing distinction | Mechanism | Consequence | Handoff |",
            "|---|---|---|---|---|---|",
            "| 1. The Open-Loop Enterprise | Why does the organization repeat bad decisions despite having results? | Score versus evidence of how the score was produced | Durable claim, owner, expected outcome, evidence path, review point | Outcomes become material for learning rather than folklore | Which demands deserve an important decision? |",
            "| 2. The Front Door | Is this demand real and eligible for judgment? | Routing versus approval | Work type, provenance, sponsor, target condition, constraints | Receiving teams stop manufacturing sponsorship and priority | How should eligible proposals compete? |",
            "| Future Edition: Portfolio Judgment | Which eligible proposal should consume scarce capacity? | Admission versus comparative commitment | Accountable ranking, comparable evidence, recorded displacement, return conditions | Priority becomes an owned judgment | What must be understood before selection becomes design? |",
            "| 4. Frame the Work Before Designing It | Is the selected problem ready for design or execution? | Problem frame versus premature solution | Intent classification, five-box frame, design gates, pre-mortem | Discovery preserves judgment before decomposition | Who may legitimately authorize the resulting commitment? |",
            "| 5. Make the Commitment Legitimate | When is framed work authorized to consume delivery capacity? | Review, approval, and acceptance as different decisions | Ordered reviews, conditional approval, dependency reservation, baseline | Authority and delivery risk remain visible | How does the authorized outcome become executable work? |",
            "| 6. Turn Decisions Into Executable Work | How can decomposition preserve the governing decision? | Work hierarchy versus one generic ticket shape | Epics, packages, stories, tasks, completion conditions, readiness | Backlog work remains attached to outcome and proof | How is the resulting operating system made visible? |",
            "| 7. Make the Operating System Visible | What work exists and how is it moving? | Delivery visibility versus improvement | Work taxonomy, pull, WIP limits, interrupt budget, aging and blockage | Queue pressure and hidden demand become inspectable | What should recurring demand teach the system? |",
            "| 8. Convert Recurrence Into Improvement | When should repeated work change the system that produces it? | Repeated delivery versus system improvement | Standardization and automation ladder, metrics, retrospectives | Recurrence becomes evidence for redesign | Which review rhythms connect the separate loops? |",
            "| Future Edition: Operating Cadence | When and where must evidence return to judgment? | Decision loop versus status meeting | Named decision rights, inputs, outputs, timing, exception paths | Reviews can coexist without becoming ceremony | How does cadence change for an asset meant to disappear? |",
            "| 10. Managed Runoff | How should the organization govern an asset with no strategic future? | Keep operational versus keep investing | Lifecycle state, allowed work, exception expiry, dependency inventory, checkpoints | Retirement becomes managed exposure rather than neglect | How are capabilities created and placed? |",
            "| 11. Development Is an Organizational Architecture | How does aspiration become usable organizational capability? | Development activity versus development architecture | Capability target, calibration, real work, evidence, reconciliation, placement | Development connects to work and decisions | What recurring management practice preserves the evidence? |",
            "| 12. Management Is Evidence Infrastructure | How does management preserve useful behavioral evidence and update a person's operating model? | Coaching evidence versus retrospective narrative | Observation, feedback, coaching, ledger, one-on-ones, calibration, case-to-aggregate boundary | Performance and development decisions become challengeable | Where do people get legitimate practice? |",
            "| 13. Create Safe Reps and Allocate Opportunity | How does the organization create capability through work? | Stretch opportunity versus unsupported exposure | Utilization diagnosis, transition gates, safe reps, farm system | Work allocation becomes part of development architecture | When should capability be acquired externally? |",
            "| Future Edition: Hiring Capability | How should an external talent claim enter the system? | Hiring evidence versus persuasive performance | Capability need, advertised quality contract, work evidence, onboarding handoff | Selection evidence survives the offer | How does the same proof problem appear in vendor acquisition? |",
            "| 15. Selecting External Capability | What changes when the intake counterparty benefits from approval? | One intake lifecycle across cooperative and adversarial trust boundaries | Buyer-owned need, requirement model, claim register, proof plan, scoring, risk allocation | Sales claims remain claims until buyer-controlled proof supports them | How is promised capability proved and accepted? |",
            "| 16. Proving and Accepting External Capability | When has the organization received what it intended to buy? | Delivery event versus evidence-backed acceptance | Acceptance tests, burn-in, payment gates, operating handoff, review | Commercial closure follows demonstrated capability | How do local reconciliations change enterprise decisions? |",
            "| Future Edition: Reconciling the Enterprise | What evidence should cross domain and hierarchy boundaries? | Useful aggregation versus context destruction | Decision-first rollup with case-level challenge evidence | Local learning can inform funding, policy, staffing, and governance | What changes when context production becomes cheap? |",
            "| Future Edition: AI, Context, and Organizational Leverage | Where can AI reduce stranded toil without replacing authority? | AI as labor versus AI as authority | Context reconstruction, comparison, drafting, provenance, accountable review | Cheap artifacts either close loops or scale theater | How can the organization begin without installing everything? |",
            "| 19. An Implementation Roadmap | What is the smallest responsible adoption sequence? | Operating hypothesis versus wholesale process installation | One tracer bullet from demand capture through discovery, outcome-derived metrics, delivery, review, and reconciliation | Adoption becomes testable, grounded, and capacity-aware | Begin a bounded pilot and grade it |",
            "",
            "## Section and claim-family cut map",
            "",
            "This is the editorial cut map behind the preview. It records where each source argument went and what remains outside the manuscript so the assembly can be challenged at a finer grain than one row per file.",
            "",
            "| Source | Included destination | Held outside this preview or still unresolved |",
            "|---|---|---|",
            "| `The-Open-Loop-Enterprise.md` | Complete article in Chapter 1 | Only article-style repetition is a later line-edit question |",
            "| `Work-Intake-Is-an-Organizational-System.md` | Thesis through proposal proof in Chapter 2; discovery through forecast governance in Chapter 5 | Close-the-loop material informs the Chapter 17 interlude but is not recopied; established/common/starting-point appendices remain in the source |",
            "| `Framing-Technical-Work-Before-Design.md` | Usage, framing scaffold, readiness, design gates, operational ownership, complexity, tooling, pre-mortem, and AI boundaries in Chapter 4 | Discovery template and DNS example move to Appendix A; extended formal-concept exposition remains in the source |",
            "| `Writing Work Items - Epics, Stories, and Tasks.md` | Sections 1–8 in Chapter 6, including the worked real-Epic repair and detailed implementation mechanics | Templates and quick reference move to Appendix A; the example remains inline so readers can derive the method from the case |",
            "| `Process-Improvement-Framework.md` | Sections 1–5 in Chapter 7; 6–9 in Chapter 8; adoption principles inform the Chapter 19 synthesis | Sections 10–12 are no longer recopied as a conclusion; operating-cadence implications remain unfinished |",
            "| `Managed-Runoff-for-Deprecated-Services.md` | All reader-facing sections except Open Questions in Chapter 10 | Source TODOs are represented by a visible future-edition note rather than silently completed |",
            "| `Talent-Development-Architecture.md` | Core model, boundaries, and packet in Chapter 11; coaching, one-on-ones, and two evidence levels in Chapter 12; preference, stretch, utilization, safe reps, and opportunity systems in Chapter 13; hiring handoff in Chapter 14; technology boundary in Chapter 18 | Sports introduction, adoption detail, and repeated what-changes summaries remain in the source; complete forms remain in Appendix C |",
            "| `Coaching-and-Calibration-Guide.md` | Purpose, behavioral evidence, ledger, role separation, and ladder relationship in Chapter 12 | Standalone companion framing removed; the separate Conversation Planner remains a worksheet |",
            "| `RFPs-and-Vendor-Selection-as-Evidence-Systems.md` | Why RFPs Exist through Decision Records in Chapter 15, preceded by a book-level internal/external intake synthesis; acceptance through post-implementation review in Chapter 16 | Source Thesis is replaced by the stronger shared-lifecycle argument; lightweight templates remain in Appendix E |",
            "| `Career-Progression-Guide.md` | Book-level progression, scope, management crosswalk, calibration, and promotion evidence in Appendix D | Full grade-by-grade detail remains a companion reference |",
            "| `Conversation Planner.md` | Complete worksheet in Appendix B | Kept outside continuous prose |",
            "| Four `TDA-*-Template.md` files | Complete connected workbook in Appendix C | Kept outside continuous prose |",
            "| `Socratic-Leadership-Seminar.md` | Complete bounded case and implementation guide in Appendix F | Kept outside the main narrative |",
            "| `devops-sre-career-progression-guide-alt.md` | Not included | Superseded editorial history |",
            "| `where-it-all-began_Process_Improvement_Plan_wroblewj.docx` | Not included | Provenance artifact, not manuscript source |",
            "| `0.*` and `CONTEXT.md` files | Used only to identify seams, future scope, and assembly constraints | Private editorial inputs; no context document is copied into reader-facing prose |",
            "",
        ]
    )
    return "\n".join(lines)


def manuscript_text(chapters: dict[str, str]) -> str:
    lines = [
        "# Closing the Loop",
        "",
        "## A Guide to Organizational Excellence",
        "",
        "*Preview manuscript assembled from the current organizational-philosophy corpus.*",
        "",
        future_note(
            "This is a structural preview, not a finished edition. Visible future-edition notes mark missing source material, unresolved chapter seams, or synthesis the current articles do not yet support. The source articles remain independently usable; this manuscript is a book-specific cut."
        ),
        "",
        "## Contents",
        "",
    ]
    for item in ITEMS:
        if item.path == "appendices/00-appendices.md":
            lines.append("")
        lines.append(f"- [{item.title}]({item.path})")
    lines.append("")
    for item in ITEMS:
        content = chapters[item.path]
        content = content.replace("../assets/", "assets/")
        lines.extend(["", "\\newpage", "", content.strip(), ""])
    return "\n".join(lines).strip() + "\n"


def generate() -> tuple[dict[Path, str], dict[Path, bytes]]:
    chapters = chapter_contents()
    expected = {item.path for item in ITEMS}
    if set(chapters) != expected:
        missing = expected - set(chapters)
        extra = set(chapters) - expected
        raise ValueError(f"item mismatch; missing={sorted(missing)}, extra={sorted(extra)}")

    rendered: dict[Path, str] = {}
    assets: dict[Path, bytes] = {}
    for relative, content in chapters.items():
        assets.update(referenced_assets(content))
        rendered[PREVIEW_DIR / relative] = adjust_assets(content, relative)

    rendered[PREVIEW_DIR / "book.txt"] = manifest_text()
    rendered[PREVIEW_DIR / "source-map.md"] = source_map_text()
    rendered[PREVIEW_DIR / "manuscript.md"] = manuscript_text(
        {relative: rendered[PREVIEW_DIR / relative] for relative in chapters}
    )
    return rendered, assets


def check(rendered: dict[Path, str], assets: dict[Path, bytes]) -> int:
    problems = []
    for path, expected in rendered.items():
        if not path.is_file():
            problems.append(f"missing generated file: {path.relative_to(PREVIEW_DIR)}")
            continue
        actual = path.read_text(encoding="utf-8")
        if actual != expected:
            problems.append(f"stale generated file: {path.relative_to(PREVIEW_DIR)}")

    for path, expected in assets.items():
        if not path.is_file():
            problems.append(f"missing generated asset: {path.relative_to(PREVIEW_DIR)}")
            continue
        if path.read_bytes() != expected:
            problems.append(f"stale generated asset: {path.relative_to(PREVIEW_DIR)}")

    actual_assets = {path for path in ASSET_DIR.rglob("*") if path.is_file()}
    for path in sorted(actual_assets - set(assets)):
        problems.append(f"orphaned generated asset: {path.relative_to(PREVIEW_DIR)}")

    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    print(
        f"Preview assembly is current "
        f"({len(rendered)} generated text files, {len(assets)} assets)."
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail when generated files are missing or stale")
    args = parser.parse_args()

    rendered, assets = generate()
    if args.check:
        return check(rendered, assets)

    for path, content in rendered.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    for path, content in assets.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    actual_assets = {path for path in ASSET_DIR.rglob("*") if path.is_file()}
    for path in sorted(actual_assets - set(assets), reverse=True):
        path.unlink()

    print(
        f"Assembled {len(ITEMS)} book items, "
        f"{len(rendered)} generated text files, and {len(assets)} assets."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
