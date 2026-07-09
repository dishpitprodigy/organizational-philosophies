# Managed Runoff for Deprecated Services

*A lifecycle discipline for treating deprecated services, processes, systems, and operating models as controlled-exit liabilities rather than continuing investment assets.*

## Purpose

Organizations often make a clear strategic decision to move away from a service, process, platform, or design, then continue funding the old path as if it were still part of the future. The language changes before the operating model does. The old thing becomes "legacy," "deprecated," or "temporary," but it still consumes roadmap space, support attention, engineering time, exception handling, and political energy.

Managed runoff is the discipline that closes that gap.

Once a service has been deprecated, the organization should stop treating it as a normal investment object. The goal is no longer to make it better. The goal is to keep it safe enough, stable enough, and understandable enough to exit without creating unacceptable risk.

The thesis is simple: **after deprecation, improvement work is presumed waste unless it directly reduces exit risk, preserves continuity during migration, satisfies a safety, security, or compliance obligation, or accelerates retirement.**

Before deprecation, work on a service may be investment. After deprecation, work on that service is carrying cost until proven otherwise.

---

## The Core Distinction

Managed runoff is related to migration patterns, but it is not itself a migration pattern.

The Strangler Fig pattern answers this question:

**How do we incrementally move functionality away from the old system?**

Managed runoff answers a different question:

**How should the organization treat the thing being left behind?**

The distinction matters because organizations can execute a migration pattern while still failing the lifecycle decision. They build the replacement path, route new traffic to it, and reduce reliance on the old service, but they never change the governance model around the deprecated path. The old service keeps receiving enhancements, exceptions, documentation projects, integrations, and cleanup work that make it easier to keep.

A migration plan without runoff discipline is additive complexity. The organization now has two operating models: the target state it says it wants, and the deprecated path it continues to feed.

---

## Relationship to Existing Frameworks

Managed runoff is not meant to replace service retirement, application portfolio management, enterprise architecture migration planning, technical debt management, legacy-system decommissioning, the Strangler Fig pattern, or portfolio models such as tolerate, invest, migrate, and eliminate.

The useful move is to put those ideas into plain operational language:

**Is this still an investment asset, or is it now a managed-runoff liability?**

That question changes the conversation. If the old service is still an investment asset, normal improvement work may make sense. If it is a managed-runoff liability, the work should be limited to safety, continuity, compliance, migration enablement, knowledge extraction, risk reduction, and shutdown.

The framework is not ceremony for its own sake. It is a way to stop treating a system like a product after the organization has already decided it should not be part of the future.

---

## When Managed Runoff Applies

Managed runoff applies when the organization has decided that a service, process, design, platform, vendor path, or operational model is no longer the desired future state.

Common triggers include:

- a replacement platform has been approved
- a process has been formally deprecated
- a vendor product is being exited
- a legacy service has been neutralized as the primary path
- a design has been superseded by a target architecture
- an old operating model remains only for compatibility or unmigrated consumers
- a platform is being held only for read-only reference, fallback, or transition support
- a compliance, security, or lifecycle concern requires eventual removal

Managed runoff should not wait until the final shutdown project. It begins when the value classification changes. The important moment is not when the last consumer leaves. The important moment is when the organization decides that the deprecated thing is no longer where future value should accumulate.

That decision should be explicit. If the organization cannot name the deprecation date, replacement path, owner, allowed maintenance scope, and next review point, it has not actually put the service into managed runoff. It has merely expressed dissatisfaction with the current state.

---

## KO Is Not Kill

There are two different retirement states that organizations often confuse.

### KO

A KO means the old service has been neutralized as the primary path.

It may still exist as:

- fallback
- read-only reference
- emergency path
- compatibility layer
- support path for unmigrated consumers
- temporary bridge while consumers move to the target state

KO is useful progress, but it is not retirement. The old service may no longer be strategic, but it still has dependencies, obligations, and carrying cost.

### Kill

Kill means the old service has been removed from the operating model.

The kill state requires:

- no active consumers
- no normal support obligation
- no enhancement path
- no hidden dependencies
- no planning allocation
- no privileged exception status
- no reason for the service to keep appearing in roadmap discussions

The kill state is the actual retirement target.

Many organizations mistake KO for kill. The old service stops being the default path, so leadership psychologically moves on. But the service still exists. People still ask for changes. Teams still route exceptions through it. Auditors still find it. Engineers still get paged for it. Stakeholders still delay migration because the fallback is available.

That is not retirement. That is an unmanaged transition state.

---

## The Zombie Service Failure Mode

A zombie service is a deprecated service that continues to consume labor, planning attention, maintenance effort, and political oxygen after the organization has decided it should not be the future state.

Zombie services survive because the organization avoids forcing lifecycle decisions. Everyone knows the old path should go away, but nobody owns making it disappear.

Common symptoms:

- "We know this is going away, but..."
- "We just need to clean this up first."
- "We should document the old service better."
- "We need to make it more robust while we migrate."
- "We cannot remove it yet because someone might still need it."
- "Let's add this one feature to the legacy path."
- "We will revisit this next quarter."

Some of those sentences can be legitimate. A deprecated service may still need emergency repair, migration support, dependency discovery, or shutdown preparation. The failure is not touching the old path at all. The failure is touching it under the old investment logic.

Under managed runoff, every proposed change to the deprecated service has to answer a simple question:

**Does this help us exit safely, or does it make the old path more durable?**

If the work makes the old path more attractive, more usable, more integrated, or more politically comfortable without reducing exit risk, it is probably preserving the failure mode.

---

## Allowed, Questionable, and Disallowed Work

Managed runoff changes the default classification of work.

### Allowed Work

Work is allowed when it directly supports:

- safety
- security
- compliance
- continuity during transition
- migration enablement
- dependency discovery
- knowledge extraction
- shutdown readiness
- emergency repair
- data preservation or legally required retention
- rollback readiness for a defined cutover window

Allowed work should still be scoped tightly. The test is not "could this be useful?" The test is "what exit risk does this reduce?"

### Questionable Work

Work should be challenged when it involves:

- polishing the deprecated path
- improving user experience on the deprecated path
- improving performance beyond transition needs
- refactoring internals without migration benefit
- expanding documentation for a soon-to-die service
- creating new dashboards that normalize long-term operation
- cleaning up code or process because it is ugly rather than risky
- adding monitoring that does not connect to a transition obligation

Questionable work is not automatically forbidden. Sometimes the cheapest way to migrate safely is to clarify a confusing path, add temporary observability, or document a shutdown procedure. But the burden of proof belongs to the person asking for the work.

### Disallowed by Default

Work should generally be rejected when it:

- creates new consumers
- expands old functionality
- adds new integrations
- increases attachment to the deprecated service
- extends the retirement timeline without explicit approval
- makes the deprecated path more attractive than the replacement
- consumes capacity needed for the target-state work
- preserves ambiguity about the future state
- turns an exception path back into a normal path

The deprecated service should be maintained only enough to exit. Not enough to make it elegant. Not enough to make it feel modern. Not enough to make people comfortable staying there.

---

## Operating Model

Managed runoff needs an operating model, not just a label.

At minimum, each deprecated service should have:

- **Deprecation date:** when the organization decided the service is no longer the desired future state
- **Replacement path:** the target service, process, vendor, platform, or operating model
- **Runoff owner:** the person or team accountable for keeping the old service safe until exit
- **Retirement owner:** the person or team accountable for making the old service disappear
- **Allowed maintenance scope:** the kinds of work still justified
- **Forbidden maintenance scope:** the kinds of work no longer accepted
- **Dependency inventory:** the consumers, jobs, integrations, reports, runbooks, users, vendors, and controls still tied to the old path
- **Exit criteria:** what must be true before the service can be killed
- **Kill date or review date:** when the next lifecycle decision is forced
- **Exception policy:** which conditions justify touching the old path outside the planned runoff scope

The runoff owner and retirement owner may be the same person, but the responsibilities are different. Runoff ownership keeps the old service controlled during transition. Retirement ownership drives the organization toward kill criteria.

If nobody owns retirement, the deprecated service will tend to stabilize at KO. It will be less visible than before, but still alive.

---

## Process Shape

Managed runoff can be run as a lightweight lifecycle process.

### 1. Declare the Deprecation

Record the decision in plain language:

- what is deprecated
- why it is deprecated
- what replaces it
- what no longer belongs on the old path
- when the next decision will be reviewed

This is where the investment classification changes. The old service exits the normal improvement portfolio and enters managed runoff.

### 2. Freeze the Improvement Surface

Define what kinds of work are no longer accepted. Make the default visible to intake, planning, support, engineering, product, compliance, and stakeholder teams.

Requests should not disappear into informal negotiation. They should be classified:

- allowed runoff work
- migration work
- exception request
- rejected legacy improvement
- target-state backlog item

This classification prevents legacy demand from laundering itself through ordinary planning language.

### 3. Inventory Dependencies

Find what still depends on the deprecated service.

The inventory should include technical dependencies, process dependencies, reporting dependencies, customer dependencies, data dependencies, access paths, scheduled jobs, human workarounds, audit controls, and emergency procedures.

The goal is not documentation for its own sake. The goal is to expose the work required to kill the service.

### 4. Define Exit Criteria

Exit criteria describe the kill state in operational terms.

Useful criteria include:

- all consumers have migrated
- all data retention obligations have been satisfied
- all required records have been archived
- all integrations have been removed or redirected
- all runbooks have been retired or replaced
- all access paths have been closed
- all monitoring and alerting have been removed or transferred
- all support obligations have ended or moved to the replacement path
- rollback paths are no longer required
- accountable owners have signed off on removal

Exit criteria should be specific enough that the organization can tell the difference between "almost done" and "done."

### 5. Operate the Runoff Backlog

The runoff backlog should be separate from normal improvement work, or at least explicitly labeled inside the same work system.

Every item should identify:

- the exit risk being reduced
- the affected dependency or consumer
- the owner
- the expected evidence of completion
- the decision checkpoint it supports
- the reason it belongs on the old path instead of the target path

This keeps runoff work from becoming a vague bucket for "legacy cleanup."

### 6. Force Decision Checkpoints

Runoff work needs scheduled reviews because indefinite transition is the default failure mode.

At each checkpoint, the organization should ask:

- what dependencies remain?
- what work was completed since the last review?
- what work was added, and why?
- what exceptions were granted?
- what requests were rejected?
- what risks changed?
- what consumers are blocking retirement?
- is the kill date still credible?
- what decision is needed now?

The checkpoint should produce a decision, not only a status update.

---

## Decision Checkpoints

Managed runoff has several natural gates.

| Checkpoint | Decision |
|---|---|
| Deprecation | Is this service no longer part of the future state? |
| Runoff entry | What work is still allowed on the deprecated path? |
| Dependency baseline | Do we know who and what still depends on it? |
| Migration readiness | Can consumers move to the replacement path? |
| KO | Has the old service stopped being the primary path? |
| Exception review | Is this requested work justified under runoff rules? |
| Kill readiness | Are exit criteria satisfied? |
| Post-kill review | Did removal create unexpected fallout, and what should the organization learn? |

The KO checkpoint deserves special attention. It should be treated as progress, not victory. KO proves the old service can lose strategic primacy. Kill proves the organization can stop carrying it.

---

## Evidence and Artifacts

The organization should leave enough evidence to reconcile the lifecycle decision later.

Useful artifacts include:

- deprecation decision record
- replacement-path summary
- allowed and forbidden work policy
- dependency inventory
- consumer migration list
- exception register
- runoff backlog
- risk register
- exit criteria checklist
- cutover plan
- rollback or contingency plan for the defined transition window
- data retention and archive plan
- shutdown record
- post-kill review

Evidence should be durable, but it should not become a documentation vanity project. A deprecated service does not need a beautiful new knowledge base unless that knowledge base directly supports migration, continuity, compliance, or shutdown.

The artifact standard is practical:

**Could another accountable person understand why the old service was kept, touched, migrated, or killed?**

If yes, the evidence is probably sufficient. If no, the organization is relying on memory at exactly the point where memory tends to disappear.

---

## Risk and Exception Handling

Managed runoff is not negligence. It does not mean ignoring a vulnerable, unstable, or compliance-relevant system because the organization plans to remove it later.

It means exceptions are handled under explicit rules.

Exceptions may be justified for:

- active security exposure
- compliance obligation
- safety concern
- material availability risk during transition
- data loss or retention risk
- customer-impacting defect with no target-state workaround
- migration blocker
- emergency repair
- shutdown blocker

Each exception should record:

- what condition triggered the exception
- why the work must happen on the deprecated path
- what risk the work reduces
- what scope is explicitly excluded
- who approved it
- when the exception expires or returns for review
- whether the work changes the kill date

The most dangerous exception is the one that silently becomes a new normal. If an exception creates a new consumer, extends support obligations, or makes the deprecated path more attractive, it should trigger a lifecycle review rather than slip through as routine maintenance.

If the organization keeps granting exceptions, one of three things is true:

1. The replacement path is not ready.
2. The exit criteria were wrong.
3. The service has not actually been deprecated.

All three are management problems worth surfacing.

---

## What To Strip Down Under Lower-Risk Conditions

Not every deprecated service needs a heavy retirement program. Managed runoff should scale with risk.

For a low-risk internal process, a small tool with no sensitive data, or a service with a tiny consumer set, the organization can strip the model down to a few essentials:

- one named owner
- one sentence explaining why the service is deprecated
- one named replacement path
- a short list of known consumers
- allowed work limited to continuity, migration, and shutdown
- a simple exit checklist
- a review or kill date
- a lightweight exception log

The low-risk version should still preserve the core discipline: no new consumers, no new features, no polishing the old path, and no indefinite review cycle.

The point is not ceremony. The point is preventing the old service from re-entering the investment portfolio through habit, fear, or convenience.

---

## Common Anti-Patterns

### Replacement Without Runoff Discipline

The organization approves a replacement but never defines the lifecycle of the thing being replaced. The result is duplicated work, unclear ownership, inconsistent standards, and endless exceptions.

### Cleanup as a Substitute for Retirement

Teams keep improving the deprecated service because cleanup feels responsible. But cleanup without exit criteria often extends the life of the old path.

### Documentation as Attachment

The organization creates extensive new documentation for a soon-to-die service without connecting the work to migration, continuity, compliance, or shutdown. The documentation makes the old path easier to keep.

### Exception Drift

One justified exception becomes a second, then a pattern, then an unofficial support model. The deprecated path returns through side doors.

### KO Theater

Leadership celebrates that the old service is no longer primary, but nobody drives the final removal. The organization mistakes reduced visibility for retirement.

### Target-State Starvation

The replacement path is officially strategic, but the old path keeps consuming the people needed to finish it. The organization funds the future with words and the past with capacity.

### Hidden Consumer Veto

An unnamed or low-visibility consumer blocks retirement indefinitely because nobody forces the dependency into the open and assigns a migration decision.

---

## What Managed Runoff Changes

Without managed runoff, organizations tend to ask:

- Can we improve the old service enough to keep people comfortable?
- Can we clean this up before we migrate?
- Can we add one more feature to bridge the gap?
- Can we support both paths for now?
- Can we revisit retirement later?

With managed runoff, they ask better questions:

- Is this still an investment asset, or is it now a controlled-exit liability?
- What exit risk does this work reduce?
- Does this request create attachment to the deprecated path?
- Who still depends on the old service?
- What has to be true before we kill it?
- What exception did we grant, and when does it expire?
- Are we preserving continuity, or are we preserving ambiguity?
- Is the replacement path being starved by runoff work?

The responsible act is not always to maintain the old thing better. Sometimes the responsible act is to stop investing, contain the risk, migrate the consumers, and kill it.

---

## Open Questions and TODOs

- Define how managed runoff should connect to architecture decision records, especially when the deprecation decision comes from a broader target-architecture choice.
- Define the minimum artifact set for high-risk services versus low-risk services.
- Clarify whether runoff owner and retirement owner should usually be separate roles in larger organizations.
- Add examples for vendor exits, internal process retirements, platform migrations, and application decommissioning.
- Define how exception approvals should differ for security, compliance, availability, customer commitments, and internal convenience.
- Add a lightweight template for a managed runoff decision record.
- Clarify how to handle services that are deprecated in strategy but still required by contract.
- Define the point at which repeated exceptions mean the deprecation decision should be revisited.
- Connect managed runoff to portfolio language such as tolerate, invest, migrate, and eliminate without turning the framework into vendor-framework jargon.
