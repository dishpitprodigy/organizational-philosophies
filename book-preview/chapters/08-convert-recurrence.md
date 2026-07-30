# Convert Recurrence Into Improvement

*Part IV — Operating, Improving, and Retiring the System*

Recurring work is not merely a queue-management problem. It is evidence about the operating model. The improvement loop begins when the organization stops treating each repeated request as an isolated success and asks whether the pattern should be documented, standardized, automated, prevented, or consciously retained.

## The Standardization and Automation Ladder

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

## Planning and Execution

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

## Measuring Success

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

## Retrospectives

1. Review the outcomes of the cycle, sprint, or reporting window
2. Identify ways to improve outcomes in the next iteration:
   - What worked?
   - What didn't work?
   - Even better if...
3. Include domain-relevant operational metrics reports
   - High unplanned work utilization helps us understand shortcomings in planned work
   - Review the Delivery vs Improvement capacity split — are we spending our time the way we intended?
4. Present the results of our work to key stakeholders

The distinction between a retrospective and a Sprint Review is documented by [Scrum.org — What is a Sprint Review](https://www.scrum.org/resources/what-is-a-sprint-review)

Retrospectives, metrics, and recurring-demand evidence create several review loops. Without a defined cadence and decision boundary, those loops tend to collapse into status meetings or operate as unrelated ceremonies.

<!-- Preview assembly source: Process-Improvement-Framework.md: sections 6–9 -->
