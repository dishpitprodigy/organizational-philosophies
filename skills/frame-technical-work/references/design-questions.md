# Design questions

Use these categories when assessing readiness. Adapt the questions to the system; do not copy illustrative targets from other projects or demand irrelevant measurements.

## Requirements — gate

- What problem is being solved, for whom, and with what observable success condition?
- What population, behavior, operating conditions, and exceptions does the requirement cover?
- What scale must work on day one and later?
- Are performance and reliability requirements precise enough to test? Include measurable targets and time horizons where meaningful.

“Fast DNS” is insufficient. A usable requirement distinguishes query rate, steady and peak load, burst duration, latency percentile, cached versus uncached behavior, locality, and the failures under which those thresholds hold. Establish actual values from evidence or the requirement owner.

## Performance, failure, and recovery — gate

- What throughput and latency must hold, for what fraction of requests and under what conditions?
- What happens during partial degradation, capacity exhaustion, or dependency failure?
- Which service must remain available? What loss or interruption is tolerable?
- How is partial failure recovered? What is the slowest acceptable recovery path?
- What are the recovery time and recovery point objectives, where applicable?

## Operational impact and accountability — gate

- Who consumes, operates, maintains, upgrades, and supports the system?
- Are users equipped to operate it safely? How frequently must a person intervene?
- Who responds at 02:00, owns uptime, and maintains the automation?
- Can dashboards, alerts, and procedures make the required action and responsible operator obvious under pressure?
- Who permits change, can pause rollout, and accepts risk?
- Is this a new system, upgrade, or replacement? For replacement, what changes in migration, support ownership, day-to-day operation, and handoff?
- What human effort, cognitive load, process burden, and maintenance cost does the change create?

## Lifecycle, coupling, complexity, and tooling — constraints on the gates

- How often does this system change? Which upstream changes invalidate its assumptions, and what must be retested?
- Which systems assume it simply works? Identify hidden timing, naming, identity, and availability contracts.
- Where can complexity be sustained by an owning expert team or automation, and where would it burden routine or emergency operation?
- Who pays to understand, test, operate, and change complexity hidden behind an interface?
- Does flexibility provide needed capability or recurring support burden? Does standardization speed recovery or make differing requirements impossible to meet?
- How many APIs and languages must be supported, and who receives the benefits and owns the costs?

Evaluate tooling from both engineering and operating perspectives. Do not select a product during framing or let its defaults silently decide organizational policy. Promote an open question to a gate when its answer controls design fitness or risk acceptance.

## Pre-mortem — gate

Assume a major incident occurred after launch. Identify plausible causes: capacity, latency, operational overload, unclear ownership, automation failure, or unexpected usage. Seek operator input as well as designer input; if unavailable, record that evidence gap rather than imply consultation occurred.

Convert each material scenario into a requirement, risk, or discovery question. A completed meeting is not the output; evidence that changes the design is.

## Consumption and management — design informing

Consider UI, API, and infrastructure-as-code consumption; central, shared, or self-service operation; safe repeatable changes; ownership boundaries; and auditability. These shape early exploration. If an answer determines a trust boundary, access requirement, or other gate, resolve it before the affected commitment.

For DNS, useful examples include who can modify which record types, whether delegation follows team ownership, and how one team is prevented from changing another's records. The relevant boundary must be explicit before solution selection; the example does not prescribe a universal DNS operating model.
