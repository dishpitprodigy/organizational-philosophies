---
name: frame-technical-work
description: Frame complex technical work before design or delivery commitments. Use to clarify intent, establish the current-state basis, identify design gates, or turn unresolved questions into bounded discovery packages. Produces a framing brief, not an architecture or implementation plan.
---

# Frame technical work

Make the problem, evidence, constraints, and decision boundaries explicit before choosing a solution. The deliverable is a reusable framing brief that lets downstream work understand why it exists without reconstructing the conversation.

## Establish the basis

Read the supplied proposal, relevant system documentation, and known constraints. Use available files or tools; if access is unavailable, work from supplied material and name the missing evidence. No particular assistant, tool, tracker, or repository layout is required.

Record the **Current-State Basis**: the authoritative architecture and operating revision, its dependencies, constraints, failure behavior, and the material delta since that revision. Link a reliable baseline rather than rewriting it. If none exists, define bounded discovery to establish it; do not describe an assumed architecture as accepted fact.

Separate supported facts, proposed requirements, assumptions, and unanswered questions. Ask focused questions where the answer changes scope or readiness; continue drafting everything the evidence supports. Never invent thresholds, owners, approvals, or commitments to complete a template.

This step is complete when the baseline is identified or its absence has an explicit discovery path.

## Write the five-box scaffold

1. **Primary intent:** choose Discovery (reduce uncertainty), Migration (move state A to B), Redesign (change structure), Enablement (remove blockers), or Optimization (improve efficiency or flow). Explain the choice. If the finish line is unknown, start with Discovery. Separate packages when distinct results require different intents.
2. **Preconditions and constraints:** state what must be true before work starts, such as access, sign-off, fixed boundaries, timing, or an upstream capability. Do not disguise proposed solutions as constraints.
3. **Non-goals:** name adjacent questions and changes this work explicitly does not address.
4. **Reusable output artifact:** identify the taxonomy, requirements set, capability list, trust model, decision record, or reference pattern that proves completion. If the answer is only running code, determine whether the request has already moved into execution planning.
5. **Downstream enabled:** identify the work or decision that should no longer need to ask why. Preserve the reasoning, supporting evidence, boundaries, and conditions that would reopen the decision.

This step is complete when every box has an evidence-backed answer or a clearly named gap.

## Assess design readiness

Use [the design questions](references/design-questions.md) to examine the relevant operating envelope. Distinguish **design gates**, which block commitments, from **design-informing questions**, which shape design but need not block exploration.

For each gate, record its question, evidence, disposition, and outstanding work. Use these dispositions:

- **Answered:** the evidence supports a sufficiently precise requirement or boundary.
- **Bounded uncertainty:** the remaining uncertainty has explicit bounds, an affected design decision, a stated risk, a risk owner, and evidence of acceptance by the appropriate authority. Proposed bounds or a suggested owner alone do not clear a gate.
- **Unresolved:** the missing evidence could materially change the design or commitment.

An unresolved gate pauses the affected architectural or delivery commitment; it does not prohibit research or reversible exploration. Do not turn an unresolved decision into an implementation task to make a plan look ready. Explain non-applicability where a question does not fit the work.

This step is complete when each applicable gate has a disposition and the basis for it is visible.

## Package discovery where needed

For each unresolved question, define an outcome-oriented package:

```markdown
### [Short artifact-oriented name]
Intent: Discovery
Objective / question:
Current-State Basis:
Constraints and non-goals:
Inputs required / contributors:
Scope or timebox:
Output artifact and completion check:
Downstream work or decision enabled:
Unblock owner / missing input:
```

Use only owners and timeboxes supported by the input; otherwise mark them proposed or unassigned. Prefer “Identity Surface Inventory, complete when consumers and evidence gaps are documented” to “Research IAM.” Define the artifact and its evidentiary purpose, not speculative implementation steps.

A timebox expiring is not proof that the question was answered. Report what was learned, what remains unresolved, and the next bounded decision needed.

Discovery records preserve evidence and conclusions. Do not create an architecture decision record merely because architecture may follow. Architectural decisions made during later design belong with the system they govern and may cite this framing.

## Deliver the framing brief

Include the Current-State Basis, five-box scaffold, gate assessment, discovery packages where needed, and a short readiness conclusion. State precisely which decisions can proceed, which remain blocked, and what evidence would clear the blockers. Use links or source identifiers for material claims.

Framing is complete when the reasoning and remaining uncertainty are reviewable; it may legitimately conclude that design is not ready. Readiness assessment is not organizational approval. Produce the requested document or response; publishing records or changing systems requires authorization from the user's task.
