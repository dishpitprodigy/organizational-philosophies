# Work-item templates

Use only the requested levels. Bracketed text is authoring guidance, not a value to present as established fact. Label unresolved fields explicitly in drafts.

## Epic

```markdown
## [Area | Capability or change]
Type: Epic
Outcome / exit condition: [Checkable change, verification method, horizon;
include baseline and target when quantitative.]
Why now / context: [Evidence; demand baseline and source items when relevant.]
Inherited team Definition of Done: [Link or restatement of existing standard.]
Additional epic-specific quality requirement: [Only if justified beyond the standard.]
In scope:
Out of scope:
Dependencies / related work:
First delivery slice:
Readiness: [Ready / Needs clarification / Blocked, with reason.]
```

## Story / work package

```markdown
## [Outcome-oriented summary]
Type: [Project's preferred term]
Intent: [Exactly one of Discovery, Migration, Redesign, Enablement, Optimization]
Objective: [Question answered or behavior delivered; relevant ladder transition.]
Non-goals:
Preconditions: [Constraints and required inputs, with dependency owners.]
Acceptance criteria:
- [ ] [Observable behavior, context, and verification; one measurable variable.]
Output artifact / evidence:
Downstream enabled:
Parent epic: [Real reference, or explicitly unresolved.]
Inherited DoD: [Reference; documented exceptions where applicable.]
Readiness: [Disposition and reason.]
```

## Task

```markdown
## [Concrete deliverable]
Type: Task
Deliverable / done when: [Objectively existing merged code, resource, or configuration.]
Parent story / work package:
Dependencies:
Notes / implementation guidance: [Known decisions, links, and relevant constraints.]
```

Use sub-tasks only for steps meaningful within a task, not to hide independently reviewable behavior or unresolved design decisions.

## Discovery work package

```markdown
## [Question or intended evidence artifact]
Type: [Story / Work package]
Intent: Discovery
Question:
Current-State Baseline: [Authoritative architecture/operating revision plus delta,
or bounded work to establish it.]
Inputs / preconditions:
Non-goals:
Scope / timebox: [Agreed value or explicitly proposed.]
Done when: [Conclusion or artifact recorded, with evidence sufficient to answer
the question; not code merged or merely time spent.]
Output feeds: [Delivery item or decision enabled.]
Parent epic: [Reference where available; otherwise a visible roadmap gap.]
Readiness / missing inputs:
```

## Example: repairing a compound task

Original: “Determine how hosts choose a regional registration endpoint; write the startup script; create secrets and permissions. AC: PR submitted.”

Split into:

1. **Discovery:** determine endpoint selection from the actual current-state baseline. Finish when the approach, evidence, constraints, and open limitations are recorded.
2. **Delivery story:** a host registers at its intended regional endpoint on first boot. Specify the supported regions and verification before claiming readiness. Separate criteria for correct endpoint selection, successful registration, and observable failure when required credentials cannot be fetched.
3. **Tasks:** create the required regional secrets and grant the relevant read access. Link them to the delivery story and show their dependencies.

If those resources are required before script integration begins, the integration work remains blocked until they exist. A coherent hierarchy does not make unmet preconditions disappear. Do not turn a suggested metadata or secret-store mechanism into an accepted design before discovery establishes it.
