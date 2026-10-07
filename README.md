# Work Governance Control Plane

**Preserve the reason for technical work from the first observed problem to the evidence that the work produced its intended result.**

Organizations often know which tickets are open, in progress, or complete. They
have a harder time reconstructing why the work was needed, what evidence
supported the investment, who authorized it, which constraints governed delivery,
and whether the finished work actually improved the condition that justified it.

This repository develops a Work Governance Control Plane: an application that
keeps that chain intact across the systems people use to propose, review, and
deliver work. It also contains the organizational frameworks that explain the
model and its application.

**Current status:** a working prototype for guided intake, durable proposal
history, and controlled publication to Jira and Jira Product Discovery. The
complete lifecycle for decisions, authorization, delivery, and verified outcomes
is specified but is not yet available as an end-to-end application.

## The problem

Demand arrives through conversations, incidents, requests, and strategic plans.
Evidence and decisions accumulate in documents and meetings. Delivery is split
across team backlogs. Tickets close when their assigned outputs are finished.
Across those handoffs, the organization can lose the connection between the
original problem, the commitment it made, and the result it obtained.

For example, an organization authorizes an authentication migration to reduce
access-related interruptions while preserving specific security requirements.
Several teams complete their migration tickets. That proves delivery activity
finished. It does not establish whether interruptions decreased, the security
requirements were preserved, or the improvement lasted long enough to count as
success. Those judgments require retained evidence and someone with authority
to evaluate it.

The missing record makes it difficult to:

- distinguish observed demand from a justified proposal or an authorized commitment;
- identify exactly which evidence and proposal revision a decision evaluated;
- let teams adapt their implementation while preserving the agreed result and constraints;
- reconstruct responsibility when scope, ownership, or delivery systems change; and
- compare the outcome with the reason resources were committed in the first place.

The control plane supplies that record. Its purpose is to make investment and
outcome decisions traceable, including decisions to revise, defer, or stop work.

## How it works

The model separates the stages that a ticket status often compresses together:

| Stage | What it establishes |
| --- | --- |
| Demand | An observed reason to investigate a change. |
| Proposal Revision | An immutable argument for a stated result, supported by evidence and explicit constraints. |
| Decision | An attributable judgment of that exact revision by an authorized person or body. |
| Authorized Work | Permission to consume capacity toward the approved result, with binding constraints and required outcome evidence. |
| Deliverables | Accountable portions of the work, represented in each team's delivery system. |
| Outcome and closure | Evidence about what became true, followed by an explicit judgment of whether the authorized result was achieved. |

Incomplete evidence goes to **Assisted Intake**, where someone can help develop
the proposal. Saving a modification creates another revision. Approval creates
a separate Authorized Work record; it does not overwrite the proposal that was
reviewed. Changes beyond a team's delegated authority require an attributable
amendment or another authorization.

Closing delivery tickets and closing Authorized Work are separate actions.
The intended loop ends with an evidence-based decision: the result was verified,
missed, superseded, abandoned, or could not be determined.

## What works today

The current implementation provides the first part of that loop:

- **Guided intake.** A versioned decision-tree form captures demand and develops
  a Work Proposal. Incomplete evidence can be saved with an inventory of what
  is missing and routed to Assisted Intake.
- **Durable proposal history.** PostgreSQL retains stable proposal identities,
  immutable revisions, canonical JSON, server-computed hashes, and authenticated
  attribution. The service enforces owner-scoped reads and writes.
- **Ownership and dependency context.** The backend resolves technical owners,
  dependencies, ordered reviews, and destination routing from the Backstage
  Catalog rather than trusting browser-supplied routing claims.
- **Controlled publication.** Server-defined profiles publish proposal and
  review representations through Jira and Jira Product Discovery adapters.
  The browser selects an allowed profile; credentials stay on the backend.
- **Safe retries and retained receipts.** Database constraints and publication
  journals prevent duplicate logical publication, retain external record and
  attachment identities, and support reconciliation after partial failure.
  Completed retries return the stored receipt. An uncertain external creation
  stops automatic recreation rather than risking a duplicate.

Publication includes safeguards for candidate delivery records, but that does
not mean the application already provides authenticated decision-making and the
full Authorized Work lifecycle. The persistence schema anticipates later
stages; schema support is not the same as a complete workflow.

The demo uses the fictional **Northstar Research Network**, with example teams,
systems, dependencies, and proposals. It is a development prototype rather than
a packaged production installation. A real deployment needs its own identity,
catalog, destination configuration, and permission policies.

https://github.com/user-attachments/assets/a06a9468-e56b-459c-b4af-1ad6f95e8e68

## Architecture and authority

The current application uses a JavaScript/TypeScript browser client, an HTTP
service hosted by Backstage, and a dedicated PostgreSQL database. Backstage is
the engineering interface and source of technical catalog context. The core
model is independent of that application host.

| Information | Authoritative source |
| --- | --- |
| Proposal history and publication records; future decisions and authorizations | Work Intake service and PostgreSQL |
| Technical entities, owners, and declared dependencies | Backstage Catalog |
| Team implementation planning within delegated bounds | The team's delivery system |
| Operational and financial facts | The systems that produce those facts |
| Judgment of whether the authorized result was achieved | An authenticated Closure Decision in the control plane, once implemented |

An external **projection** is a destination-specific representation of an
authoritative record. Jira and Jira Product Discovery receive projections;
editing an issue or changing its status does not silently revise the proposal
or create an authoritative decision.

The Publication Module owns validation, routing, authority checks, publication
identity, and retry policy. Adapters translate records into a destination's
fields, relationships, and API operations. A Publication Profile can place a
proposal in Jira Product Discovery while keeping review and delivery records in
Jira. Adding a destination requires an adapter and explicit mappings, rather
than another intake form or a second set of governance rules.

A standalone host could serve the browser client through nginx and run the
same service against PostgreSQL. That would require replacing Backstage's
hosting, authentication, configuration, and catalog integration. nginx alone
would not replace the application service.

## What comes next

The [Work Governance Control Plane specification](work-intake-backstage/WORK-GOVERNANCE-CONTROL-PLANE-SPEC.md)
defines the remaining lifecycle. The main implementation boundaries are:

| Next capability | Why it matters |
| --- | --- |
| Frozen human-readable review artifacts and explicit publication verification | Reviewers can inspect the exact revision, and the service can verify that expected external records and artifacts remain present. |
| Authenticated Decisions and separate Authorized Work records | Approval, rejection, deferral, and revision requests become attributable judgments of specific evidence. |
| Team-specific delivery projections and amendment handling | Teams retain their own planning practices while changes to the authorized result remain explicit. |
| Outcome Observations and Closure Decisions | Completion is evaluated against the promised operating result and its required observation period. |
| A narrow review client outside Backstage | Finance and other business functions can review evidence and exercise their authority without adopting an engineering portal. |

Further expansion should preserve several boundaries:

- **Integrate with real destination requirements.** ServiceNow, RT, Remedy,
  Zendesk, or financial applications could receive projections, but those
  adapters are not implemented here. Each integration must establish the actual
  schema, identity, permissions, and authority model it needs.
- **Keep external approval honest.** A destination may initiate authoritative
  decisions only if its adapter preserves actor identity, validates authority
  through the service, and safely handles repeated commands. Otherwise it
  remains a review projection with decisions taken in an authenticated client.
- **Add reconciliation when operations justify it.** Manual verification is the
  initial direction. Webhooks and scheduled checks may follow demonstrated
  need; external edits must not rewrite canonical history.
- **Build trustworthy observations before analytics.** Longitudinal evidence
  could support broader investment analysis. The initial stages deliberately
  avoid automatic team scores and activity metrics that substitute for outcomes.

The system leaves source control, CI/CD, monitoring, financial accounting, and
team delivery planning in their existing systems. Teams can use different
projects, queues, and workflows while sharing an explicit authorization and
outcome record.

## Try the prototype

With Node.js 22 or 24, Podman, and Compose support installed:

```sh
cd work-intake-backstage
podman compose up -d postgres
./yarn install
./yarn start
```

Open <http://localhost:3000>, enter through the development guest login, and
select **Work Intake**. The **Metrics selection** scenario provides a complete
proposal example. Use **Save** to record a revision; external publication
requires a separately configured Jira sandbox.

See the [implementation README](work-intake-backstage/README.md) for credentials,
publication profiles, sandbox setup, HTTPS deployment, and verification commands.

## Read the design

- [Work Governance Control Plane specification](work-intake-backstage/WORK-GOVERNANCE-CONTROL-PLANE-SPEC.md): the authoritative lifecycle, persistence boundaries, security rules, and staged implementation direction.
- [Multi-Destination Publication specification](work-intake-backstage/MULTI-DESTINATION-PUBLICATION-SPEC.md): publication profiles, adapter contracts, routing, receipts, and failure handling.
- [Work Governance Context](work-intake-backstage/CONTEXT.md): the shared meaning of demand, proposals, decisions, authorization, delivery, and closure.
- [How the prototype works](work-intake-backstage/HOW-IT-WORKS.md): runtime components, trust boundaries, and publication behavior.
- [Standalone decision-tree prototype](work-intake-decision-tree/): the intake form and browser interaction model outside the Backstage shell.

## Organizational frameworks

The writing in this repository develops the operating practices behind the
application: framing problems before selecting solutions, evaluating evidence,
assigning authority, developing people, and carrying decisions through to
observed results.

- [The Open-Loop Enterprise](The-Open-Loop-Enterprise.md)
- [Work Intake Is an Organizational System](Work-Intake-Is-an-Organizational-System.md)
- [Framing Technical Work Before Design](Framing-Technical-Work-Before-Design.md)
- [Writing Work Items: Epics, Stories, and Tasks](Writing%20Work%20Items%20-%20Epics,%20Stories,%20and%20Tasks.md)
- [RFPs and Vendor Selection as Evidence Systems](RFPs-and-Vendor-Selection-as-Evidence-Systems.md)
- [Talent Development Architecture](Talent-Development-Architecture.md)
- [Managed Runoff for Deprecated Services](Managed-Runoff-for-Deprecated-Services.md)