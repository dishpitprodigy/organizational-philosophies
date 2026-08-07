# Work Proposal Repository and Portfolio Explorer Specification

Status: Draft for implementation

Applies to: `work-intake-decision-tree` and `work-intake-backstage`
Primary implementation target: Backstage with Jira Cloud

## Executive summary

The Work Intake form must produce a durable, versioned Work Proposal before it
produces review or delivery work. The complete proposal rationale must remain
retrievable and queryable after the browser session, temporary publication file,
and people involved in the original decision are gone.

Jira will hold a structured **Work Proposal Index Record** in the `NWI` project.
That record will retain the complete human-readable proposal, an exact JSON
attachment for the reviewable revision, queryable portfolio metadata, a content
hash, and links to every Jira projection derived from it. Once a proposal is
accepted, its Markdown and JSON enter the version-controlled **Final Artifact
Repository**. The Jira record then points to that accepted revision and remains a
searchable derivative rather than becoming the authority.

Delivery records in NetEng, SysEng, SRE, DCOps, Platform, and other team projects
are deliberately smaller **Delivery Projections**. They contain what that team
needs to deliver and a stable link back to the governing proposal revision. They
do not repeat the full rationale and are not children of the intake record.

Backstage will add a Registry-style **Portfolio Explorer**. The explorer presents
expandable trees by proposal, system, team, lifecycle state, and tag while reading
typed relationships from an underlying graph. The same record may appear in
several branches, but every appearance resolves to the same stable identity.

The implementation must not require Jira Premium hierarchy levels. Jira parentage
will represent local decomposition only. Cross-project provenance, dependency,
and impact will use typed links.

## Problem

The current prototype does four things correctly:

1. the form emits a versioned Work Proposal artifact;
2. Backstage resolves ownership, dependencies, reviews, and Jira routing from the
   catalog rather than trusting requester claims;
3. the publisher refuses delivery without explicit authority and capacity; and
4. publication labels and the local ledger make repeated Jira publication
   idempotent.

It does not yet create organizational memory:

- the backend writes the browser artifact to a temporary file and deletes it;
- the Work Proposal is flattened into one Jira description;
- the local ledger retains publication fingerprints and Jira keys, not the source
  artifact;
- delivery records use a generic `Relates` link to the proposal;
- the form questions remain embedded in application code; and
- Backstage has no portfolio view across proposal, catalog, and Jira relations.

The result is durable work tracking without a durable, navigable evidence system.

## Required outcome

After implementation, a user must be able to:

1. select the applicable form defined by versioned JSON or YAML;
2. complete a guided intake whose answers compile into a validated Work Proposal;
3. publish a Reviewable Work Proposal without losing its exact source artifact;
4. find that proposal by identity, affected system, responsible team, lifecycle
   state, decision impact, time, or curated tag;
5. expand its reviews, delivery projections, dependencies, and related catalog
   entities in Backstage;
6. open any Delivery Projection and reach the exact governing proposal revision;
7. accept a proposal into the Final Artifact Repository without overwriting the
   reviewable history; and
8. use a later intake to retrieve earlier evidence without relying on a person's
   memory of the earlier project.

## Non-goals

This implementation will not:

- make Jira the authority for accepted Work Proposal artifacts;
- make Jira parent-child hierarchy represent provenance or arbitrary dependency;
- require Initiative-above-Epic hierarchy or a Jira Premium plan;
- create an ADR during intake, review, selection, or publication;
- treat a Reviewable Work Proposal as delivery authorization;
- infer authority, ownership, dependency closure, or project routing from prose;
- introduce Elasticsearch, MongoDB, or PostgreSQL for the first explorer version;
- allow an LLM to create authoritative tags or relationships;
- ingest arbitrary historical Jira records by inventing missing structure; or
- turn Backstage into a real-time event manager in this phase.

## Domain language

### Work Proposal

The domain artifact produced by guided intake. Its identity is the pair
`proposal.id` and `proposal.revision`. Content changes require a new revision.

### Reviewable Work Proposal

A Work Proposal revision ready for ordered review. Its exact JSON and rendered
rationale are durable in Jira, but it is not yet the accepted final artifact and
does not authorize delivery.

### Work Proposal Index Record

The queryable Jira record in `NWI`. It carries proposal identity, revision,
lifecycle, classifications, affected entities, artifact integrity information,
and the human-readable proposal. It links to the exact JSON used to produce it.

### Final Artifact Repository

The version-controlled canonical home for an accepted Work Proposal revision.
Acceptance writes both Markdown and canonical JSON. Jira records, attachments,
rendered pages, and delivery records remain traceable derivatives.

### Platform Projection

An audience- or tool-specific record derived from a Work Proposal. A projection
may omit irrelevant content but cannot change source authority, constraints, or
identity.

### Delivery Projection

A Platform Projection in a team's Jira project. It contains the authorized
outcome, relevant constraints, relevant Acceptance Conditions, dependencies,
planning context, and proposal reference needed by that team.

### Portfolio Graph

The typed relationships among proposals, artifacts, Jira records, catalog
entities, teams, reviews, dependencies, and tags.

### Portfolio Explorer

The Backstage UI that renders one expandable hierarchy at a time over the
Portfolio Graph. Tree position is navigation context, not record identity.

## Authority model

| Information                                     | Authority                                      | Jira's role                                      |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| Proposal answers before acceptance              | Exact Reviewable Work Proposal JSON            | Durable record, attachment, and searchable index |
| Accepted proposal rationale                     | Final Artifact Repository revision             | Searchable mirror and canonical link             |
| System, component, resource, API, and ownership | Backstage catalog                              | Referenced by stable entity ref                  |
| Technical dependency closure                    | Backstage catalog                              | Projected links may expose the result            |
| Review routing                                  | Backstage catalog plus governing review rules  | Ordered review work                              |
| Sponsor, acceptance, and capacity decisions     | Authenticated decision evidence for a revision | Workflow projection and durable reference        |
| Team delivery work                              | Authorized Work Proposal plus team commitment  | Operational system of record                     |
| Jira project routing                            | Backstage Group annotation                     | Destination only                                 |
| Accepted artifact supersession                  | Final Artifact Repository lineage              | Searchable relationship                          |

No downstream projection may silently become authoritative merely because its
platform is easier to edit.

## End-to-end flow

```text
Versioned form definition
          |
          v
Guided browser answers
          |
          v
Validated Work Proposal artifact
          |
          v
Backstage catalog resolution
          |
          v
Exact JSON + SHA-256
          |
          v
Jira Work Proposal Index Record in NWI
     |              |                 |
     |              |                 +--> typed catalog references
     |              +--> ordered review children
     +--> exact JSON attachment
          |
          v
Authenticated authorization and capacity evidence
          |
          +--> accepted Markdown + JSON in Final Artifact Repository
          |
          +--> linked, deliberately smaller Delivery Projections
          |
          v
Backstage Portfolio Graph
          |
          v
Registry-style Portfolio Explorer
```

The Work Proposal Index Record must exist and contain a verified artifact before
review work is created. The accepted Final Artifact Repository revision must
exist before authorized delivery is published.

## Functional requirements

### FR-1: Form definitions are data

The form must load versioned definitions from
`forms/definitions/<form-id>.v<version>.yaml` or equivalent JSON. Application
code must not contain the authoritative question text, applicability rules, or
field-to-artifact mapping.

Each definition must declare:

- a stable form identifier and integer version;
- the intake contexts to which it applies;
- ordered sections and fields;
- stable field identifiers independent of labels;
- field type and output path;
- required and conditionally required rules;
- validation and completion evidence;
- option sources, including Backstage catalog queries;
- allowed controlled values;
- whether free-form values are permitted; and
- the artifact schema version produced by the definition.

Conditional logic must use a bounded declarative grammar. YAML must not execute
JavaScript. The initial grammar needs `all`, `any`, `not`, `equals`, `includes`,
`present`, and numeric comparison.

Changing wording without changing meaning may retain the form version. Changing a
field identifier, meaning, applicability rule, validation rule, or output mapping
requires a new version.

The first migrated definition is the existing Work Proposal form. Existing
scenario fixtures must populate answers through the same stable field identifiers
used by a person.

### FR-2: Artifact schema preserves atomic evidence

The next artifact schema version must preserve the guided answer structure instead
of flattening every section into strings. At minimum, it must retain:

- form identifier and version;
- proposal identifier and revision;
- submission provenance;
- Current-State summary and authoritative baseline references;
- Desired Outcome;
- Required Difference;
- individually identified Requirements, including modality and verification;
- individually identified Acceptance Conditions and evidence methods;
- non-goals;
- affected Backstage entity references;
- dependencies and preconditions;
- sponsor and authority evidence present at that lifecycle state;
- candidate delivery records;
- controlled functional and decision-impact classifications; and
- curated tags.

Rendered prose must be generated from the atomic artifact. Rendered prose must not
be parsed to reconstruct the artifact.

The backend, not the browser, calculates a SHA-256 over canonical JSON after
catalog routing is resolved. The hash excludes transient Jira keys, publication
timestamps, and other projection results.

### FR-3: Reviewable proposal persistence precedes review publication

Publishing a Reviewable Work Proposal must perform these operations in order:

1. authenticate the Backstage user;
2. validate the artifact schema and lifecycle state;
3. resolve affected entities, dependencies, owners, reviews, and routes from the
   Backstage catalog;
4. canonicalize the routed artifact and calculate its SHA-256;
5. create or reconcile the Work Proposal Index Record;
6. attach the exact canonical JSON or verify the attachment already stored;
7. write the compact Jira manifest property;
8. create or reconcile ordered review records; and
9. return the proposal key, review keys, artifact hash, and source URLs.

If steps 5 through 7 fail, no review record may be created. A retry of the same
proposal revision and content must reuse the stored record. Changed content under
the same proposal revision must fail and require revision increment.

The current temporary file may remain an internal CLI adapter, but successful
publication must no longer depend on that file for later reconstruction.

### FR-4: Jira Work Proposal Index Record

Phase one keeps the NWI Work Proposal as Jira issue type `Epic` so review tasks can
remain children without requiring custom hierarchy configuration.

Its human-readable description must render:

- proposal identity and revision;
- lifecycle state and exact authority;
- Current State and baseline references;
- Desired Outcome;
- Required Difference;
- Requirements and verification methods;
- Acceptance Conditions and evidence methods;
- dependencies and preconditions;
- known uncertainty;
- artifact hash; and
- the canonical artifact URL once accepted.

The bootstrapper must idempotently create or discover these queryable fields and
record their Jira field identifiers in configuration rather than hardcoding IDs:

- Work Proposal ID;
- Work Proposal Revision;
- Work Proposal State;
- Artifact SHA-256;
- Artifact URL;
- Form ID and Form Version;
- Affected Entity References;
- Work Functions;
- Decision Impacts; and
- Proposal Tags.

Jira labels may mirror low-cardinality classifications for the prototype, but
labels are not substitutes for proposal identity, lifecycle, or typed catalog
references.

The issue property `northstar.work-proposal` must contain only a compact manifest:

```json
{
  "schemaVersion": 1,
  "proposalId": "WP-2026-0042",
  "proposalRevision": 0,
  "artifactSha256": "<64 lowercase hex characters>",
  "artifactAttachmentId": "<jira attachment id>",
  "artifactUrl": null,
  "form": { "id": "technical-work-proposal", "version": 1 }
}
```

The full artifact must not be placed in the issue property. Jira Cloud limits one
entity-property value to 32 KiB and properties use last-write-wins concurrency.
The exact JSON belongs in the verified attachment before acceptance and in the
Final Artifact Repository after acceptance.

### FR-5: Final Artifact Repository acceptance

An Authorized Work Proposal must resolve to an accepted artifact revision in the
Final Artifact Repository before delivery publication.

The repository layout must be deterministic:

```text
work-proposals/
└── WP-2026-0042/
    └── rev-0000/
        ├── proposal.json
        ├── proposal.md
        └── manifest.json
```

`manifest.json` must record proposal identity, revision, schema version, content
hash, acceptance state, accepting authority, acceptance evidence reference,
accepted timestamp, predecessor revision when present, and Jira index key.

Acceptance must never overwrite an earlier revision. A superseding revision adds
a new directory and explicitly references its predecessor. The Jira index record
must be updated with the accepted artifact URL and hash without rewriting the
original proposal content.

The repository implementation must expose a small interface:

```ts
type ArtifactIdentity = { proposalId: string; revision: number };

interface FinalArtifactRepository {
  accept(artifact: AcceptedWorkProposal): Promise<AcceptedArtifactRef>;
  get(identity: ArtifactIdentity): Promise<AcceptedWorkProposal | undefined>;
}
```

The first adapter may target a configured Git working copy for the prototype. A
future source-control adapter may open a reviewed change instead. Both must
produce the same deterministic file content and must not report `Accepted` before
repository acceptance has actually occurred.

### FR-6: Delivery Projections are deliberately smaller

Each Delivery Projection must contain only:

- local delivery title and outcome or exit condition;
- governing Work Proposal ID and revision;
- Authorized Work Proposal decision reference;
- proposal/artifact URL;
- requirements and Acceptance Conditions applicable to that record;
- affected Backstage entities owned by the receiving team;
- Planning Interval;
- Acceptance Authority;
- accepted Capacity Commitment;
- delivery dependencies; and
- projection identity and content hash.

It must not copy the complete proposal rationale by default. It must not mutate
the governing outcome, requirement, boundary, or acceptance condition. A required
change to those facts routes to Work Proposal supersession rather than editing the
Delivery Projection.

### FR-7: Typed relations replace generic provenance links

The Jira bootstrapper must idempotently ensure a custom link type with these
semantics:

| Link name         | Outward description | Inward description |
| ----------------- | ------------------- | ------------------ |
| Proposal Delivery | `is implemented by` | `implements`       |

The implementation must verify Jira's displayed direction in an integration test
instead of relying on parameter-name intuition.

Delivery-to-delivery sequencing continues to use `Blocks`. Review tasks may
remain children of the NWI Epic. Delivery Projections must not use the NWI record
as a parent. Existing generic `Relates` links may remain during migration, but new
publication must use `Proposal Delivery`.

Additional relationship types may be added only when they preserve a domain
meaning that cannot be represented by an existing type. Tags must not substitute
for known relationships.

### FR-8: Portfolio Graph module

The backend must expose a deep Portfolio Graph module whose callers do not need to
know how Jira, Backstage, or the artifact repository represent relationships:

```ts
interface PortfolioGraph {
  roots(query: ExplorerQuery): Promise<ExplorerNode[]>;
  children(
    node: ExplorerNodeRef,
    query: ExplorerQuery,
  ): Promise<ExplorerNodePage>;
  proposal(id: string, revision?: number): Promise<ProposalView | undefined>;
}
```

The initial implementation reads:

- Work Proposal Index Records, review children, Delivery Projections, custom
  links, lifecycle, and classifications from Jira;
- systems, components, resources, APIs, Groups, ownership, and dependencies from
  Backstage; and
- accepted content, revision lineage, and artifact authority from the Final
  Artifact Repository.

No separate graph database or search index is required for the prototype. The
module may cache read results briefly, but every node must expose source and
retrieval time. If scale later requires PostgreSQL or Elasticsearch, introduce an
index adapter only when the second implementation is real; the Portfolio Graph
interface remains the caller and test surface.

All graph nodes use stable typed references, for example:

```text
proposal:WP-2026-0042@0
jira:NWI-17
catalog:system:default/metrics-alerting-platform
catalog:group:default/sre
tag:cautionary_vendor_tale
```

Every edge must have a type, source, and authority. The graph must not collapse
Backstage `dependsOn`, Jira `Blocks`, and proposal `affects` into one generic
relationship.

### FR-9: Registry-style Portfolio Explorer

Backstage must add `/work-intake/portfolio` and expose it beside the intake form.
The page must provide expandable roots for at least:

- Work Proposals;
- Systems;
- Teams;
- Lifecycle States; and
- Tags.

Capability, vendor, decision-impact, and time perspectives may appear when their
structured source data exists.

Each row must show:

- expand/collapse control when children exist;
- record title and kind;
- relationship to its displayed parent;
- lifecycle state where applicable;
- source authority;
- stale or partial-data warning;
- direct link to Jira, Backstage, or the accepted artifact; and
- stable reference available for copy.

Expansion must be lazy and paginated. The same stable record may appear in
several branches. The UI must track references already present in the active path;
when an edge would create a cycle, it renders a link to the prior node and does not
expand recursively.

The explorer must never imply that visual tree position establishes parentage.
The relationship label is required whenever a child is not a true decomposition
child.

### FR-10: Query behavior

The backend must support exact filtering by:

- proposal ID and revision;
- lifecycle state;
- affected catalog entity;
- owning or delivery team;
- form ID and version;
- work function;
- decision impact;
- curated tag;
- artifact acceptance state; and
- created or accepted time range.

Free-text search may combine Jira text search and accepted artifact text. Missing
classification is not interpreted as `false`; the UI must distinguish absent,
unknown, and explicitly not applicable.

A tag such as `cautionary_vendor_tale` is permitted because it records useful
human interpretation not reliably derivable from formal inputs and outputs. The
record must retain who applied the tag and when. An LLM may later suggest such a
tag, but a person must accept it before it becomes authoritative metadata.

## Module placement

The existing `workIntakeJira` backend plugin has grown beyond a Jira command
adapter. Implementation should move toward this layout without requiring a
single disruptive rename:

```text
packages/backend/src/workIntake/
├── domain/
│   ├── artifactSchema.ts
│   ├── canonicalJson.ts
│   └── references.ts
├── forms/
│   ├── definitions.ts
│   └── conditions.ts
├── publication/
│   ├── publishProposal.ts
│   ├── projectDelivery.ts
│   └── renderJira.ts
├── portfolio/
│   ├── graph.ts
│   └── router.ts
└── adapters/
    ├── backstageCatalog.ts
    ├── finalArtifactRepository.ts
    └── jira.ts
```

The external publication interface should become:

```ts
interface WorkProposalPublication {
  preview(artifact: WorkProposalArtifact): Promise<PublicationPlan>;
  publish(artifact: WorkProposalArtifact): Promise<PublicationResult>;
}
```

Catalog resolution, hashing, Jira persistence, attachment verification, review
creation, accepted-artifact verification, delivery projection, link creation, and
idempotency remain inside the module. The browser and CLI use the same interface.
The interface, not the CLI subprocess, is the primary test surface.

The current command adapter may remain temporarily for compatibility, but it must
delegate to the shared publication module rather than preserve a second
publication implementation.

## Backend routes

The backend plugin must expose:

| Method | Route                                      | Purpose                                 |
| ------ | ------------------------------------------ | --------------------------------------- |
| `POST` | `/api/work-intake/publish/preview`         | Validate and return a non-mutating plan |
| `POST` | `/api/work-intake/publish`                 | Persist and publish a proposal revision |
| `GET`  | `/api/work-intake/proposals/:id`           | Return current revision and lineage     |
| `GET`  | `/api/work-intake/proposals/:id/:revision` | Return one proposal view                |
| `GET`  | `/api/work-intake/portfolio/roots`         | Return explorer roots for a perspective |
| `GET`  | `/api/work-intake/portfolio/children/:ref` | Lazily return related nodes             |

Every route requires a Backstage user identity. Artifact content follows the
Artifact Visibility Rule. A restricted artifact returns its organization-visible
Restricted Coordination Stub rather than leaking content or disappearing from
the graph.

The old `/api/work-intake-jira` routes may proxy to the new module during one
migration release.

## Failure behavior

- Invalid form or artifact schema returns `400` and creates no durable record.
- Missing catalog entity or routing authority returns `409` and creates no Jira
  projection.
- Jira persistence failure returns `502`; review and delivery publication do not
  continue.
- Attachment hash mismatch returns `409` and requires investigation or a new
  revision; it is never silently overwritten.
- A changed artifact under an existing proposal revision returns `409`.
- A failure after the Work Proposal Index Record is durable but before all review
  records exist is retryable through the publication ledger.
- Final Artifact Repository failure prevents the proposal from entering the
  accepted state used for delivery publication.
- Portfolio source failure produces a visible partial-data warning. The explorer
  does not invent missing nodes or treat unavailable data as absence.
- An unknown relationship type is retained as unknown and logged; it is not
  converted to `Relates` automatically.

## Migration

Add `./yarn jira:portfolio:migrate` with dry-run default and explicit `--apply`.
It must:

1. find NWI issues carrying `northstar-work-intake` and `work-proposal` labels;
2. correlate them with known publication labels and ledger records;
3. identify whether an exact source artifact still exists;
4. propose custom fields, compact manifest properties, attachments, and typed
   links that can be added without changing historical content;
5. classify unreconstructable records as `legacy_projection`; and
6. refuse to invent atomic fields by parsing prose when the source is ambiguous.

Migration first adds and verifies `Proposal Delivery` links. Removal of old
`Relates` links is a separate explicit cleanup after comparison. The script must
never delete a relationship merely because a replacement was planned.

## Verification

### Unit tests

- Form selection chooses the correct definition for context.
- Conditional fields use only the allowed grammar.
- Compilation preserves stable atomic field identifiers.
- Canonical JSON produces deterministic hashes.
- Changed content changes the hash.
- Jira rendering never becomes an artifact parser.
- Delivery rendering omits unrelated rationale and retains required traceability.
- Graph traversal distinguishes relation types.
- Cycle detection terminates expansion without hiding the relationship.
- Missing values remain unknown rather than becoming false.

### Adapter tests

- Jira custom fields and link types bootstrap idempotently.
- Jira stores and retrieves the compact manifest property.
- Exact JSON attachment retrieval matches the recorded SHA-256.
- Jira displays `implements` and `is implemented by` in the intended directions.
- Accepted artifact files are deterministic and immutable by revision.
- Backstage dependency and ownership resolution remains authoritative.

### Integration tests

- Publishing the Metrics proposal creates one durable Work Proposal Index Record
  and its review children without delivery work.
- Restarting Backstage does not impair artifact retrieval.
- Repeating publication reuses the same Jira records and attachment.
- Publishing changed content under the same revision fails.
- An accepted and fully authorized proposal creates team Delivery Projections
  linked by `Proposal Delivery`, not parented to NWI.
- The proposal appears beneath both an affected system and its lifecycle state in
  the explorer, and both appearances resolve to the same stable proposal ref.
- A curated tag creates another navigation path without duplicating the proposal.
- A catalog dependency cycle does not create infinite UI expansion.

### End-to-end acceptance conditions

1. A user publishes `WP-2026-0042 rev 0`, closes the browser, restarts Backstage,
   and retrieves the exact artifact with the same SHA-256.
2. A user opens a team Delivery Projection and reaches the governing proposal and
   accepted artifact in no more than one link transition.
3. A user browses `Systems → Metrics → Work Proposals` and
   `Tags → cautionary_vendor_tale` and sees the same stable proposal identity.
4. The Jira project set works without a custom Initiative-above-Epic hierarchy.
5. No person manually creates projects, custom fields, link types, proposal
   records, review records, delivery records, or portfolio relationships required
   for the demonstration.

## Implementation sequence

### Phase 1: Preserve structure

- Introduce versioned form definitions.
- Introduce the next atomic artifact schema.
- Add canonical JSON and deterministic hashing.
- Preserve existing scenario behavior with characterization tests.

### Phase 2: Make the Reviewable Work Proposal durable

- Extend Jira bootstrap for queryable fields and `Proposal Delivery` links.
- Create the Work Proposal Index Record before reviews.
- Store the compact manifest and exact JSON attachment.
- Reconcile attachment and hash through the publication ledger.

### Phase 3: Correct the delivery projection

- Render team-specific Delivery Projections.
- Replace new generic proposal `Relates` links with `Proposal Delivery`.
- Preserve `Blocks` for delivery sequencing.
- Add proposal and artifact navigation to every delivery record.

### Phase 4: Add the Portfolio Explorer

- Implement Portfolio Graph roots, children, proposal retrieval, and cycle
  handling.
- Add the Backstage route and expandable UI.
- Add exact filters and source links.

### Phase 5: Close accepted-artifact authority

- Implement the Final Artifact Repository adapter.
- Render deterministic Markdown and JSON.
- Record acceptance and supersession.
- Require an accepted artifact reference before delivery publication.

### Phase 6: Add retrieval assistance only after the graph works

- Evaluate PostgreSQL or Elasticsearch only when source queries no longer meet
  latency or retrieval requirements.
- Add semantic retrieval over the bounded candidate set.
- Allow an LLM to suggest missing classifications and relevant prior evidence.
- Require human acceptance before suggestions alter authoritative metadata.

## Product constraints

- Jira Cloud custom hierarchy above Epic requires Premium or Enterprise and
  applies globally to company-managed projects. This design does not depend on
  it: <https://support.atlassian.com/jira-cloud-administration/docs/configure-the-issue-type-hierarchy/>
- Jira administrators can define directional custom work-item link types:
  <https://support.atlassian.com/jira-cloud-administration/docs/configure-issue-linking/>
- Jira Cloud issue entity properties are JSON but limited to 32 KiB and use
  last-write-wins concurrency:
  <https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/>
- Backstage supports custom directed catalog relations and stable entity
  references:
  <https://backstage.io/docs/features/software-catalog/extending-the-model/>

## Definition of done

The feature is done when the end-to-end acceptance conditions pass, the Metrics
scenario can be demonstrated without manual Jira setup, and deleting the browser
session, temporary publication file, or local publication ledger cannot delete or
orphan the proposal rationale. Jira can remain a deliberately lossy delivery
system because every loss is governed by a verified, navigable reference to the
authoritative evidence.
