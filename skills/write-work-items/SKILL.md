---
name: write-work-items
description: Draft, review, or split epics, stories, work packages, and tasks using verifiable completion conditions. Use to repair output-focused tickets, assess readiness, or describe incident and repeatable-request work proportionately. Works with plain documents or any issue tracker.
---

# Write work items

Define what must become true and how it will be verified. An epic is complete when its outcome is true, not when its child tickets close.

Use the user's material and available project standards. No particular assistant, tracker, integration, or companion skill is required. Draft in Markdown unless another format is requested. Writing or reviewing items does not itself authorize publishing them or modifying tracker workflows.

## Choose the work mode first

- **Roadmap / bespoke:** deliberate improvement. Use the hierarchy and readiness rules below.
- **Demand / reactive:** restore something broken. Use resolution and structured cause/time capture; do not require a parent improvement epic or delay response for roadmap readiness.
- **Repeatable / request:** a known procedure with stable success conditions. Reuse acceptance criteria and required inputs defined once for the request type. If instances legitimately need different success conditions, treat them as bespoke work.

For reactive work, request-type design, or analysis of recurring demand, read [demand work](references/demand-work.md). Apply only the branch needed. Authoring effort should scale with uncertainty.

## Establish the completion condition

Read the supplied items, parent outcomes, dependencies, and team Definition of Done (DoD). Distinguish known facts from proposed targets, assumptions, and missing inputs. Do not invent issue keys, baselines, standards, deadlines, risk acceptance, or owners. Ask questions that change classification or readiness; draft the supported content while exposing the gaps.

Classify by the kind of completion condition, not estimated hours or apparent size:

| Level | Completion condition |
| --- | --- |
| Epic | A measured change in capability, reliability, risk, or cost is true. |
| Story / work package | One coherent slice of observable behavior passes acceptance criteria. |
| Discovery work package | A bounded question is answered in a recorded decision or reusable evidence artifact. |
| Task | A concrete deliverable objectively exists and contributes to a story. |
| Sub-task | A checklist step within a task is complete. |

Story and work package name the same level here; use the project's preferred term consistently. Discovery is a story/work-package intent, not a separate hierarchy level or a claim about formal WBS terminology.

## Split at the appropriate level

For epics, apply the **standalone-value test**: if a piece shipped without its siblings, would it deliver usable value? If so, it can be its own epic. If it is useless or unreleasable without them, keep the pieces under the same capability outcome. Different skills or technical layers alone do not justify separate epics.

Within an epic, give each work package exactly one intent: Discovery (reduce uncertainty), Migration (move state), Redesign (change structure), Enablement (remove blockers), or Optimization (improve flow). Separate decide-and-build and build-and-migrate items into linked packages.

Prefer independently verifiable vertical slices, such as registration in one region end to end, over separate stories for all permissions, all scripts, and all testing. Concrete layer-specific deliverables can still be child tasks. Make dependencies explicit rather than claiming independence where none exists.

If an unresolved decision prevents specifying delivery, define bounded Discovery first. Name its question, Current-State Baseline, scope/timebox, recorded conclusion or artifact, and the delivery it enables. For substantial redesign, include an **Implementation Currency Check**: assess whether a maintained ordinary solution now meets the need before preserving bespoke machinery. If current evidence is unavailable, leave that check unresolved. Discovery records do not automatically become ADRs; later architectural decisions belong with the governed system.

## Write the three distinct tests of done

### Epic outcome

Use either form, with one or more independently checkable conditions:

- **Quantitative:** [metric/state] moves from [baseline] to [target], measured by [method], by [horizon].
- **Qualitative:** [capability] becomes possible or [failure mode] is prevented, verified by [specific check]. Include the delivery or observation horizon for readiness.

Apply the **substitutability test**: does the outcome still make sense if the implementation is replaced? Keep mechanisms in design or implementation notes, and retain actual externally imposed constraints separately. Do not silently change a requester's accepted outcome to fit a chosen implementation.

For operating improvements, describe reliability, reclaimed capacity, retired risk, or capability that scales without extra staffing. Quantify reclaimed effort as time per occurrence × occurrences per period, keeping units and observation window visible. When the hours are small, explain the reliability benefit rather than inflating savings.

For Enablement or Optimization of an operating process, identify the relevant Automation Ladder transition: L0 undocumented → L1 documented runbook → L2 independently usable checklist → L3 human-run automation with validation → L4 event-triggered automation with human notification. Do not assume L4 is always desirable; expose L0 as key-person risk. If the ladder does not fit the work, explain that instead of inventing a level.

### Story acceptance criteria

Write observable pass/fail behavior using Given/When/Then or a checklist. Keep one measurable variable per criterion; state its context, threshold or expected state, and verification method. Include relevant failure behavior and scope boundaries. Do not use “PR submitted,” “code written,” or “script created” as behavioral acceptance criteria.

Tasks may finish when a deliverable exists. Discovery may finish when its specified evidence artifact or conclusion is recorded. Those are legitimate completion conditions at their own level, not substitutes for delivery-story behavior.

### Inherited Definition of Done

Link or restate the team's existing workmanship bar; do not invent a new DoD per epic. Keep it distinct from the epic outcome and story acceptance. The requester or standard-owner owns the bar; implementers propose changes rather than silently rewriting it.

Preserve standing gates: security conformance or an approved documented exception; governing standards or a documented non-applicability/exception determination; the team testing bar; applicable observability; and documentation/runbook updates when behavior changes. Bind these to the actual team's standards. Silence is not an exception. If the governing standard is missing, identify the missing input and any suggested policy as a proposal, not an established requirement.

DoD criteria should be binary, shared across items of that kind, and substitutable across implementations. Judgment-based architectural preferences such as “modular” belong in design/code review. Preserve legitimate design constraints in their own field.

## Assess readiness and deliver

Use [the templates](references/templates.md) for the requested levels, adapting labels to the user's format while preserving the distinctions. Do not fabricate a full backlog when only the first slice can be responsibly specified.

For a roadmap delivery story, check: one intent; testable criteria; explicit non-goals (especially cross-team); satisfied preconditions; satisfiable standing gates; a vertical slice small enough for the team's planning interval; material unknowns resolved through discovery; and a parent epic with an actual outcome. Unmet dependencies mean **Blocked**, with the unblock owner identified or explicitly unassigned. Proposed values and unanswered requirements mean **Needs clarification**, not Ready.

Discovery is ready to begin when its question, inputs, bounds, and artifact completion test are defined; do not demand that its target uncertainty already be resolved. It still needs the gates appropriate to the discovery activity itself.

For an epic, check: a verifiable outcome with measure and horizon; inherited DoD distinct from outcome; and a drafted first slice. Child closure alone never proves epic completion. If children are closed and the outcome is false, report the gap and propose further work or a change of approach for the outcome owner to consider.

Return the drafted or revised items, their relationships, and a concise readiness assessment with missing evidence. For a review-only request, report defects and concrete corrections without overwriting the source. Completion of this writing task means the work is reviewable, not that every proposed item is ready or approved.
