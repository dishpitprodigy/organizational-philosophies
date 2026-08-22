# Work Governance Control Plane Specification

Status: Context and implementation direction

Applies to: `work-intake-backstage`, `work-intake-decision-tree`, and future
review clients and destination adapters

Primary initial technologies: Backstage, PostgreSQL, Jira Cloud, and Jira
Product Discovery

## Purpose

The current prototype produces Work Proposals and publishes them into external
systems. That opens a governance loop, but it does not yet own the durable
lineage connecting observed demand, proposal revisions, decisions,
authorization, delivery, and verified operating outcomes.

The next system boundary is a **Work Governance Control Plane**. It will own
that lineage without becoming a universal ticketing system. Backstage remains
the principal engineering interface; Jira, JPD, and later financial or service
management applications remain systems in which particular audiences review
or perform work.

The Work Intake Record is authoritative. External records are controlled
projections of it.

## Relationship to existing specifications

This specification supersedes the storage, proposal-authority, acceptance, and
artifact-repository decisions in
`WORK-PROPOSAL-PORTFOLIO-SPEC.md`. In particular:

- PostgreSQL, not Jira or a Git repository, is the authority for Proposal
  Lineages, Proposal Revisions, Decisions, Authorizations, and publications;
- Jira attachments and descriptions are projections, not durable source
  artifacts; and
- approval creates Authorized Work rather than changing a proposal into a
  delivery record.

`MULTI-DESTINATION-PUBLICATION-SPEC.md` remains authoritative for the
destination-neutral Publication Module, Publication Profiles, adapters,
catalog-derived routing, and normalized publication receipts. This
specification adds the durable records and lifecycle that invoke that module.

The domain language in `CONTEXT.md` governs all three documents. Where an older
document uses a term differently, `CONTEXT.md` takes precedence.

## Product boundary

The system controls the governance loop:

```text
Observe demand
    |
    v
Develop or assist intake
    |
    v
Freeze a reviewable Proposal Revision
    |
    v
Review and decide
    |
    v
Create Authorized Work
    |
    v
Publish team-specific Execution Projections
    |
    v
Observe delivery and operating outcomes
    |
    v
Close, amend, supersede, or withdraw
```

The system does not replace delivery planning, source control, CI/CD,
monitoring, financial accounting, or team ticketing. It records why work was
considered, what was authorized, where it was performed, what materially
changed, and whether the promised operating result became true.

## Authority boundaries

| Information                                              | Authority                            | External systems' role                        |
| -------------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| Demand and intake progress                               | Work Intake Record                   | Optional notification or review projection    |
| Proposal content and revision lineage                    | Work Intake Record                   | Frozen artifact and workflow envelope         |
| Decisions and authorization                              | Work Intake Record                   | Decision interface or evidence projection     |
| Technical entities, ownership, and declared dependencies | Backstage Catalog                    | Referenced context                            |
| Deliverable lineage and governing authorization          | Work Intake Record                   | Linked execution records                      |
| Team implementation plan                                 | Delivery team's system of engagement | Operational authority within delegated bounds |
| Operational telemetry                                    | Producing operational system         | Referenced or ingested observation            |
| Outcome judgment                                         | Authenticated Closure Decision       | Status and evidence projection                |
| Financial facts                                          | Applicable financial system          | Referenced evidence for governance decisions  |

Backstage is a client of the Work Intake service. It is not the service's
ontological boundary. A later Finance review page or application integration
must use the same API and authority model without requiring Finance users to
enter Backstage.

Jira and Jira Product Discovery are reference destinations, not required
infrastructure. The portable artifact is this control-plane specification and
its domain contract. An adopter may implement adapters for ServiceNow, RT,
Remedy, Zendesk, or another system with an adequate API. The control plane does
not provision every destination or erase its administrative boundaries; the
adopter maps these authority and evidence requirements into the destination's
records, permissions, and workflows.

## Required invariants

1. A Proposal Lineage has a stable identity independent of Jira keys and other
   external records.
2. A saved modification to an existing proposal creates a Proposal Revision;
   no prior revision is overwritten.
3. A Decision evaluates exactly one Proposal Revision.
4. Approval creates Authorized Work; it does not convert or mutate the Proposal
   Revision.
5. One Proposal Revision may be published at most once through a given
   Publication Profile.
6. Publication idempotency is enforced by the database, not by browser state or
   a disabled button.
7. A retry may complete or repair the same publication operation, but it may not
   create a second logical publication.
8. Edits, comments, attachments, transitions, and administrator actions in an
   external system cannot silently revise a proposal or authorization.
9. Execution detail may change within Delegated Execution Authority. A change
   to the authorized result or binding constraints requires an Amendment or a
   new authorization decision.
10. Closure requires Outcome Observations and an authenticated Closure Decision;
    completion of external execution records is insufficient by itself.
11. Every projection remains traceable to the exact authoritative record and
    content hash that produced it.
12. Incomplete understanding routes to Assisted Intake. Structurally invalid or
    contradictory input is rejected for correction.

## Lifecycle model

### Demand and assisted intake

A person may record demand without knowing how to complete every proposal
field. Missing evidence returns the partially completed record and its
missing-evidence inventory to Assisted Intake. The system must not require a
requester to anticipate that assistance will be necessary before beginning the
form.

Assistance may add evidence, identify owners, resolve catalog context, or
determine that no proposal should proceed. Every saved change remains in the
Proposal Lineage.

### Proposal revision

Each saved modification after the initial record creates the next revision by
the application's ordinary persistence mechanism. Revision creation is not a
special ceremony used only before publication.

A revision becomes reviewable only when required evidence is present and valid.
Publication freezes the exact Canonical Artifact and rendered representation
used for review. Later edits create another revision.

Every quantitative or time-bound required result includes a Feasibility Basis:
the assessed target, applicable hard limits and irreducible steps, supporting
evidence, assumptions, operating margin, and Feasibility Assessment finding. A
Proposal Revision may contain several Feasibility Bases; stable coverage
identifiers connect each mandatory Requirement and Acceptance Condition to at
least one basis. The Feasibility Assessment verifies that each quantitative or
time-bound result has been named and that the cited basis actually assesses it;
the schema cannot infer physical completeness from free-form prose. A delivery
target whose finding is unproven routes to Assisted Intake or bounded
Discovery. A target contradicted by a physical, hardware, protocol, or
procedural limit is rejected for correction. Approval cannot make such a target
achievable.

### Publication control

The backend attempts an atomic database claim before performing external work:

```text
unique (source_kind, source_id, source_revision, publication_profile_id)
```

If the claim already represents a completed publication, the service returns
the existing Publication Receipt and reports that a new revision is required
for changed content. The browser may disable the Publish action after success,
but the database constraint is authoritative.

Partial external failure remains retryable under the Publication Module's
idempotency rules. A **repair projection** operation may restore missing output
for the same publication; it does not create another publication or revision.

### Review and decision

A proposal projection is a workflow envelope for a frozen revision. A
projection-only destination may display the proposal, collect discussion, and
link users back to an authenticated decision interface. Its local status is not
a Decision.

An interactive-review destination may initiate Decision commands only when its
adapter can preserve the actor's identity, validate that actor's Decision
Authority through the Work Intake service, and handle duplicate commands
safely. The destination should grant ordinary reviewers only the minimum
operations required for review:

- browse the proposal;
- comment;
- perform role-authorized workflow transitions; and
- supply only the fields exposed by those transition screens.

The publication service identity creates records and attaches generated
artifacts. Attachment creation, attachment deletion, and general editing of the
governance envelope are withheld from ordinary reviewers wherever the
destination supports those controls. A destination that cannot enforce them
remains projection-only. Administrative exceptions are audited; they do not
change the Work Intake Record.

Every disposition records the actor, authority basis, timestamp, rationale,
and Proposal Revision. Rejection leaves the rejected revision intact. A later
revision may re-enter review and may receive a new external projection.

A Decision command must enter the Work Intake service before it becomes
authoritative. Initially, reviewers decide in the Backstage queue or a narrow
review client, and the resulting state is projected into external systems. A
future external transition may initiate the same command only through an
interactive-review adapter satisfying the preceding requirements. An external
status change by itself is never a Decision.

### Authorization and execution

Approval creates an Authorized Work record containing:

- the governing Proposal Revision and Decision;
- the authorized operating result;
- binding scope and preserved constraints;
- required outcome evidence and operating horizon;
- applicable decision and delivery authority; and
- candidate Deliverables and affected Catalog entities.

The control plane then publishes team-specific Execution Projections. Each team
may use its own system, project or queue, workflow, screens, and fields. A shared
semantic intake model does not require a company-wide ticketing project or a
universal delivery form.

The Work Intake Record stores the authoritative relationship between Authorized
Work and every Deliverable. External parentage, links, and comments may expose
that relationship for users but do not define it.

Execution Projections should separate locked governance context from team-owned
planning information:

```text
Governance context
  source authorization
  authorized result
  binding constraints
  required outcome evidence

Team execution
  implementation approach
  decomposition
  estimates
  technical checks
  discovered dependencies
```

Teams may change the execution section. A proposed change to governance context
must return to the control plane as an Amendment or new proposal decision.
Adapters must map those sections to separately controlled fields, artifacts, or
workflow actions; they must not place requester-owned language into a generally
editable description and call it protected.

### Outcome and closure

Closing execution tickets does not close Authorized Work. The control plane
retains Outcome Observations from delivery teams, operational systems, decision
owners, or designated verifiers. A Closure Decision records whether the
authorized outcome was:

- verified;
- missed;
- superseded by another authorization;
- abandoned or withdrawn; or
- impossible to determine from retained evidence.

This separation preserves the difference between producing outputs and changing
an operating condition.

## Canonical and rendered artifacts

PostgreSQL stores the Canonical Artifact as JSONB together with its SHA-256
hash, schema version, and generator provenance. Stable identity, lifecycle,
authority, and query fields remain relational columns.

A PDF is a human-readable rendering, not the source record. The renderer stores
its own SHA-256 hash and generator version. A downloaded or emailed PDF may be
edited, but a modified file cannot authenticate as the published rendering
because its hash no longer matches the Work Intake Record.

The initial Jira reference projection contains:

```text
Summary: [WP-2026-0043 rev 12] Migrate workforce authentication
Source revision: WP-2026-0043 rev 12
Canonical artifact hash: <sha256>
Rendered artifact hash: <sha256>
Canonical record: <authenticated URL>
Attachments:
  WP-2026-0043-rev-12.pdf
  WP-2026-0043-rev-12.json
```

The PDF supports meetings and email distribution. The JSON preserves exact
machine-readable evidence. Neither attachment acquires authority merely because
it is easier to circulate.

## Persistence model

The first PostgreSQL model should contain these responsibilities. Exact names
may change during implementation, but the boundaries and constraints may not.

### Proposal records

```text
proposal
  id
  created_by
  created_at

proposal_revision
  proposal_id
  revision
  artifact_json
  artifact_sha256
  schema_version
  changed_by
  changed_at
  change_reason
```

Primary constraint: `(proposal_id, revision)` is unique and immutable.

### Governance records

```text
decision
  id
  proposal_id
  proposal_revision
  disposition
  authority
  actor
  rationale
  decided_at

authorized_work
  id
  source_decision_id
  authorization_json
  authorized_at
  lifecycle_state

deliverable
  id
  authorized_work_id
  owner_ref
  affected_entity_refs
  delegated_bounds

outcome_observation
  id
  authorized_work_id
  evidence_type
  evidence_ref_or_value
  observed_by
  observed_at

closure_decision
  id
  authorized_work_id
  disposition
  actor
  rationale
  decided_at
```

### Publication records

```text
publication
  id
  source_kind
  source_id
  source_revision
  publication_profile_id
  source_sha256
  state
  created_at
  completed_at

publication_result
  publication_id
  placement_id
  external_id
  external_key
  external_url
  artifact_ids
  published_sha256
  action
  state
```

The publication uniqueness constraint is
`(source_kind, source_id, source_revision, publication_profile_id)`.

The model may use an outbox table when external publication moves out of the
request transaction. It does not require Kafka, a dedicated event store, or a
separate event manager for the first implementation.

## Projection integrity

Continuous external-system reconciliation is not an initial requirement.
Canonical integrity lives in PostgreSQL; destinations receive frozen, hashed
artifacts and an appropriately controlled projection envelope.

The first implementation must store all external identities and artifact IDs
returned during publication. It should provide an explicit **Verify
Publication** operation that confirms the external record and expected
artifacts still exist. Verification records observed state; it never changes
publication eligibility or canonical content.

Webhook-triggered reconciliation and a scheduled anti-entropy scan may be added
after production evidence demonstrates the need. If added, only active
publications are scheduled, terminal records are retired after a final check,
and destination notifications enter a deduplicated inbox before verification.
A webhook must never update the fields used to decide whether a revision may be
published.

## Interfaces

### Engineering intake

The Backstage client supports demand capture, Assisted Intake, proposal editing,
revision history, publication, decision status, and links to execution work.
It enriches proposals with Catalog-owned systems, components, resources,
owners, and dependencies.

### Non-engineering review

The Work Intake API must permit a narrow authenticated review interface outside
Backstage. The first such interface may provide a rendered proposal, comments,
evidence requests, and authorized decision actions. It must not require Finance
or another business function to adopt Backstage merely to participate in a
decision.

Future adapters may project records into financial or service-management
systems after an actual destination, schema, and authority model are known.
The canonical model must not guess that NetSuite, Salesforce, or another named
product is universally authoritative for Finance.

### Delivery systems

Publication Profiles map Deliverables into the projects and record types used
by their owners. Different teams may have different data requirements and
workflows. Adapters preserve the common authorization lineage while translating
only the delivery information relevant to that destination.

### Destination adapter contract

Every publication adapter must:

- create or locate a projection through a stable publication identity;
- preserve the canonical record identity, revision, and content hash;
- return the destination identities needed for exact receipt replay and later
  verification;
- make retries idempotent and distinguish repair from a new publication;
- translate only the information owned by that destination; and
- prevent destination state from becoming canonical merely because users can
  edit it there.

An execution adapter must also preserve the relationship between a Deliverable
and its governing Authorized Work while leaving implementation planning within
the delivery team's Delegated Execution Authority.

An interactive-review adapter must preserve authenticated actor identity, send
Decision commands through the Work Intake service, enforce the service's
authority result, and deduplicate repeated commands. An adapter that cannot do
so is still usable as a projection-only destination; it cannot turn a local
status or approval into an authoritative Decision.

This specification defines those obligations. It does not require the prototype
to install a destination's users, roles, permission schemes, workflows, or
other site policy. Reference-adapter documentation must state which obligations
the adapter implements, which depend on local configuration, and which are not
supported.

## Security and audit requirements

- Every write is attributable to an authenticated actor or service identity.
- Authorization checks occur in the Work Intake service, even when an action is
  initiated from an external workflow.
- Credentials and arbitrary destination identifiers never enter browser-owned
  proposal artifacts.
- Canonical and rendered hashes are computed server-side.
- Proposal, Decision, Authorization, and Closure records are append-only once
  committed; corrections create new attributable records.
- Publication and decision commands are idempotent under stable command
  identities.
- Administrative changes in external systems cannot silently modify canonical
  records.

## Initial implementation stages

### Stage 1: Durable proposal lineage

- Add PostgreSQL persistence for Proposal Lineages and immutable Proposal
  Revisions.
- Move publication eligibility and revision reuse enforcement from the local
  ledger into database constraints.
- Preserve canonical JSON and hashes beyond browser sessions and temporary
  files.
- Route incomplete evidence to Assisted Intake.

### Stage 2: Frozen review projections

- Render deterministic PDF and JSON artifacts for a Proposal Revision.
- Publish a restricted Jira/JPD review envelope through the existing
  Publication Module.
- Store complete Publication Receipts and external attachment identities.
- Add manual publication verification.

### Stage 3: Decisions and authorization

- Persist authenticated proposal Decisions.
- Create Authorized Work from approvals without mutating the source proposal.
- Preserve rejection, deferral, withdrawal, and revision-request histories.

### Stage 4: Delivery projections

- Model Deliverables and their relationship to Authorized Work.
- Publish team-specific Jira Epics or equivalent records through configured
  profiles.
- Separate locked governance context from team-owned execution planning.
- Route changes outside Delegated Execution Authority into an Amendment flow.

### Stage 5: Outcome closure

- Capture Outcome Observations and evidence references.
- Require an authenticated Closure Decision independent of delivery-ticket
  completion.
- Expose the lineage from demand through verified, missed, superseded, or
  abandoned outcomes.

Advanced engineering analytics are deliberately absent from these stages. The
system must first produce trustworthy longitudinal observations without
creating scores that people can optimize in place of outcomes.

## Non-goals for the initial control plane

The initial implementation will not:

- replace another team's delivery system;
- impose one external project, queue, workflow, or form on every delivery
  domain;
- synchronize arbitrary external-system edits back into canonical records;
- allow reviewers to replace proposal artifacts in a projection destination;
- build continuous projection reconciliation before operational evidence
  justifies it;
- require Kafka, MongoDB, a dedicated event store, or microservices;
- infer Finance's system of record before integrating a real financial process;
- automatically score teams, meetings, proposals, difficulty, or impact;
- treat a PDF as canonical merely because it is portable; or
- declare Authorized Work complete because its execution tickets are closed.

## Definition of done for the first closed loop

The first credible closed loop is complete when:

1. PostgreSQL retains a Proposal Lineage and every saved Proposal Revision.
2. A reviewable revision publishes once per profile and returns the same receipt
   on an idempotent retry.
3. A configured reference destination presents exact, hashed human-readable and
   canonical artifacts and declares either projection-only or
   interactive-review mode. A projection-only destination leaves Decision
   actions in an authenticated Work Intake client; an interactive-review
   destination passes an acceptance test proving that an unauthorized actor
   cannot issue a Decision command. The current reference implementation uses
   Jira, PDF, and JSON in projection-only mode.
4. An authenticated approval creates Authorized Work linked to the exact
   Proposal Revision and Decision.
5. Authorized Work creates one or more team-specific Execution Projections.
6. The control plane retains authoritative links to every external execution
   record even if destination-local links are later rearranged.
7. Teams may change implementation detail without rewriting governance context.
8. A change outside delegated bounds requires an attributable Amendment or new
   authorization.
9. Outcome Observations can be recorded against Authorized Work.
10. An authenticated Closure Decision records whether the operating result was
    verified, missed, superseded, abandoned, or indeterminate.

At that point the application controls the work-governance loop without
pretending to control every action used to deliver the work.
