# The Front Door

*Part II — Deciding What Deserves Organizational Attention*

A receiving team usually encounters organizational demand after the consequential decisions should already have been made. The request arrives without an authenticated owner, a stable problem statement, an accepted priority, or evidence that the organization intends to spend capacity on it. The team can either reconstruct those decisions in engineering labor or make the absence visible and return each decision to its owner.

## Thesis

Most work-intake processes begin too late.

They begin when a request reaches a team: Systems Engineering, Network Engineering, Security, Platform Operations, Finance, or another function expected to turn somebody else's need into work. The receiving team adds a form, renames its queues, publishes new ticket types, and declares that intake has improved. The labels change. The underlying problem does not.

The team still has to determine whether the request is real, who asked for it, who approved it, where it ranks against other work, which risks the organization will accept, which teams must participate, and what outcome would justify the cost. Those are not team-level intake questions. They are organizational questions that happen to become visible when the work reaches a team.

This is why so many intake reforms produce half-measures. They start with the place where demand lands instead of the system that created, authorized, and routed the demand.

Work intake is not merely a form or a queue. It is the organizational system that turns an authenticated request into one of three things:

1. a known service delivered through an existing path;
2. bounded help or discovery that produces an answer; or
3. an authorized change with evidence, ownership, review, capacity, and a later reconciliation point.

---

## The Receiving-Team Trap

A football team does not ask a quarterback to decide whether the game should be played, whether the opponent is worth playing, how much the organization should spend on the trip, which risks the front office will accept, and whether the roster can support the plan. The player is responsible for executing within a role, recognizing what changes on the field, and escalating when the play no longer fits reality. The organization around the player supplies the authority, resources, and decision structure.

Technology organizations routinely reverse that arrangement. A business area asks for a change, then the receiving engineering team is expected to:

- recover the actual need from a proposed solution;
- determine whether the requester has authority;
- locate a sponsor;
- discover hidden dependencies;
- decide whether the work is important;
- estimate work other teams have not accepted;
- identify security, financial, legal, and operational consequences;
- negotiate those consequences informally; and
- absorb the work if the organization never resolves them.

The team is then blamed for moving slowly, asking too many questions, or inventing process. Yet the questions exist whether the team asks them or not. Skipping them does not make the work simpler. It moves uncertainty out of the planning and pre-planning phases, and into the implementation (execution) phase, where discovery is more expensive and the pressure to accept a bad answer is much higher.

Local intake still matters. A team should have a clear channel, published services, readiness standards, capacity rules, and a defensible way to reject work it cannot responsibly accept. What local intake cannot do is manufacture missing organizational authority. A Systems Engineering queue cannot decide enterprise priority, accept another function's risk, commit another team's capacity, or prove that the business still wants an outcome after the original requester disappears.

The right team-level answer therefore begins one level higher: define how the organization creates authorized work, then let each team implement its part of that model.

---

## Start With the Front Door

Not every request is a proposal. Treating every contact as project intake creates ceremony around ordinary service work and teaches requesters to avoid the official path.

The first decision is categorical:

### Incident or Break/Fix

Something is broken, degraded, unsafe, or actively failing. Response begins through the operational path. An incident does not wait for proposal review. When delaying the first stabilizing action would increase harm, response may begin before a work record exists; the record follows once the immediate danger is controlled.

### Standard Service Request

The organization already provides the capability through a documented, repeatable path. The outcome, required inputs, acceptance conditions, and normal operating procedure have already been decided. The requester supplies the facts needed to instantiate the service.

### General Inquiry

The requester needs time-bounded expert assistance because they do not yet know whether a capability exists or which path applies. The servicing function decides how much inquiry work it can provide under current capacity.

A General Inquiry may end with an answer, facilitation, or directions to another workflow. It does not become a Work Proposal, and it does not prepopulate one. The customer must knowingly initiate the new request because authorship and accountability are part of the evidence.

### Assisted Intake

The request appears to involve real change, but the customer cannot complete the intake path without help interpreting the process. Assisted Intake answers questions such as: Does this requirement apply? What kind of evidence will satisfy it? Which decision should already have been made? Which function owns the next step?

This is process navigation, not discovery work. Assisted Intake may explain a requirement, identify a missing prerequisite, or redirect the requester to Security, Architecture, Finance, or another responsible function. It may not perform the research, architecture, design, testing, product comparison, or sustained coordination needed to answer the requester's underlying question.

The distinction matters because receiving teams routinely inherit decisions that nobody actually made. A request for a one-terabyte PostgreSQL server is not yet a Systems Engineering provisioning problem merely because somebody submitted it that way. Assisted Intake first asks who approved the platform choice, capacity requirement, operating model, and organizational cost. If those decisions do not exist, the request returns to the workflow that owns them. Systems Engineering does not convert an unsupported implementation assumption into an approved architecture by explaining how it might be built.

When the missing answer requires substantive work, Assisted Intake has reached its stop condition. The requester must knowingly initiate sponsored discovery through the appropriate path, with a decision-critical question, committed capacity, a timebox, and an expected artifact. Assisted Intake may identify that path, but it does not remain open for months as the container for vendor meetings, technical investigation, or cross-team design. That would make discovery invisible and prevent the organization from distinguishing legitimate research demand from a broken intake question.

Assisted Intake should record why assistance was necessary: unclear requirement, disputed applicability, missing prerequisite, incorrect route, or discovery needed. If many requesters fail at the same question, the organization should inspect the question, its order, and the level at which it is being applied. Repeated confusion is evidence about the process; it should not be converted into permanent demand for more intake assistance.

### Work Proposal

The requester seeks to evaluate or deliver a change that cannot be fulfilled through an existing service request path. The request requires sponsorship, evidence, review, capacity, and an explicit decision before implementation begins.

These paths should remain separate because they preserve different facts. Converting an inquiry into a proposal or asking a receiving team to submit on a customer's behalf may feel efficient, but it destroys the cleanest evidence of who knowingly asked the organization to act.

![The front door routes authenticated demand according to the kind of commitment it requires.](../assets/images/work-intake/front-door-routing.svg){#fig-front-door-routing}

---

## Provenance Before Convenience

Every request needs an immutable, authenticated record of who initiated it and when. A reporter field that anyone can edit is not authorship. A copied chat message is not approval. A ticket created by the receiving team is evidence that the team created a ticket, not that the customer accepted responsibility for the demand it contains.

This rule is stricter than common practice because common practice routinely creates fictional accountability. A team member tries to be helpful, translates a conversation into a request, names the customer in a mutable field, and begins work. Months later, the customer disputes the scope, the sponsor says they never approved it, or leadership asks why the team chose this work over something else. The record cannot answer because it never captured the original act of asking.

Receiving teams may create child work, review modules, implementation records, and other artifacts derived from an authentic parent request. Those records do not pretend to be new customer submissions.

> A team may derive work from authenticated demand. It may not manufacture the demand itself.

---

## What a Work Proposal Must Prove

A Work Proposal is not a project charter in miniature, nor a solution description with approval fields attached. It records enough about the proposed change to support a responsible decision.

At minimum, it must establish:

- **Current State:** what capability, constraint, failure, cost, or operating condition exists now;
- **Desired Outcome:** what should become true;
- **Required Difference:** the material gap between the current and desired states;
- **Requirements:** what the result must do or preserve;
- **Acceptance Conditions:** what observable evidence will show that the outcome is real;
- **Non-Goals:** what the proposal deliberately does not solve;
- **Dependencies:** which systems, teams, vendors, decisions, and external events affect the work;
- **Known Uncertainty:** what remains unknown, why it matters, and how the organization expects to resolve it;
- **Timing Evidence:** the event or date that matters and the consequence of missing it;
- **Operational Ownership:** who will operate, support, and maintain the result; and
- **Sponsorship:** who accepts the proposal's priority claim and organizational tradeoffs.

![The proposal's central argument connects the current state to a desired outcome through a required difference, while boundaries, proof, feasibility, and stewardship make that argument governable.](../assets/images/work-intake/work-proposal-evidence.svg){#fig-work-proposal-evidence}

The proposal must govern exactly one top-level outcome. That outcome may require one Epic or an Initiative containing several independently valuable Epics. The hierarchy follows the completion condition, not the amount of effort: an Initiative is complete when its organizational outcome becomes true, not merely when every child ticket closes.

### Sponsorship Is an Act

A Work Sponsor is not a manager copied on the request. Sponsorship means knowingly authorizing the proposal to consume evaluation or discovery capacity and accepting responsibility for its priority claim and organizational tradeoffs.

That acceptance must be durable and tied to a specific proposal revision. The organization may capture it through an authenticated workflow action, a retained comment, correspondence, or another record allowed by policy. The tool is negotiable. The evidence is not.

A sponsor who is also the requester may satisfy both roles through the same authenticated submission when the record explicitly accepts the sponsor obligation. Merely putting a leader's name in a field proves nothing.

---

A front door makes unlike demand visible and prevents receiving teams from manufacturing sponsorship. It does not decide which eligible proposal should displace another. That is a portfolio judgment, and the current corpus only partly defines it.

<!-- Preview assembly source: Work-Intake-Is-an-Organizational-System.md: Thesis through What a Work Proposal Must Prove -->
