# Process Improvement and Creating High-Performing Teams

A portable framework for introducing structured process improvement to service, operations, engineering, support, fulfillment, and other execution-focused teams. Originally developed as a conversation guide; expanded into a reference document for pitching to leadership and onboarding teams.

## 1. Why Process Improvement

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

The examples in this document lean toward IT and technical operations because that is where the framework was used most heavily, but the underlying model is broader than that.

## 2. The Maturity Ladder

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

## 3. Work Taxonomy

### Delivery Work vs Improvement Work

Same people, different hats. The split is not about headcount; it is about capacity allocation.

- **Delivery work**: keeping the service, workflow, or operation running. This may include incident response, order fulfillment, exception handling, customer response, or daily execution.
- **Improvement work**: automation, tooling, standardization, process redesign, training, and systemic fixes that make delivery work more repeatable and scalable.

In infrastructure teams this often maps cleanly to **operations vs engineering**. In other environments it may map to **daily execution vs process improvement**, **production vs continuous improvement**, or **service delivery vs enablement**.

"This week, 60% of our capacity went to delivery work and 40% to improvement work" is a sentence leadership can understand and act on.

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

## 4. Establishing the Foundation

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

## 5. Handling Operational Reality

Many service, support, and fulfillment teams live in a world of interrupts. If we do not explicitly account for this, planned work will always lose to urgent work, and process improvement will be the first casualty.

### Interrupt Budget

Reserve a fixed percentage of team capacity for unplanned work. Measure the current ratio first by tracking planned versus unplanned work for at least two weeks. Many interrupt-driven teams land around 40-60% unplanned.

### Rotating Shield

One person per rotation (day or week, depending on volume) is the designated interrupt handler. Everyone else works planned items. The shield absorbs urgent requests, exceptions, escalations, and "hey can you help me" interruptions. This does not require everyone to be excellent; it requires everyone to take a turn.

### The 30-Minute Rule

If an interrupt takes less than 30 minutes, the shield handles it. If it takes more, it becomes a tracked work item. But **this only works with a feedback loop on the backlog**:

- **Recurring interrupt = improvement project, not backlog clutter.** If the same type of interrupt shows up 3 times in a month, it graduates from "observed work item" to "prioritized improvement work."
- The backlog isn't where interrupts go to live — it's where they go to be *observed*. The observation period is short (one month), and the exit condition is clear: automate it, or explicitly decide it's rare enough to keep manual.
- Anything that sits in the backlog for 60 days without action gets reviewed — either it matters enough to schedule, or it doesn't matter and you close it. No 10,000-item graveyard.

> **Implementation note:** The "recurring interrupt → improvement project" concept needs a concrete implementation in the team's work-management tool — automation rules, dashboards, or saved filters to surface recurring patterns. To be designed separately.

### Standard-Work-First Response

When the shield handles an interrupt, step one is checking whether documented standard work exists. If yes, follow it. If no, handle it manually *and create the documentation as part of the resolution*. Every interrupt is a standardization opportunity, and many become automation opportunities later.

## 6. The Standardization and Automation Ladder

The long-term goal is that nothing done regularly should remain ad hoc. Some work should end up fully automated; some should end up as standardized checklists or documented procedures. The point is to move recurring work upward, incrementally.

| Level | Description | Example |
|-------|-------------|---------|
| 0 — Undocumented | "Ask the one person who knows how" | Tribal knowledge |
| 1 — Documented | Written procedure with clear steps | SOP, wiki page, runbook |
| 2 — Checklist | Step-by-step with verification at each stage | Checklist a new team member can follow |
| 3 — Semi-Automated | Tooling does the work, human runs it and validates | Script, macro, workflow, playbook |
| 4 — Fully Automated | Triggered by event, human notified of result | Scheduled job, system workflow, webhook-triggered process |

The goal is to move everything at least one level up. Not everything needs to be Level 4. Some things are fine at Level 3 forever. But **nothing should be Level 0** — that's key-person risk, and it's the argument that resonates at every level of the organization.

### Getting People to Automate

Modeling the behavior, showing results, and making it visible is necessary but not sufficient. If the barrier were awareness, watching someone else automate would be enough. It usually isn't. Common barriers and fixes:

**They don't know how.** For someone who came up through GUI-based administration, "just write a script" is like telling someone who's never cooked to "just make dinner." The fix isn't training classes — it's pairing. Pick one recurring manual task, sit with them for 90 minutes, co-author the first script together. Them driving, you navigating. They need the "I made the computer do the thing" moment firsthand. The first script is the wall; the second is dramatically easier.

**There's no incentive (and there might be a disincentive).** Automate a 2-hour weekly task and what happens? You get 2 more hours of other work. No reward, no recognition. Meanwhile, the person doing it manually looks busy and needed. Automation can feel like automating yourself out of relevance. The fix: make automation the valued output (see Celebrating Wins below).

**The ROI is invisible.** Building a tool or workflow takes 4 hours. Doing the task manually takes 20 minutes. The breakeven is 12 occurrences. But people do not think in breakeven — they think "I can do this in 20 minutes or spend my afternoon fighting with tooling." The fix: make cumulative cost visible. Track manual task time. When someone does something manually for the 10th time, the work record should show "total time spent on this task type: 3.3 hours." Now the 4-hour investment has a number next to it.

**Not everyone needs to write code.** People who move a task from Level 0 (undocumented) to Level 2 (checklist) are doing valuable work. That checklist is the artifact someone else can later automate or formalize further. Meet people where they are and move them one level up.

### Celebrating Wins

Behavior that gets celebrated gets repeated. Behavior that gets ignored doesn't. This isn't soft feel-good stuff — it's operant conditioning. Concrete mechanisms:

- **Demo slot** — 10 minutes at the end of a weekly meeting. Someone shows what they automated. Not a polished presentation — just "here's the thing, here's what it does, here's how much time it saves."
- **Automation scoreboard** — a visible counter (wiki page, team channel, whiteboard) tracking: task name, who improved it, estimated time saved per month. The number only goes up. People like making numbers go up.
- **"First script" recognition** — the first time someone who's never automated anything writes a working script, name it. "A teammate wrote their first playbook this week; it handles X and saves us Y hours a month." This creates social proof that automation isn't one person's thing.
- **Blameless failure** — if someone writes a script and it breaks, the response is "good, you tried, let's fix it together." One punishment kills a year of encouragement.

## 7. Planning and Execution

### Current State Mapping

1. Map current processes
   1. Identify responsibilities and ownership (internal and external)
   2. Get the right people working on the right things (skills matrix, self-selection, or manager assignment — pick one and be explicit)
   3. Identify roadblocks and process impediments (wait time)
   4. Identify cycle time (work time + wait time)
   5. Identify value-added vs non-value-added activities. Example: are there things senior admins are doing that could be done by junior staff or automated entirely?
2. Map ideal state processes
   1. Identify process gaps and inefficiencies
   2. Identify skill gaps
   3. Identify tech debt (things we can do but don't because we deployed them hastily)
   4. Identify infrastructure gaps (things we can't do because we lack the infrastructure)

### Backlog Management

1. Enter all work required to move from current state to ideal state into the project backlog
2. Prioritize the backlog:
   1. **Themes** — project types aligned with business objectives
   2. **Initiatives** — large categories working toward business objectives
   3. **Epics** — workable projects (may span multiple cycles)
   4. **Stories** — small enough to complete within a normal review cadence
   5. **Tasks** — steps required to complete stories

If the work is still too ambiguous to estimate or sequence confidently, stop decomposing and create a discovery package first. Execution artifacts should not be used to disguise unresolved uncertainty.

### Execution

This is the hardest part. Everything before it is planning; everything after it is review. Key concerns during execution:

- **WIP limits are sacred.** Do not start new work until current work is done or explicitly blocked. Starting everything and finishing nothing is the default failure mode.
- **Scope changes get new work items.** If requirements shift mid-task, the original item stays scoped as-is. New scope = new item = goes through prioritization.
- **Blocked work gets flagged immediately**, not at the next standup. Blockers are the team lead's (or scrum master's, or manager's) problem to remove.
- **Dependencies between team members** are visible on the board. If your work item is blocked by someone else's work item, link them. The board should make this obvious.
- **When to escalate:** if a work item has been in progress for more than 2x its estimate with no path to completion, escalate. Do not let work quietly stall.

## 8. Measuring Success

Establish at least one metric *before* starting, so we can tell whether the process improvement is actually improving anything.

### Leading Indicators (measure effort)

- **Automation coverage** — percentage of recurring tasks at each level of the automation ladder. Track monthly. Target: 0% at Level 0 within 6 months.
- **Unplanned work ratio** — unplanned work items / total work items per week. Track weekly. If this is not declining, the process improvement is not working.
- **Mean time to standard work** — when a new recurring task is identified, how long until a documented procedure exists? Target: by the end of the week it is first performed.

### Lagging Indicators (measure outcomes)

- **Cycle time** — median time from ticket creation to resolution. Segment by type (incident vs request vs project).
- **Repeat incident rate** — how often do we get paged for the same thing twice? If automation is working, this trends toward zero.
- **Time to production** — how long from "we decided to do this" to "it's in production." Captures the full cost of process overhead, approvals, and queuing.

### The Executive Number

Pick one metric for C-level reporting. **Cycle time** is the best single number. "Our average time to deliver a change went from X weeks to Y weeks" is a sentence any executive understands. Everything else is internal instrumentation that supports that one number.

### Forecasting and Sizing

If the organization requires sprint-level planning or periodic progress reporting, use a lightweight sizing approach for forecast conversations. Keep it secondary to flow metrics.

Guidelines:

- Primary operational measures should remain cycle time, throughput, aging, and unplanned work ratio
- Sizing should support planning conversations, not replace evidence
- If points are used, keep them internally consistent
- If time-box estimates are used, treat them as planning aids rather than promises

The goal is not to optimize for velocity theater. The goal is to create forecasting data that helps teams make better capacity decisions.

## 9. Retrospectives

1. Review the outcomes of the cycle, sprint, or reporting window
2. Identify ways to improve outcomes in the next iteration:
   - What worked?
   - What didn't work?
   - Even better if...
3. Include domain-relevant operational metrics reports
   - High unplanned work utilization helps us understand shortcomings in planned work
   - Review the Delivery vs Improvement capacity split — are we spending our time the way we intended?
4. Present the results of our work to key stakeholders

For more information: [Scrum.org — What is a Sprint Review](https://www.scrum.org/resources/what-is-a-sprint-review)

## 10. Stakeholder Management

### The Productivity Dip

When a team adopts structured process, throughput *drops* for the first 2–4 weeks while people learn the workflow. If leadership doesn't expect this, they'll see the dip and kill the initiative. The pitch must include: "Weeks 1–3 will be slower. This is expected. Here's why, and here's when it recovers." A J-curve chart (dip then rise) is worth a thousand words.

### "What Do We Stop Doing?"

Process improvement adds overhead. If the team is already at capacity, the overhead has to come from somewhere. Leadership must explicitly say which existing work gets deprioritized during the transition. If they won't, the initiative is unfunded — it will happen in people's spare time, which means it won't happen.

### Visible Win Within 30 Days

Pick one painful, visible, recurring task and automate it in the first month. Not the hardest thing — the most annoying thing that everyone knows about. When the C-level hears "that thing that used to take 4 hours every week now takes zero," they'll fund the rest.

### Director-Level Air Cover

The intake model ("submit the work through the intake channel; if you have questions, ask the sponsoring leader") only works with explicit buy-in at the director level. This has never been a problem in practice, but it must be established before rolling out the intake process.

## 11. Overcoming Resistance

If a team has operated without structured process improvement, there's a reason. It's usually not a knowledge problem ("here's how to do it") — it's an incentive and capacity problem ("here's why we haven't, and here's what changes to make it possible"). Common objections and responses:

**"I'm already good at my job."** The best individual contributors resist process because they see it as overhead that slows them down — and *for them personally*, it does. Frame it as reducing their personal burden, not constraining their autonomy: "Process isn't for you. It's so that when you're on vacation, someone else can do what you do without calling you." Also: "You know how you get a million side requests? This means you get to tell people *please submit it through the intake channel* and point them there."

**"We tried this before and it didn't stick."** If there's a failed attempt in the team's history, everyone remembers. Name it explicitly: "We tried X, it didn't work because Y, here's what's different this time." If you don't address it, people will quietly assume this is the same thing with a new name.

**"I don't have time for this."** The most honest objection, and usually the most valid. If the team is drowning in operational work, asking them to also do process improvement is asking them to work more. The interrupt budget, rotating shield, and "what do we stop doing" conversation with leadership address this mechanically and politically.

**"This is management's job, not mine."** Don't pitch process — pitch toil reduction: "I'm not asking you to adopt a process. I'm asking you to help me document what we already do, so we can automate the boring parts." The process improvement happens as a side effect. For the more strategically minded: "At some point, someone at the top will come looking for metrics. If we have them ahead of time, we get to control the narrative. Imagine what we can do with that kind of leverage — but we have to create the data now."

**The nuclear option:** "We have N people and no bus factor. If any one of us left tomorrow, the team would lose capabilities that take months to rebuild. This is how we fix that." Key-person risk is the argument that works at every level — ICs understand it personally, managers understand it operationally, C-levels understand it financially.

## 12. Long-Term Goals

- Formalize selection criteria — ensure projects are consistently working toward organizational goals
- Train on new technologies to reduce or eliminate skill gaps
- Improve documentation and knowledge management across the organization
- Build toward predictable capacity planning based on historical flow and delivery data
