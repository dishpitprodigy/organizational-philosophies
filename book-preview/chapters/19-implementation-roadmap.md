# An Implementation Roadmap

*Part VI — Reconciling the Enterprise*

The complete system is not a responsible starting point. Every new artifact creates maintenance, every review consumes attention, and every metric creates an incentive whether the designer intended one or not. Adoption should begin with the smallest set of controls that makes a real failure visible and produces evidence for the next change.

The current source material supports a sequence:

1. Make work visible.
2. Standardize the front door and work types.
3. Define completion conditions.
4. Record important decisions and assumptions.
5. Add a risk-find path with an urgent exception route.
6. Add post-implementation reconciliation.
7. Add people-system evidence loops.
8. Add aggregate leverage metrics only after the capture layers produce trustworthy data.

The order is causal. Metrics arrive after records. Enterprise synthesis arrives after local reconciliation. Automation arrives after the work is understood well enough to know which behavior should become repeatable.

> **Preview note — future edition**
>
> A future version will define how process assets are versioned, tailored, reviewed, corrected, and retired. A process that can only be added is another managed-runoff problem waiting to happen.
>
> The Risk Find step remains unresolved. Future work must define structured triage, urgency, ownership, escalation, and the conditions under which a significant issue bypasses normal operating cadence. Until that work is complete, the sequence names the missing control without pretending to supply a reader-facing standard.

## Start with one closed loop

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

### Make the demand observable

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

### Authorize discovery before authorizing a build

The discovery package asks why certificate rotation requires manual registration, which systems own certificate issuance and registration, whether the behavior differs by region, what failure and recovery paths exist, and which constraints a safe change must preserve.

Its completion condition is a decision-ready artifact: the observed failure mechanism, viable options, non-goals, affected owners, proof conditions, and a recommendation. A responsible result may be that the apparent pattern combines several causes and should not become one automation project. That is useful company work. Discovery prevented the organization from automating a false category.

### Define the outcome before choosing the metric

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

### Build through bounded work

The authorized Epic can now decompose into discovery already completed, implementation work packages, tests, deployment, documentation, and operational handoff. Each child item gets its own acceptance criteria. Standing workmanship gates still apply. Closing every child does not close the Epic if matching demand continues.

The team keeps a manual recovery path until the acceptance authority has seen successful behavior under representative rotation conditions. If implementation changes the failure model, risk owner, operational burden, or expected horizon, the delivery forecast changes and the affected authority receives the new decision. The original baseline remains unchanged.

### Review at the cadence required by the evidence

The board may be reviewed weekly for flow and blockage. Automated re-registration evidence is reviewed after each representative certificate rotation. Data quality is checked while incidents are still being classified. The outcome cannot be reconciled until the ninety-day horizon has passed under enough actual exposure to make the result meaningful.

Those are different reviews because they answer different questions. Combining them into one generic status meeting would either delay operational decisions or pretend the outcome is known before reality has had time to answer.

### Reconcile before scaling

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

The preview ends where implementation begins: with an operating hypothesis small enough to test, evidence strong enough to grade it, and a review point that forces the next decision.

<!-- Preview assembly source: Book-level synthesis from Process Improvement adoption guidance, Work Intake, Writing Work Items, and the gap-map implementation sequence -->
