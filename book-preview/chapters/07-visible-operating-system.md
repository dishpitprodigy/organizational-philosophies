# Make the Operating System Visible

*Part IV — Operating, Improving, and Retiring the System*

An organization cannot improve work it cannot see, and it cannot see work merely because tickets exist somewhere. Visibility requires a stable taxonomy, a common record, explicit work-in-progress policy, a baseline, and enough protection from interruption for planned improvement to survive contact with ordinary demand.

> **Preview note — future edition**
>
> A future version will add the Eight Wastes of Engineering before the improvement method. The gate will ask whether work should exist before helping a team execute it more efficiently, while preserving the distinction between genuine waste and necessary discovery, resilience, recovery, security, compliance, or documentation.

## Why Process Improvement

Process improvement is how to work better — a systematic approach to identify, analyze, and improve existing processes for more efficient, more predictable results.

### Business Case

- **Increase service level** — happier customers, faster resolution
- **Increase opportunities to innovate** — when operational toil is reduced, capacity opens for new services
- **Improve consistency** — repeatability of outcomes via standard work, automation, and clear procedures
- **Improve quality** — fewer manual errors, fewer repeat incidents
- **Increase efficiency** — do the same work with less effort, or more work with the same effort
- **Control the narrative** — at some point, senior leadership will come looking for metrics. If we have them ahead of time, we control the story from that point forward. If we don't, others will make headcount and capacity decisions based on incomplete data. We create the data now, or we get run over.

### Define the Problem First

Before changing process, define the problem clearly. Otherwise teams end up adopting ceremonies and tooling without proving that they are solving the right operational issue.

At minimum, establish:

- **Customer and stakeholders** — who experiences the problem, and who is affected by fixing it?
- **Problem statement** — what is failing, and why does it matter?
- **Baseline** — what is happening now, measured in current-state metrics
- **Scope** — what is included, and what is explicitly out of scope?
- **Target condition** — what outcome would represent a meaningful improvement?

This is the difference between process theater and process improvement.

### Applicability

This framework is not limited to infrastructure or software teams.

It applies anywhere work is:

- repeatable enough to standardize
- variable enough to require triage or prioritization
- interrupt-driven or queue-driven
- measurable in terms of time, quality, throughput, rework, or wait states

That includes environments such as:

- platform and infrastructure teams
- service desks and shared services
- warehouse and fulfillment operations
- logistics and distribution workflows
- customer support and back-office operations

The examples here lean toward IT and technical operations because that is where the framework was used most heavily, but the underlying model is broader than that.

## The Maturity Ladder

Most teams start at Level 0 or 1. The goal is steady, sustainable progress up the ladder — not a leap to the top.

| Level | What It Looks Like | Key Metric |
|-------|-------------------|------------|
| 0 — Reactive | Work arrives via email, Slack, hallway conversations. Gets done when it gets done. | No data |
| 1 — Visible | All work is tracked. A board exists. WIP limits are in place. | Cycle time is measurable |
| 2 — Measured | Flow metrics tracked weekly. Unplanned work ratio known. | Cycle time is improving |
| 3 — Managed | Standard work and automation exist for recurring work. Interrupt budget is explicit. | Manual work ratio declining |
| 4 — Optimizing | Retrospectives drive policy changes. Capacity planning is data-driven. | Predictable delivery |

C-levels don't care which framework you use. They care that Level 0 costs them money (slow, unpredictable, key-person risk) and Level 4 doesn't. The maturity ladder gives them a map without requiring them to understand ITIL.

ITIL, ISO 20000, and CMMI are bodies of knowledge that *inform* this approach — the bibliography, not the curriculum. You can adopt their concepts selectively without adopting the full framework.

## Work Taxonomy

### Delivery, Corrective Engineering, and Improvement Work

The same people may perform all three, but the investment classes answer different questions:

- **Delivery work** operates a conforming service or fulfills legitimate demand. Incident response may contain harm and restore service, but restoration alone does not remove the underlying defect.
- **Corrective engineering** removes a defect or its cause so the system returns to required behavior. It is part of producing and maintaining an acceptable system, not an optional improvement.
- **Improvement work** raises capability, quality, efficiency, or consistency after the system already meets its accepted requirements and tolerances.

Standardization and automation are mechanisms, not classifications. Automating a workaround around a defect may institutionalize bad behavior. Automating legitimate repeatable demand may be a useful improvement. The organization must first decide whether the observed work is conformance, correction, or advancement.

"This week, 60% of capacity operated the service, 25% corrected defects, and 15% improved a conforming system" is a sentence leadership can understand and act on.

### Work Types

Minimally, the team must understand and consistently classify its incoming work.

In ITSM environments, common categories are:

- **Incident** — something is broken or degraded. Restore service.
- **Request** — someone needs something done. Fulfill it.
- **Change** — we decided to modify something. Approve and execute it.

In other environments the equivalent categories may be things like:

- unplanned issue / exception
- standard request / order / intake
- planned process or system change

The exact names matter less than the consistency of classification. The point is to avoid throwing unlike work into one generic bucket and then wondering why the data is useless.

Ideally, the intake form or work record forces the submitter to categorize the work at entry time. Keep the taxonomy short. If the list of work types is too long, the team probably does not yet understand its service model clearly enough.

## Establishing the Foundation

### Problem Definition and Baseline

Before selecting tools, ceremonies, or boards, define the current state.

1. Identify the service or workflow being improved
2. Define the customer impact
3. Establish a baseline:
   - cycle time
   - error rate or repeat-incident rate
   - unplanned work ratio
   - queue depth, rework, or wait time
4. Define the target condition
5. Define what evidence will show that the change worked

This is the "Define" and "Measure" portion of the work. Without it, teams tend to confuse visible activity with improvement.

### Organizational Goals

1. Define organizational goals
2. Define and understand service offerings — what are we doing, and why?
3. Define Service Level Objectives (SLOs) and Service Level Agreements (SLAs)

### Way of Working (WOW)

There are many ways to meet any given objective. Establishing a WOW defines how the team works within an agreed-upon structure:

- Ensures everyone works the same way — helps stay organized
- Defines how and where we track time/effort (can be as simple as time estimates on work items)
- Defines project monitoring and control: understand progress, correct course, improve delivery time and quality
- Defines meeting cadence — frequency and format

**Framework recommendation:** For teams doing largely independent, continuous work, **Kanban** is usually the better operating model. It does not force artificial sprint boundaries onto work that continues to arrive every day. What you need:

1. **Visualize work** — a board with columns (Backlog, In Progress, Review, Done). This alone is transformative for teams that track work in a system of record but do not visualize flow.
2. **Limit WIP** — start with WIP = 1 per person, then tune.
3. **Measure flow** — cycle time, throughput (work items/week), aging (oldest in-progress item).
4. **Improve policies** — explicit rules for when work moves between columns.

Scrum may still appear in the environment because leadership often wants a two-week reporting rhythm, sprint reviews, or commitment checkpoints. That does not mean the underlying work must be managed as sprint-batch execution.

A practical hybrid model often works best:

- Use **Kanban** to manage the actual flow of work
- Use **sprint reviews or regular checkpoints** as reporting and stakeholder-alignment cadences
- Use **flow metrics** as the primary operational measurement system
- Treat sprint boundaries as communication boundaries, not as permission boundaries

If standups are used, consider async formats (board walk, written update, or chat thread) to avoid turning them into status meetings for people who are not collaborating on the same work.

### Work Intake

Two rules:

1. **No work gets done without a work record**, except extreme cases (for example, a critical outage or safety event where the paperwork follows the response).
2. **All new work requests flow through a single channel** (intake workflow, scrum master, or designated queue).

Framing for the team: "You know how management said you must have a record for everything, and you get a million side requests by message, hallway conversation, or drive-by interruption? This means you get to tell people: *please submit this through the intake channel.* If they have questions about the process or need something handled urgently, refer them to the sponsoring leader." Most people are not willing to escalate trivial work to senior leadership. This assumes leader-level buy-in on the intake model.

### Evaluate Existing Processes

Before improving anything, map what exists. Process mapping is one tool for this. Identify areas of opportunity — these become work projects.

## Handling Operational Reality

Many service, support, and fulfillment teams live in a world of interrupts. If we do not explicitly account for this, planned work will always lose to urgent work, and process improvement will be the first casualty.

### Interrupt Budget

Reserve a fixed percentage of team capacity for unplanned work. Measure the current ratio first by tracking planned versus unplanned work for at least two weeks. Many interrupt-driven teams land around 40-60% unplanned.

### Rotating Shield

One person per rotation (day or week, depending on volume) is the designated interrupt handler. Everyone else works planned items. The shield absorbs urgent requests, exceptions, escalations, and "hey can you help me" interruptions. This does not require everyone to be excellent; it requires everyone to take a turn.

### The 30-Minute Rule

If an interrupt takes less than 30 minutes, the shield handles it. If it takes more, it becomes a tracked work item. But **this only works with a feedback loop on the backlog**:

- **A defect routes to corrective engineering.** The first occurrence may justify immediate action when consequence, exposure, detectability, or containment makes the risk unacceptable. Recurrence strengthens the evidence; it does not create the obligation.
- **Legitimate repeatable demand routes to standard work.** Frequency and cumulative effort may then justify documentation, standardization, or automation.
- **A recurrence threshold is an alerting rule, not a quality standard.** A rule such as three similar records in a month can force review of low-severity patterns. The review still has to classify the cause and decide whether to correct, standardize, improve, accept within a narrow tolerance, or reject as unsupported.
- Anything that remains unresolved for 60 days returns to an accountable decision owner. Backlog age cannot silently turn a known defect into an accepted limitation.

> **Implementation note:** The work-management system should aggregate demand by cause and surface patterns for classification. The resulting route—corrective engineering, standardization, improvement, accepted limitation, or no action—must be recorded rather than inferred from a threshold.

### Standard-Work-First Response

When the shield handles an interrupt, step one is checking whether documented standard work exists. If yes, follow it. If no, handle it manually *and create the documentation as part of the resolution*. A legitimate repeated procedure is a standardization opportunity. When the interrupt exposes a defect, the procedure is containment; documenting or automating the workaround does not close the corrective obligation.

Visibility exposes recurrence. The organization can now distinguish legitimate repeatable demand from a defect, route required correction without waiting for a frequency threshold, and reserve improvement language for raising a system that already conforms.

<!-- Preview assembly source: Process-Improvement-Framework.md: sections 1–5 -->
