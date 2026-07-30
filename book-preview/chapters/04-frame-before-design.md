# Frame the Work Before Designing It

*Part III — Framing and Authorizing Work*

Selection gives a problem permission to consume discovery and design effort. It does not justify premature decomposition. Framing keeps the problem class, constraints, non-goals, expected reasoning artifact, and downstream decisions visible long enough for design to respond to reality rather than to the wording of the initial request.

> **Preview note — future edition**
>
> A future version will sharpen the diagnostic between the visible instance and the underlying problem class, add a full enterprise example of a locally defensible decision exporting incoherence across team boundaries, and name field vision more directly: preserving likely change paths without pretending to predict every future feature.

## Usage

### The Rule

- Do not decide details first.
- Decide what kind of thinking the work requires.

The questions in this chapter are not a checklist to complete after the design has already converged. If a design-gate question cannot be answered with confidence, the design should pause. Bounding the uncertainty is sufficient only when the bounds make the design decision, risk, and risk owner explicit.

Some questions are **Design Gates**: they must be addressed before architectural decisions or delivery commitments are made. Others are **Design Informing**: they should shape the design but do not need to block early exploration.

The distinction prevents premature convergence. It also makes constraints, operational costs, decision rights, and failure modes visible before the organization commits itself to a solution.

![Framing moves from the request through the Five-Box Scaffold and bounded discovery into design gates; unanswered gate questions return to discovery, while answered gates permit commitment and execution planning.](../assets/images/framing-technical-work/framing-to-execution.svg){#fig-framing-to-execution}

---

## The Five-Box Framing Scaffold

When a new project appears, answer five questions in writing.

### What kind of problem is this?

Choose one primary intent:

- **Discovery:** reduce uncertainty;
- **Migration:** move state A to state B;
- **Redesign:** change structure;
- **Enablement:** remove blockers for others; or
- **Optimization:** improve efficiency or flow.

These are intent categories, not formal PMI categories. If the work is misclassified, it usually becomes harder to scope, sequence, explain, and review.

### What must be true before work starts?

List constraints, not solutions:

- Is security sign-off required?
- Are organizational boundaries fixed?
- Are timelines immovable?
- Must an upstream capability or decision exist first?

This prevents fantasy planning: a plan that is internally coherent only because it ignores the conditions required to execute it.

### What is explicitly not being solved?

Write the non-goals early. If they remain implicit, they will be reintroduced later as assumed scope.

### What reusable artifact must exist at the end?

Examples include:

- a taxonomy;
- a decision record;
- a capability list;
- a trust model;
- a requirements set; or
- a reference pattern.

If the answer is only "running code," this framing framework is probably no longer sufficient on its own. The work may already be in execution planning.

### What downstream work should never need to ask "why" again?

That is the success measure for framing. The artifact should preserve the reasoning downstream work depends on: what was decided, which evidence supported it, what remained outside the boundary, and which conditions would require the decision to be revisited.

---

## Determine Whether the Work Is Ready for Design or Execution

Not all problems benefit from the same planning approach. Some are well understood and can be designed largely up front. Others reveal their requirements, coupling, and constraints only through discovery.

Platform, infrastructure, and identity initiatives often fall into the second category. Attempting to specify the complete solution before understanding trust boundaries, operational realities, and failure modes creates rework while making the early plan look more certain than the evidence supports.

Framing should precede design commitments. Discovery produces evidence the design still lacks; design can proceed when its design-gate questions are answered and any remaining uncertainty is bounded. Implementation commitments should not convert unresolved decisions into tasks.

### Project phases still exist

This framework is compatible with PMI-style phase thinking: initiation, planning, execution, monitoring and controlling, and closing.

Agile and Scrum change how execution and feedback loops operate. They do not eliminate initiation, planning, scope control, or decision rights.

Reference: [PMI Process Groups Overview](https://projectbliss.net/pmi-process-groups/)

### Discovery packages and tasks

Early platform work is often better organized around outcomes than prescribed steps. This chapter uses **discovery package** as an adapted term for ambiguous, early-phase technical work.

It is intentionally not strict PMBOK terminology:

- In PMBOK and WBS language, a **work package** is the lowest level of a work breakdown structure.
- Discovery-heavy technical work needs a planning unit that remains outcome-oriented but is not ready to be decomposed into execution steps.
- A **discovery package** fills that gap.

The term does not replace PMBOK terminology. It makes early technical planning legible without pretending discovery work is already executable.

The relationship is:

- **PMBOK work package:** a formal planning unit inside a WBS;
- **Discovery package:** a pre-execution planning unit for complex or uncertain work; and
- **Story or task:** an execution unit after the ambiguity has been reduced.

| Tasks | Discovery packages |
| --- | --- |
| Describe actions | Describe outcomes |
| Ordered and prescriptive | Loosely ordered or parallel |
| Fragile when assumptions change | Stable when assumptions change |
| Easy to micromanage | Easy to delegate |
| Good for execution | Good for discovery and alignment |

If the team does not yet know the right steps, it is usually in discovery-package territory, not task territory.

### What a discovery package defines

A discovery package defines:

- the question being answered;
- the constraints under which it is explored; and
- the artifact produced when the work is complete.

This allows progress without committing prematurely to implementation details, sequencing, or tooling.

It also reflects how technical planning actually develops:

- Discovery reduces ambiguity.
- Design translates the resulting evidence into architecture.
- Execution decomposes the design into epics, stories, work packages, and tasks.

### Early classification heuristics

When the work is ambiguous and the team is tempted to begin design or execution, ask:

1. Do I already know what "done" looks like?
   - Yes: probably not Discovery.
   - No: Discovery.
2. Will doing this work constrain future options?
   - Yes: Redesign or Migration.
   - No: Discovery or Enablement.
3. Is the primary value learning, moving state, unblocking others, or improving flow?
   - Learning: Discovery.
   - Moving: Migration.
   - Unblocking: Enablement.
   - Improving: Optimization.

When unsure, default to **Discovery** first. Discovery packages do not lock in assumptions, are politically safer than premature design commitments, produce reusable artifacts, and justify a later redesign without treating earlier learning as failure.

If two categories still appear equally plausible, choose the one that produces an artifact rather than a system change.

![If the completion condition is unknown, the work remains Discovery; otherwise, its primary result distinguishes Migration, Redesign, Enablement, and Optimization, while multiple results require separate packages.](../assets/images/framing-technical-work/intent-classification.svg){#fig-intent-classification}

---

## Design Gate: Well-Defined Requirements

No system can be designed well without explicit requirements. Vague requirements create accidental complexity, unstable scope, and operational pain.

Questions that must be answered include:

- What problem is this system solving?
- Who is it for?
- What scale must it support on day one?
- What scale must it tolerate later?
- What outcomes define success?

Requirements are not optimization. They define whether the system is fit for purpose.

At minimum:

- performance characteristics must be stated explicitly;
- reliability expectations must be stated explicitly; and
- requirements should be SMART where possible:
  - Specific;
  - Measurable;
  - Achievable;
  - Relevant; and
  - Time-bound.

Requirements must be precise enough to distinguish the target condition from nearby but misleading proxies. Specificity is not pedantry. It increases confidence that everyone is discussing the same behavior, population, operating conditions, and exception model.

"The DNS service must be fast" is not a requirement. A useful requirement defines the operating envelope: supported queries per second, steady-state and peak load, acceptable response time, and the conditions under which those thresholds must hold.

For example:

> The service must sustain 250,000 queries per second, tolerate burst traffic of 500,000 queries per second for 15 minutes, keep p99 response time under 2 ms for cached lookups and under 10 ms for uncached authoritative lookups within the same region, and continue serving authoritative responses during the loss of a single node.

That statement defines an actual design target.

"Fast enough" is not a requirement.

Further reading: [Eric Brandwine, AWS re:Invent 2018](https://www.youtube.com/watch?v=GXTvlQXVCOs&t=24m16s). The entitlement exercise demonstrates how vague goals become precisely bounded requirements.

---

## Design Gate: Performance, Failure, and Recovery

Performance, reliability, degradation, and recovery behavior are design-gate topics, not implementation details.

Questions to answer:

- How many requests per second must the system handle?
- What is the expected steady-state load?
- What is the peak load?
- What latency is acceptable?
- For what percentage of requests?
- Under which operating and failure conditions?
- What happens during partial degradation?
- Which service must remain available?
- What are the recovery expectations?
- What are the RTO and RPO expectations, if applicable?

Example answers:

- The system must handle 1,000,000 requests per second.
- 99% of requests must complete in under 1 ms.
- 100% of requests must complete in under 5 ms.

These thresholds determine design fitness. They are not optional tuning targets to be discovered after implementation.

---

## Design Gate: Operational Impact and Accountability

Before beginning a design, ask:

> What is the operational cost of this system?

Every system carries operational cost:

- human effort;
- cognitive load;
- process complexity;
- failure modes; and
- long-term maintenance.

Operational impact is a first-class design constraint.

Questions to answer:

- Who uses the system?
- Are those users equipped to operate it safely?
- Who operates the system day to day?
- How often must a person intervene?
- What happens when it fails at 02:00?
- Who owns incident response?
- Who owns uptime?
- Who owns ongoing maintenance?
- Who owns upgrades and dependency changes?
- Who creates the automation?
- Who maintains the automation?
- How expensive will the system be to change or extend?
- Can an operator determine the required response with near-zero cognitive load from the dashboards, alerts, and procedures?
- Do the monitoring views make it obvious whether action is required, by whom, and under which conditions?

Also establish whether the work creates:

- a net-new system;
- an upgrade; or
- a replacement.

A replacement design must account for the transition in day-to-day operations, support ownership, migration, and handoff. Replacing software without replacing the old operating model leaves the organization with two systems and one incomplete decision.

Further reading: [Eric Brandwine, AWS re:Invent 2018](https://youtu.be/GXTvlQXVCOs?t=2075) provides useful background on reducing cognitive load in operational dashboards and decisions.

---

## Manage Complexity Where People Can Afford It

In a necessarily complex design, decide where complexity can be tolerated and where it must be reduced.

Complexity can often be tolerated:

- inside automation;
- inside platform code owned by a small expert team; and
- in systems that are rarely touched after deployment.

Complexity should usually be avoided:

- in routine operational workflows;
- in emergency procedures; and
- in systems used by many teams with different skill levels.

If an action must be performed under pressure, it should be:

- boring;
- well documented; and
- highly repeatable.

Moving complexity behind an interface does not eliminate it. The owning team still pays to understand, test, operate, and change it. The design decision determines who pays and under which conditions.

---

## Evaluate Tooling and Flexibility as Operating Decisions

Ask:

- Does flexibility reduce risk, or increase support burden?
- Does standardization reduce incident-resolution time?
- How many APIs and programming languages must the organization support?
- Is variation creating useful capability, or reproducing the same operating problem several ways?
- Which choices must remain flexible because the requirements genuinely differ?

For a DNS platform, the organization might ask whether to deploy Infoblox virtual appliances into cloud environments or delegate to cloud-native DNS services.

The decision must be evaluated from both:

- an operational perspective; and
- an engineering perspective.

A flexible engineering model can impose recurring support and incident-response costs on operators; standardization can make the system unfit when requirements genuinely differ. The design must identify who receives each benefit and who owns each cost.

---

## Design Gate: Pre-Mortems

Before building a system, assume it has already failed.

Ask:

> Some time after launch, this system caused a major incident. What went wrong?

Use the pre-mortem to identify likely failure modes:

- capacity exhaustion;
- latency degradation;
- operational overload;
- poor ownership or unclear accountability;
- automation failure; and
- unexpected usage patterns.

Pre-mortems can expose hidden assumptions, surface operational risks that happy-path design misses, and test whether the system remains operable under stress.

They work best when they:

- include operators, not only designers;
- occur before major architectural decisions are fixed; and
- become design input rather than evidence that somebody completed a required meeting.

---

Framing produces the evidence a responsible design commitment requires. The organization still needs a legitimate authorization path: reviewers must exercise distinct authority, conditions must remain real, dependencies must become commitments, and delivery capacity must be accepted by the people who own it.

<!-- Preview assembly source: Framing-Technical-Work-Before-Design.md: sections 1–3 and 5–10 -->
