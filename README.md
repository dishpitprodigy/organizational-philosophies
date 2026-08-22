# Most Organizations Never Close the Loop on Technical Work

They can report which technical work is open, in progress, or complete. They
cannot reliably reconstruct why that work exists, which evidence supported it,
who authorized the commitment, what changed during delivery, or whether the
finished work produced the operating result that justified its cost.

That is an open governance loop. Demand enters through one system, decisions
occur in meetings and documents, delivery is divided among team backlogs, and
tickets close when their assigned output is finished. Each local workflow may
function exactly as designed while the organization loses the chain connecting
an observed problem to an authorized result. It can therefore complete every
ticket without proving that it solved the problem.

This repository develops the missing system: an authoritative record that
preserves that chain through demand, evidence, decisions, authorization,
delivery, observed outcomes, and explicit closure. The executable prototype and
the related writing are concerned with the same question at different scales:
how an organization carries the reason for technical work all the way through
the work, then compares the result with the reason the work began.

https://github.com/user-attachments/assets/a06a9468-e56b-459c-b4af-1ad6f95e8e68

## Work Governance Control Plane

The executable prototype in this repository is a Work Governance Control Plane.
It differs from another intake form, approval workflow, or project tracker
because it does not optimize one segment of the path and call that segment the
system. It owns the governance record that must remain stable while Jira
projects, review interfaces, organizational structures, and delivery practices
change around it. Those systems may support individual steps; none may silently
replace the evidence, authority, or intended outcome that caused the work to
exist.

The heart of this tool is a small JavaScript/TypeScript application with a
PostgreSQL backend. Hypothetically, it could run on any web server and be
extended to use another tool as the backend for ownership and dependency
mapping.

This is a working prototype, not a packaged product or an installer for a
particular ticketing system. Jira and Jira Product Discovery are reference
destinations because they make the publication boundary concrete. The same
governance model may project into ServiceNow, RT, Remedy, Zendesk, or another
system with an adequate API. An adopter is responsible for implementing that
adapter and mapping the specification's authority rules into the destination's
permissions, workflows, and record types.

The `work-intake-backstage` directory describes one application host
implementation. Backstage provides a useful engineering interface,
authentication and service infrastructure, and access to catalog-owned facts
about systems, owners, and dependencies. The Work Intake Record remains
authoritative for proposals, revisions, publication history, and the governance
lineage built from them. Jira and Jira Product Discovery receive controlled
projections; neither Backstage entities nor Jira issues become the canonical
work record.

### The loop most organizations leave open

```text
Observe demand
    |
    v
Develop a proposal or route incomplete evidence to Assisted Intake
    |
    v
Freeze an immutable, reviewable Proposal Revision
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

The final step is not administrative cleanup. The loop closes only when observed
delivery and operating evidence is compared with the authorized result and an
accountable authority decides what that evidence means. Closing a delivery
ticket proves that somebody produced an output; it does not prove that the
output changed the condition that justified the work. If the result did not
become true, the record must show whether the work will continue, change, be
replaced, or stop.

Controlling the complete loop also preserves distinctions that ticket-driven
intake commonly collapses:

- Demand is a reason to investigate, not pre-authorized work.
- A Work Proposal argues for an operating result. It does not authorize
  delivery.
- Approval is the authorization gate to delivery. It creates a separate
  Authorized Work record rather than changing a status field on the proposal.
- Delivery tickets may close without proving that the authorized operating
  result became true.
- External systems support review and execution, but their local workflows
  cannot silently rewrite the evidence or authority that caused the work to
  exist.

### What the current implementation does

The implemented first stage provides:

- guided demand capture and a versioned Work Proposal form;
- explicit Assisted Intake routing when required evidence is incomplete;
- stable Proposal Lineages with immutable Proposal Revisions;
- canonical JSON artifacts, server-computed hashes, and authenticated
  attribution stored in PostgreSQL;
- owner-scoped reads and writes enforced by the Work Intake service;
- destination-neutral publication profiles with deterministic Jira and Jira
  Product Discovery projections;
- database-enforced publication identity, retry fencing, repairable partial
  failure, and exact receipt replay; and
- retained external issue identities, human-readable keys, attachment IDs, and
  publication results.

The broader model also defines Decisions, Authorized Work, Deliverables,
Outcome Observations, Closure Decisions, and Amendments. Their persistence model
exists as the next control-plane boundary; the complete user-facing lifecycle
is still being implemented. The repository therefore distinguishes what the
current prototype proves from what the full governance loop requires.

### Architecture: Backstage is one shell

The application follows an ordinary three-tier shape even though the current
code is packaged as a Backstage frontend and backend plugin:

| Layer                            | Current implementation                                       | Responsibility                                                                                              |
| -------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Presentation                     | Decision-tree client embedded in Backstage                   | Capture evidence, show routing, save revisions, and request publication                                     |
| Application                      | Work Intake HTTP service hosted by the Backstage backend     | Validate commands, enforce authority and lifecycle invariants, resolve context, and coordinate publication  |
| Persistence                      | Dedicated PostgreSQL 18 database                             | Retain canonical records, immutable history, idempotency claims, leases, receipts, and reconciliation state |
| External context and projections | Backstage Catalog, Jira, and Jira Product Discovery adapters | Supply technical ownership context or receive audience-specific representations                             |

A standalone deployment could serve the browser client through nginx, route
`/api` to a conventional application process, and keep the same PostgreSQL
authority. That application process is still necessary: nginx can terminate
TLS and route traffic, but it cannot enforce proposal revision semantics,
authorization, publication idempotency, or projection repair. Removing the
Backstage runtime would require host adapters for authentication, configuration,
technical-entity context, and HTTP startup. It would not require a different
domain model or database authority.

Backstage can also remain exactly where it is: an engineering-facing client and
catalog integration for the same service. A later Finance review page, service
management adapter, or narrow approval application should enter through the
same API and authority rules without requiring those users to adopt Backstage.

### Repository map

- [Work Governance Context](work-intake-backstage/CONTEXT.md) defines the domain
  language and the boundaries among demand, proposals, decisions,
  authorization, delivery, outcomes, and projections.
- [Work Governance Control Plane Specification](work-intake-backstage/WORK-GOVERNANCE-CONTROL-PLANE-SPEC.md)
  defines the authoritative lifecycle, persistence model, destination-adapter
  contract, invariants, security boundary, and implementation stages.
- [Backstage-hosted implementation](work-intake-backstage/) contains the current
  client, HTTP service, PostgreSQL persistence, publication module, Catalog
  integration, Jira adapters, deployment configuration, and tests.
- [Standalone decision-tree prototype](work-intake-decision-tree/) exposes the
  intake model without the Backstage shell and remains the source for the
  versioned form and browser interaction model.
- [How the current implementation works](work-intake-backstage/HOW-IT-WORKS.md)
  explains the runtime components, trust boundaries, and publication path.

The implementation uses fictional Northstar Research Network data. It models a
large technical portfolio without reproducing a proprietary organizational
system or treating the example company as part of the product model.

## Related writing

- [Work Intake Is an Organizational System](Work-Intake-Is-an-Organizational-System.md)
- [Framing Technical Work Before Design](Framing-Technical-Work-Before-Design.md)
- [Writing Work Items: Epics, Stories, and Tasks](Writing%20Work%20Items%20-%20Epics,%20Stories,%20and%20Tasks.md)
- [RFPs and Vendor Selection as Evidence Systems](RFPs-and-Vendor-Selection-as-Evidence-Systems.md)
