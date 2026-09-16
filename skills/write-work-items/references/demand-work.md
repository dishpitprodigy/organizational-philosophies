# Demand work and the improvement loop

Use this branch for reactive items, repeatable requests, or analysis of demand that may justify roadmap improvement. Do not impose the roadmap Definition of Ready on incident response.

## Reactive work

Describe the affected service, observed impact, resolution condition, actions/evidence, and structured capture:

- A distinct incident/break-fix **work type** chosen at creation, not a removable label used as the sole classification.
- A **cause category** selected from a controlled vocabulary and required at resolution, rather than free text that cannot aggregate consistently.
- Actual effort from the **worklog**, with unknown or incomplete effort identified.

When the tracker cannot enforce these fields, provide the equivalent structured record and state the enforcement gap. Do not claim a gate exists merely because a document recommends it. Proposing fields does not authorize changing the tracker configuration.

Do not invent a known cause to finish an item. Expose unresolved diagnosis and use the team's explicit handling for unknown causes, if available. Capture should support response and reliable reporting, not postpone restoration.

## Repeatable requests

First confirm a stable outcome and known procedure. Then define or reuse, once per request type:

- Fixed success condition and acceptance criteria.
- Required input fields that establish readiness.
- Standard procedure and applicable inherited quality gates.
- Per-instance evidence of fulfillment.

A well-formed request inherits this definition rather than needing a bespoke epic or newly authored outcome. Tidy fields do not make varying success conditions repeatable; route exceptional instances back to bespoke work when necessary.

## Demand to roadmap

Recurring toil is a derived signal, not another work type to file. Aggregate incidents and requests by cause over a stated window. Rank drivers by frequency and total effort; if using average time per occurrence, multiply by count only once. Keep incomplete or optional capture visibly estimated.

When a cause category crosses an agreed occurrence or effort threshold, propose a roadmap epic to retire or reduce that driver. If the threshold is absent, propose one for the responsible owner rather than treating it as policy. Preserve the demand records as evidence; do not reclassify historical incidents into the improvement epic.

The epic should link the source evidence, baseline, target, verification method, and observation window. Measure its result back against the same demand categories after delivery. Ticket closure alone does not establish that demand fell. Report the roadmap/demand effort ratio alongside major drivers and the outcomes of improvements where the data supports it.

For example, a supplied baseline of 23 incidents and 31 hours in 90 days could support an epic to eliminate manual re-registration after certificate rotation. Completion would need both an observed successful automated recovery and the agreed post-rollout incident window. These values are illustrative, not defaults to insert into another project.

Keep roadmap and demand reporting distinguishable when ownership or review cadence differs; separate queues are an option, not a requirement. Change/CAB records are an audit overlay on the underlying work, not an extra bucket that duplicates effort. This model does not require a particular ITIL implementation.
