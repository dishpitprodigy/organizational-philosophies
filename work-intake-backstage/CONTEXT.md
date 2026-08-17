# Work Governance Context

This context describes how demand becomes proposed, authorized, executed, and
verified work. It separates the canonical governance record from the systems
used to review proposals and perform delivery.

## Intake and proposal language

**Demand**:
An observed reason to consider changing an operating condition. Demand is not
work, a commitment, or evidence that a particular implementation should begin.
_Avoid_: Request, ticket, requirement

**Assisted Intake**:
The route for demand whose proposer cannot yet supply the evidence required for
a reviewable proposal. Missing understanding causes assistance, not rejection.
_Avoid_: Failed submission, invalid proposal

**Work Proposal**:
A claim that a stated operating result should be authorized under explicit
constraints, evidence, dependencies, and decision authority. A Work Proposal
does not authorize delivery.
_Avoid_: Project, Epic, work item, request

**Proposal Lineage**:
The stable identity shared by every revision of the same Work Proposal.
_Avoid_: Ticket, latest revision

**Proposal Revision**:
An immutable historical version of a Work Proposal within one Proposal
Lineage. A saved modification creates a new revision; it does not rewrite an
earlier revision.
_Avoid_: Draft, edit, Jira version

**Reviewable Proposal**:
A Proposal Revision with enough evidence to enter an ordered decision route.
Incomplete evidence belongs in Assisted Intake rather than this state.
_Avoid_: Approved proposal, ready for delivery

## Decision and authority language

**Decision**:
An authenticated disposition of a specific Proposal Revision: approve, reject,
defer, withdraw, or request revision. A Decision does not rewrite the proposal
it evaluates.
_Avoid_: Status update, comment

**Authorization**:
The bounded permission to consume capacity in pursuit of an approved operating
result. Authorization identifies the Proposal Revision and Decision that
created it.
_Avoid_: Approval status, accepted ticket

**Authorized Work**:
The durable governance record created by an approval. It defines what result
was authorized, which constraints remain binding, and what evidence will close
the loop.
_Avoid_: Proposal, Epic, project plan

**Decision Authority**:
The person or governing body empowered to make a particular Decision.
Seniority alone does not imply authority over every decision.
_Avoid_: Stakeholder, reviewer

**Delegated Execution Authority**:
The bounded freedom granted to a delivery team to change its implementation
without changing the authorized result or its binding constraints.
_Avoid_: Ownership, unrestricted edit access

**Amendment**:
An explicit, attributable change to Authorized Work that exceeds Delegated
Execution Authority. An Amendment preserves the earlier authorization rather
than silently replacing it.
_Avoid_: Epic edit, correction

## Delivery and evidence language

**Deliverable**:
An independently accountable portion of Authorized Work assigned to a delivery
owner. A Deliverable may be represented by one or more external work items.
_Avoid_: Ticket, task, projection

**Execution Projection**:
A destination-specific representation of a Deliverable in the system used by
its delivery team. Its implementation details may evolve within Delegated
Execution Authority.
_Avoid_: Canonical work record, Proposal Revision

**Outcome Observation**:
Evidence about whether an authorized operating result became true and remained
true for its required horizon.
_Avoid_: Completion status, output

**Closure Decision**:
An authenticated judgment that Outcome Observations satisfy, fail, supersede,
or invalidate the conditions of Authorized Work.
_Avoid_: Done status, ticket closure

## Systems and representations

**Work Intake Record**:
The authoritative record of Proposal Lineages, Proposal Revisions, Decisions,
Authorizations, Deliverables, publications, and Outcome Observations.
_Avoid_: Jira ticket, Backstage entity

**Canonical Artifact**:
The exact structured representation of a Proposal Revision. Its identity is
independent of any human-readable rendering or external projection.
_Avoid_: PDF, Jira description

**Rendered Artifact**:
A human-readable representation derived from a Canonical Artifact. It does not
acquire authority by being downloaded, emailed, or attached elsewhere.
_Avoid_: Source record, editable proposal

**Publication**:
The attributable act of sending one Proposal Revision, Authorization, or
Deliverable to a configured destination. One revision may be published at most
once to a given destination profile unless an explicit repair operation is
performed.
_Avoid_: Save, synchronize

**Projection**:
A destination-specific record derived from an authoritative Work Intake Record.
A Projection may support workflow and collaboration, but it cannot silently
become authoritative for the source record.
_Avoid_: Copy, source of truth

**Publication Profile**:
A governed mapping from Work Intake Records to one or more configured
destinations, workflows, and audience-specific representations.
_Avoid_: Backend choice, arbitrary project key

**Publication Receipt**:
The retained evidence returned by a destination after publication, including
external identities, artifact hashes, and the result of each attempted action.
_Avoid_: Log message, ticket URL

**Projection Drift**:
A difference between a destination record and the publication that produced
it. Projection Drift does not modify the authoritative Work Intake Record.
_Avoid_: Proposal revision, synchronization

**Backstage Catalog**:
The authority for durable technical entities, their owners, and their declared
dependencies. It is not the authority for proposals, decisions, or delivery
history.
_Avoid_: Work portfolio, intake database

**System of Engagement**:
A system in which a particular audience reviews, discusses, or performs work,
such as Jira or a financial application. A System of Engagement may receive
Projections without becoming the authority for Work Intake Records.
_Avoid_: System of record
