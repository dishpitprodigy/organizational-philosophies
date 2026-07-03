# Framing Questions for Platform Architecture and Design

This is not a design document. It is a framing document.

Its purpose is to force the right questions before design commitments, implementation promises, or timeline commitments are made.

## Usage

These questions are not a checklist to complete after design. If they cannot be answered with confidence, the design phase should pause until they are resolved.

## Design Gates Summary

This document distinguishes between **design-gate topics** and **design-informing topics**.

- **Design Gate**: Must be addressed before architectural decisions or delivery commitments are made.
- **Design Informing**: Should shape design choices, but does not need to block early exploration.

The distinction exists to prevent premature convergence and to make sure constraints, operational costs, and failure modes are understood before solutions are selected.

## Problem Types and Design Approach

Not all problems benefit from the same planning approach. Some are well understood and can be designed largely up front. Others require discovery because requirements, coupling, and constraints become visible only during the work.

Platform and identity initiatives often fall into the second category. Attempting to fully specify solutions before understanding trust boundaries, operational realities, and failure modes usually leads to rework and avoidable risk.

This document assumes a discovery-first approach:

- Framing precedes design.
- Design precedes commitment.
- Commitment should follow explicit understanding of requirements, constraints, and operating model.

## Design Gate: Discovery Packages vs Tasks

Early-phase platform work is best organized around outcomes rather than prescribed steps. For that reason, discovery and framing work should usually be expressed as **discovery packages**, not task lists.

A discovery package defines:

- The question being answered
- The constraints under which it is explored
- The artifact produced when the work is complete

This allows progress without prematurely committing to implementation details, sequencing, or tooling choices.

It also aligns well with the reality of technical planning:

- Discovery packages reduce ambiguity
- Design work translates that learning into architecture
- Execution work later decomposes into epics, stories, and tasks

This term is intentionally adapted. It is not meant to replace formal PMBOK terminology; it is meant to make early technical planning legible without pretending discovery work is already executable.

### Example

Instead of creating tasks such as:

- Design IAM roles
- Configure SSO

An early discovery package might be:

**Define identity types and lifecycles across platform systems**

- **Output:** documented taxonomy of human, service, and workload identities
- **Non-goal:** selecting tooling or access policies

This lets downstream design proceed without re-litigating fundamentals.

## Design Gate: Well-Defined Requirements

No system can be designed well without explicit requirements. Vague requirements create accidental complexity, unstable scope, and operational pain.

Questions that must be answered explicitly include:

- What problem is this system solving?
- Who is it for?
- What scale must it support on day one?
- What scale must it tolerate later?
- What outcomes define success?

Requirements are not optimization. They define whether the system is fit for purpose.

At minimum:

- Performance characteristics must be stated explicitly
- Reliability expectations must be stated explicitly
- Requirements should be SMART where possible:
  - Specific
  - Measurable
  - Achievable
  - Relevant
  - Time-bound

Requirements should also be precise enough to distinguish the true target condition from nearby but misleading proxies. Specificity is not pedantry. It is how teams increase confidence that they are discussing the same system behavior, population, operating conditions, and exception model.

For example, "the DNS service must be fast" is not a requirement. A useful requirement would define the operating envelope more precisely: how many queries per second must be supported, what the steady-state and peak load look like, what maximum response time is acceptable, and under what conditions those thresholds must hold. A requirement such as "the service must sustain 250,000 queries per second, tolerate burst traffic of 500,000 queries per second for 15 minutes, keep p99 response time under 2 ms for cached lookups and under 10 ms for uncached authoritative lookups within the same region, and continue serving authoritative responses during the loss of a single node" is much more useful because it defines the actual design target.

"Fast enough" is not a requirement.

Further reading:
- Eric Brandwine, AWS re:Invent 2018. The entitlement exercise is a useful example of turning vague goals into precisely bounded requirements: https://www.youtube.com/watch?v=GXTvlQXVCOs&t=24m16s

## Design Gate: Performance and Failure Characteristics

Performance, reliability, and degradation behavior are design-gate topics, not implementation details.

Questions to answer:

- How many requests per second must the system handle?
- What is the expected steady-state load?
- What is the peak load?
- What is the acceptable latency?
- For what percentage of requests?
- Under what conditions?
- What happens during failure or partial degradation?
- What are the recovery expectations?
- What are the RTO and RPO expectations, if applicable?

Example answers:

- The system must handle 1,000,000 requests per second
- 99% of requests must complete in under 1 ms
- 100% of requests must complete in under 5 ms

These thresholds define design fitness. They are not optional tuning targets to be discovered after implementation.

## Design Gate: Operational Impact

Before beginning a design, ask:

**What is the operational cost of this system?**

Every system carries operational cost:

- Human effort
- Cognitive load
- Process complexity
- Failure modes
- Long-term maintainability

Operational impact should be treated as a first-class design constraint, not an afterthought.

Questions to ask:

- Who operates this system day to day?
- How often do humans need to intervene?
- What happens when something fails at 02:00?
- How expensive is it to change or extend this system later?
- Can operators determine the required response with near-zero cognitive load from the dashboards, alerts, and procedures provided?
- Do the monitoring views make it immediately obvious whether action is required, by whom, and under what conditions?

Also clarify whether this is:

- A net-new system
- An upgrade
- A replacement

If an existing system is being replaced, the design must account for the transition in day-to-day operations, support ownership, and handoff expectations.

Further reading:
- Eric Brandwine, AWS re:Invent 2018. Useful background on reducing cognitive load in operational dashboards and decision-making: https://youtu.be/GXTvlQXVCOs?t=2075

## Design-Informing Example: Designing a DNS Service

If the problem is "design a new DNS service," these are the kinds of framing questions worth answering before solution selection.

### How will end users consume the DNS service?

Will users interact through:

- UI
- API
- GitOps / IaC

Additional questions:

- Are different consumption models supported for different users?
- Does the consumption model encourage safe, repeatable changes?
- Does it require deep DNS expertise from end users?

### Who will manage DNS, and how?

Will DNS be managed by:

- A single team through service requests
- A shared service with enforced boundaries
- A self-service model for application teams

Questions to answer:

- What boundaries exist?
- How are those boundaries enforced?
- Is the enforcement procedural, technical, or both?
- How does the model scale as the organization grows?

If this is shared-service or self-service, also ask:

- What record types can a typical user modify?
- What record types should remain centrally managed?

Examples of centrally managed record types may include MX, NS, and SOA records.

### Record ownership

How do we ensure:

- Only approved users can modify a record?
- Team A cannot change records owned by Team B?

Additional questions:

- Does this affect domain structure?
- Should ownership be delegated through subdomains?
- How are ownership and changes audited?

## Managing Complexity

In a necessarily complex design, where can complexity be tolerated, and where must it be minimized?

Complexity can often be tolerated:

- Inside automation
- Inside platform code owned by a small expert team
- In systems that are rarely touched once deployed

Complexity should usually be avoided:

- In day-to-day operational workflows
- In emergency procedures
- In systems touched by many teams with varied skill levels

If an action must be performed under pressure, it should be:

- Boring
- Well documented
- Highly repeatable

## Operational Accountability

Questions to answer:

- Who uses the system?
- Are those users equipped to operate it safely?
- Who owns incident response?
- Who owns uptime?
- Who owns ongoing maintenance?
- Who owns upgrades and dependency changes?
- Who creates the automation?
- Who maintains the automation?

## Tooling Decisions and Maximum Flexibility

Ask:

- Does flexibility reduce risk, or increase support burden?
- Does standardization reduce incident resolution time?
- How many APIs and programming languages are required to support this model?
- Is it better to allow many DNS implementations, or standardize on one?

Example question:

- Is it better to deploy Infoblox virtual appliances into cloud environments, or delegate to cloud-native DNS services?

These decisions should be evaluated from both:

- An operational perspective
- An engineering perspective

## Design Gate: Pre-Mortems

Before building a system, assume it has already failed.

Ask:

> Some time after launch, this system caused a major incident. What went wrong?

Use pre-mortems to identify likely failure modes early:

- Capacity exhaustion
- Latency degradation
- Operational overload
- Poor ownership or unclear accountability
- Automation failures
- Unexpected usage patterns

Pre-mortems help teams:

- Surface hidden assumptions
- Expose operational risks not obvious in happy-path designs
- Validate whether the system is operable under stress

Pre-mortems are most effective when they:

- Include operators, not just designers
- Happen before major architectural decisions are locked in
- Are treated as design input, not a box-checking exercise
