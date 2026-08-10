# Multi-Destination Work Proposal Publication Specification

Status: Draft for implementation

Applies to: `work-intake-backstage` and `work-intake-decision-tree`

Primary targets: Jira Cloud and Jira Product Discovery (JPD)

Future target: ServiceNow or another system selected through configuration

## Executive summary

Work Intake must publish the same governed Work Proposal through more than one
external platform without moving decision rules, authority checks, catalog
routing, revision guards, or artifact integrity into those platforms.

The backend will expose one deep **Publication Module**. Its caller selects a
server-configured publication profile and supplies the current Work Proposal
artifact. The Module authenticates the actor, resolves Backstage catalog facts,
enforces proposal and delivery authority, constructs a destination-neutral
publication batch, applies it through one or more external **Adapters**, and
returns one normalized receipt.

A profile may span platforms. For example, an `atlassian-discovery` profile may
publish the proposal to JPD, ordered reviews to the `NWI` Jira project, and
authorized delivery to catalog-routed Jira projects. The browser selects the
profile; it does not select arbitrary project keys, URLs, tables, or credentials.

The implementation is organized for low-token multi-agent execution. A small
contract gate is serial. After that gate, agents receive narrow context capsules,
exclusive file ownership, fixed fixtures, and one acceptance command. No agent is
asked to rediscover the whole architecture.

## Relationship to the portfolio specification

This specification supersedes Jira-only publisher, backend-route, and module-
placement details in `WORK-PROPOSAL-PORTFOLIO-SPEC.md`. It does not supersede that
document's domain language, authority model, artifact durability, Portfolio
Graph, or Portfolio Explorer requirements.

## Required outcome

A user in Backstage can:

1. see the publication profiles currently available to them;
2. select Jira Work Management or Atlassian Discovery initially;
3. publish one validated Work Proposal revision through the selected profile;
4. receive links and status for every resulting Platform Projection;
5. retry safely without creating duplicates; and
6. receive a revision conflict if changed content reuses a published revision.

Adding a later ServiceNow profile must not require changes to the intake form,
artifact schema, catalog-routing rules, authority rules, or caller interface.

## Non-goals

This implementation will not:

- create a universal lowest-common-denominator record model;
- permit an Adapter to weaken Work Proposal or Candidate Delivery authority;
- trust browser-supplied project keys, endpoints, tables, or credentials;
- promise rollback across external systems;
- silently fall back to another profile after a partial failure;
- implement ServiceNow before a real schema, authentication method, and sandbox
  exist;
- replace Jira/JPD roadmap and delivery user interfaces; or
- move Backstage catalog ownership or dependency facts into a destination.

## Design decision

### Publication profiles, not backend choices

The selection exposed to callers is a **publication profile**. A profile maps
logical publication roles to configured target bindings:

```ts
type PublicationRole = 'proposal' | 'review' | 'delivery';

type PublicationProfile = {
  id: string;
  displayName: string;
  placements: Array<{
    id: string;
    role: PublicationRole;
    bindingId: string;
    dependsOn: string[];
  }>;
  artifactPlacementId: string;
  failurePolicy: 'stop-after-failure' | 'complete-independent';
};

type TargetBinding = {
  id: string;
  adapterId: string;
  target:
    | { kind: 'fixed'; targetId: string }
    | { kind: 'catalog-route'; route: 'delivery-project' };
  configRef: string;
  mappingVersion: number;
};
```

Initial profiles:

```text
jira-work-management
  proposal -> jira / NWI
  review   -> jira / NWI
  delivery -> jira / catalog-routed project

atlassian-discovery
  proposal -> jpd  / MDP
  review   -> jira / NWI
  delivery -> jira / catalog-routed project
```

Placements are ordered by their dependency graph, not their array position. More
than one placement may publish the same logical role. Every review and delivery
placement depends on the proposal/artifact placement unless an explicit future
profile proves a different durable artifact path.

Bindings and profiles are server configuration. They are not serialized into the
canonical Work Proposal as authority. `configRef` resolves non-secret target
mapping plus secret references inside the backend; its contents never enter the
browser artifact.

### Public interface

The Publication Module presents three entry points:

```ts
interface WorkProposalPublication {
  profiles(actor: AuthenticatedActor): Promise<PublicationProfileSummary[]>;

  preview(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationPlan>;

  publish(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationReceipt>;
}

type PublicationRequest = {
  profileId: string;
  artifact: WorkProposalArtifact;
};
```

`AuthenticatedActor` is a branded backend type that only the Backstage auth
Adapter can construct. It is not JSON-deserializable. The HTTP request contains
only `profileId` and `artifact`; any actor field supplied by the browser is
ignored or rejected.

`preview` performs no external writes. It validates, resolves catalog routing,
and returns the logical records and placements that `publish` would use.

`publish` owns the complete transition to durable external projections. Callers
do not sequence adapters or invoke a separate artifact, review, or delivery
operation.

### Destination-neutral publication batch

Catalog enrichment and authority checks produce logical records rather than
Jira issues:

```ts
type PublicationRecord = {
  localId: string;
  kind: 'proposal' | 'ordered-review' | 'authorized-delivery';
  identity: { proposalId: string; proposalRevision: number };
  title: string;
  content: StructuredPublicationContent;
  routing: ResolvedCatalogRouting;
  idempotencyKey: string;
  logicalFingerprint: string;
};

type PublicationRelation = {
  type: 'precedes' | 'blocks' | 'governs' | 'relates-to';
  fromLocalId: string;
  toLocalId: string;
};

type PublicationBatch = {
  profileId: string;
  artifact: CanonicalArtifactReference;
  records: PublicationRecord[];
  relations: PublicationRelation[];
  notes: string[];
};

type TargetBatch = {
  profileId: string;
  placementId: string;
  binding: ResolvedTargetBinding;
  mappingVersion: number;
  artifact: CanonicalArtifact;
  records: PublicationRecord[];
  relations: PublicationRelation[];
  targetFingerprints: Record<string, string>;
};
```

Structured content preserves headings, fields, lists, evidence, and references.
It must not use ADF, Jira issue types, JPD custom-field IDs, or ServiceNow table
names. Those belong inside an Adapter.

Before Adapter invocation, the Module resolves every fixed or catalog-routed
target to a concrete `ResolvedTargetBinding`. A target fingerprint covers the
logical record, placement ID, concrete target, and `mappingVersion`. Any Adapter
mapping change that changes an external projection must increment
`mappingVersion`.

### Adapter seam

External platforms are true external dependencies. Each is injected through a
narrow Adapter interface:

```ts
interface PublicationTarget {
  readonly id: string;
  status(binding: TargetBinding): Promise<TargetStatus>;
  observe(
    batch: TargetBatch,
    journal: JournalObservation,
  ): Promise<TargetObservation>;
  apply(batch: TargetBatch): Promise<TargetReceipt>;
}

interface ArtifactStore {
  persist(
    artifact: CanonicalArtifact,
    anchor: ExternalProjection,
  ): Promise<CanonicalArtifactReference>;
  verify(reference: CanonicalArtifactReference): Promise<void>;
}

type TargetReceipt = {
  results: Array<{
    localId: string;
    idempotencyKey: string;
    targetFingerprint: string;
    externalId: string;
    url?: string;
    action: 'created' | 'reused' | 'reconciled';
  }>;
  relations: Array<{
    type: PublicationRelation['type'];
    action: 'created' | 'reused';
  }>;
};
```

The Publication Module owns validation, catalog routing, authority, ordering,
canonical hashing, profile selection, idempotency identity, journal decisions,
partial-failure behavior, artifact-persistence ordering, reconciliation
decisions, and normalized receipts.

An Adapter owns destination authentication, field discovery, rendering, external
lookup/create/update calls, attachment or document mechanics, relationship
mapping, and external observation. `observe` reports `found`, `absent`,
`indeterminate`, or `conflict` with external evidence. The Module alone decides
whether that evidence means create, reuse, reconcile, `RevisionRequired`, or
`IndeterminatePublication`. An Adapter cannot derive owners, approve delivery,
or choose another target.

The Module compares `TargetReceipt.results` with the requested `TargetBatch` and
rejects missing, duplicate, unexpected, or fingerprint-mismatched results. A
batch cannot be reported complete through aggregate Adapter success alone.

Jira and JPD share an internal Atlassian transport for REST calls, ADF,
attachments, issue properties, authentication, and field metadata. They remain
separate Adapters because their projection semantics differ. ServiceNow will use
a different transport while satisfying the same Adapter interface.

The Module invokes the configured `ArtifactStore` after the proposal anchor is
created or reconciled and before dependent placements start. Jira and JPD may
share an Atlassian attachment-backed ArtifactStore implementation. This keeps
durability ordering in the Module while keeping vendor I/O in an Adapter.

## Required invariants

The Publication Module enforces these before any Adapter write:

1. Work Proposal identity is `(proposal.id, proposal.revision)`.
2. Meaningful content changes under a published revision are rejected.
3. Backstage re-derives dependency closure, owners, ordered reviews, and routing.
4. A Platform Projection never becomes authority merely because it is editable.
5. Candidate Delivery remains unpublished unless the Authorized Work Proposal,
   Planning Interval, Acceptance Authority, and every Capacity Acceptance exist
   and govern the same proposal revision.
6. Every projection carries the canonical artifact hash and governing proposal
   identity.
7. The canonical JSON is persisted and verified through the configured
   ArtifactStore before dependent review or delivery placements start.
8. An indeterminate external create stops retry rather than risking a duplicate.
9. Profile selection never grants additional proposal or delivery authority.
10. No Adapter silently drops a logical record it was configured to publish.
11. Every profile names exactly one `proposal` placement as
    `artifactPlacementId`, and every dependent placement has a path to it in the
    placement dependency graph.

## Idempotency and journal

Journal identity is destination-qualified:

```text
profileId : placementId : adapterId : targetId : proposalId : revision : localId
```

The journal stores logical and target fingerprints, mapping version, external
identifier, external URL, state (`creating` or `published`), and last observation.
The same key and target fingerprint may be reused or reconciled. The same key and
a different fingerprint raises `RevisionRequired`. A `creating` entry must be
observed before another create; only a proven `absent` result may proceed.

Existing Jira ledger entries must migrate or be read through a compatibility
key so already-published Jira records are not duplicated.

## Failure model

Normalized error kinds:

- `InvalidArtifact`
- `CatalogRoutingFailure`
- `AuthorityViolation`
- `CapacityNotAccepted`
- `ProfileNotAllowed`
- `TargetConfigurationError`
- `TargetAuthenticationError`
- `TargetUnavailable`
- `RevisionRequired`
- `ConcurrentPublication`
- `IndeterminatePublication`
- `PartialPublication`

`stop-after-failure` means that no not-yet-started placement begins after a
failure. It does not claim cross-platform rollback. `complete-independent`
continues only placements with no dependency path to the failed placement and
returns a partial receipt. A retry observes and reconciles each placement through
the publication journal.

## Backend routes

```text
GET  /api/work-intake-publication/profiles
POST /api/work-intake-publication/preview
POST /api/work-intake-publication/publish
```

The existing `/api/work-intake-jira` route remains temporarily as a compatibility
Adapter that delegates to the `jira-work-management` profile. It contains no
publication rules.

The publish request body is:

```json
{
  "profileId": "atlassian-discovery",
  "artifact": {}
}
```

The receipt is destination-neutral and includes proposal identity, profile,
canonical artifact hash/locator, per-record action and external URL, relations,
notes, and partial/retryable state.

## Backstage UI

The Work Intake page obtains profiles from the backend and displays only allowed,
configured profiles. It shows the profile label, availability, and a neutral
Publish action. Result rendering uses the normalized receipt and may link to JPD,
Jira, or another platform without destination-specific branching.

The UI does not load secrets, discover external fields, or decide which logical
records belong in each destination.

## Module placement

```text
packages/backend/src/workIntakePublication/
  contracts.ts
  errors.ts
  profiles.ts
  publicationService.ts
  router.ts
  plugin.ts
  journal/
  artifactStore/
  adapters/
    catalog/
    atlassian/
      transport.ts
      jiraTarget.ts
      jpdTarget.ts
    inMemoryTarget.ts

packages/app/src/plugins/workIntake/
  WorkIntakePage.tsx
  publicationClient.ts
```

The existing `scripts/jira/publish.mjs` becomes a thin compatibility CLI calling
the Publication Module. No second orchestration path may remain in the script.

## Verification strategy

The Publication Module interface is the primary test surface. An in-memory
catalog Adapter, journal, artifact store, and target Adapter exercise complete
publication behavior without network access.

Required contract cases:

- preview performs no writes;
- Jira-only publication preserves current observable projections;
- editing without revision advancement is rejected;
- a retry reuses or reconciles every existing projection;
- an indeterminate create cannot duplicate a record;
- no delivery projection appears without complete authority and capacity;
- catalog routing overrides requester destination claims;
- a mixed JPD/Jira profile places each logical role correctly;
- every projection references the same artifact hash;
- partial failure returns a retryable normalized receipt; and
- all target Adapters pass the same authority and idempotency conformance suite.

Real Atlassian tests are opt-in sandbox tests. The normal suite remains hermetic.

## Multi-agent execution plan

### Parallelization limit

Approximately 65–75% of implementation work can run in parallel after the
contract gate. The critical path remains:

```text
contract -> destination-neutral planner -> adapter parity -> integration
```

Use at most three implementation agents concurrently. More agents would create
contract restatement, merge conflicts, and review overhead larger than the likely
wall-time gain.

### Execution graph

```text
P0 contract, protocols, and fixtures ───────────────────────┐
   ├─ P2 destination-neutral planner                        │
   ├─ P3 profile-scoped journal                             │
   ├─ P4 artifact store                                     │
   ├─ P5 Atlassian transport                                │
   ├─ P6 backend routes/profile registry with fake Module   │
   └─ P7 Backstage selector UI against HTTP fixtures        │
                                                            │
P1 read-only JPD metadata capture ───────┐                   │
P2 + P4 + P5 ────────────────────────────┼─ P9 JPD Adapter ──┤
P2 + P3 + P4 + P5 ─────────── P8 Jira Adapter parity ───────┤
                                                            │
P6 + P7 + P8 + P9 ────────── P10 composition and migration ─┤
                                                            │
P10 ───────────────────────── P11 cleanup, docs, full suite ─┘
```

P0 and P1 may start together. P2–P7 may run concurrently after P0, but only
three should be active at once. P8 and P9 may run concurrently after their
dependencies land. P10 and P11 are serial.

### Task packets

#### P0 — Freeze contracts and fixtures

- Model: frontier coding model, high reasoning.
- Context target: 12–18k input tokens; under 1,500 output tokens.
- Owns: new `contracts.ts`, `errors.ts`, profile fixtures, receipt fixtures, and
  contract tests only.
- Must read: this specification, artifact schema, canonical JSON module, current
  planner return shape, router response shape.
- Deliver: frozen public types; `TargetBatch`; placement dependency and execution
  phases; target observation/reconciliation protocol; ArtifactStore and journal
  ports; Jira-only and mixed-profile fixtures; error taxonomy; compilation tests.
- Gate: TypeScript passes and downstream agents can implement without inventing
  fields.

#### P1 — Discover JPD target metadata

- Model: lower-cost model, low reasoning for factual capture only.
- Context target: 4–7k input tokens; under 800 output tokens.
- Mode: read-only against Atlassian.
- Must inspect: `MDP` project type, idea work type, required create fields,
  relevant custom fields, attachments, properties, connection fields, and search
  behavior.
- Deliver: one JSON fixture, raw sandbox trace if credentials permit, and a short
  factual note; no mapping decisions and no production edits. If live access is
  unavailable, record the failure and use an explicitly marked captured-fixture
  fallback supplied by the integration owner.
- Gate: fixture is sufficient to construct and search one idempotent JPD idea.

#### P2 — Extract destination-neutral planning

- Model: frontier coding model, high reasoning.
- Context target: 14–22k input tokens; under 1,500 output tokens.
- Owns: `publicationService.ts`, neutral planner modules, and interface-level
  tests. It does not edit vendor Adapters or UI.
- Must read: P0 contracts plus current `planning.mjs` and its tests.
- Deliver: catalog-routed neutral batch; authority rules; preview; canonical
  fingerprints.
- Gate: existing authority cases pass through the new Module interface.

#### P3 — Generalize the publication journal

- Model: lower-cost model, medium reasoning.
- Context target: 6–10k input tokens; under 1,000 output tokens.
- Owns: new journal directory and journal tests only.
- Must read: P0 journal types and current `ledger.mjs` plus tests.
- Deliver: profile/adapter/target-qualified keys, lock/reservation/reconciliation,
  and legacy Jira-key compatibility.
- Gate: deterministic collision, retry, concurrent lock, and migration tests.

#### P4 — Implement canonical ArtifactStore behavior

- Model: lower-cost model, medium reasoning.
- Context target: 6–10k input tokens; under 1,000 output tokens.
- Owns: new `artifactStore/` and tests only.
- Must read: P0 ArtifactStore port and current attachment/hash behavior.
- Deliver: in-memory conformance Adapter plus the orchestration contract for
  persist, verify, anchor, and content-addressed reuse. Vendor I/O remains P5/P8/P9.
- Gate: a canonical artifact is verified before a dependent placement can start.

#### P5 — Extract Atlassian transport

- Model: lower-cost model, medium reasoning.
- Context target: 8–12k input tokens; under 1,000 output tokens.
- Owns: `adapters/atlassian/transport.ts`, its tests, and any move or replacement
  of `scripts/jira/clients.mjs` and `clients.test.mjs`. It also owns the shared
  `atlassianArtifactStore.ts` production implementation and tests. No other packet
  edits those transport or store files.
- Deliver: authenticated requests, ADF rendering, attachments, properties,
  field/project discovery, links, normalized transport failures, and an
  attachment-backed ArtifactStore usable with a Jira or JPD anchor. No projection
  policy.
- Gate: characterization tests preserve current Jira HTTP behavior.

#### P6 — Add generic backend routes and profile registry

- Model: lower-cost model, medium reasoning.
- Context target: 7–11k input tokens; under 1,000 output tokens.
- Owns: new backend router/plugin/profile registry and tests plus the legacy
  `workIntakeJira/router.ts`, `plugin.ts`, and `command.ts` compatibility proxy.
- Must read: P0 contracts and current Jira router/plugin.
- Deliver: authenticated profiles/preview/publish routes against an injected fake
  Module and temporary Jira-route delegation. It does not compose real Adapters.
- Gate: every route authenticates; actor provenance is server-bound; arbitrary
  profile and target injection is rejected.

#### P7 — Add Backstage profile selection

- Model: lower-cost model, low reasoning.
- Context target: 5–8k input tokens; under 800 output tokens.
- Owns only: `WorkIntakePage.tsx`, new `publicationClient.ts`, and their tests.
- Must read: P0 HTTP fixtures and current `WorkIntakePage.tsx`.
- Deliver: profile loading, selection, availability, neutral publish state, and
  receipt links.
- Gate: UI tests use HTTP fixtures and contain no Jira/JPD branching.

#### P8 — Preserve Jira through the new Adapter

- Model: frontier coding model, medium-to-high reasoning.
- Context target: 12–18k input tokens; under 1,500 output tokens.
- Owns: `jiraTarget.ts`, Jira mapping tests, `scripts/jira/planning.mjs`,
  `publish.mjs`, and their parity tests. P5 owns the client files.
- Must read: P0, P2, P3, P4, P5 and existing Jira publisher/planner tests.
- Deliver: exact Jira projection parity, artifact attachment/property behavior,
  destination-qualified observation/reconciliation, and thin CLI delegation.
- Gate: existing Jira suites plus new Module-interface parity suite pass.

#### P9 — Add the JPD Adapter

- Model: frontier coding model, medium-to-high reasoning by default. A lower-cost
  medium-reasoning model is permitted only when P1 contains verified create,
  search, attachment/property, and reconciliation fixtures.
- Context target: 10–16k input tokens; under 1,200 output tokens.
- Owns: `jpdTarget.ts`, JPD configuration, and hermetic mapping tests only.
- Must read: P0 contracts, P1 fixture/trace, P2 batch, P4 artifact protocol, and
  P5 transport/artifact store.
- Deliver: reviewed proposal-to-Idea mapping, artifact anchoring, deterministic
  observation, normalized receipt, and mixed-profile placement.
- Gate: Adapter conformance suite passes without network; opt-in sandbox test can
  create then reconcile one disposable idea.

#### P10 — Compose the Module and migrate compatibility state

- Model: frontier coding model, high reasoning.
- Context target: 12–18k input tokens; under 1,500 output tokens.
- Owns: composition/factory wiring, backend index registration, profile config,
  journal migration, and cross-module integration tests.
- Must not redesign P0 contracts unless a failing invariant proves them invalid.
- Deliver: routes and CLI invoking one in-process Publication Module; Jira ledger
  compatibility; mixed-profile execution ordering; no test-only global wiring.
- Gate: hermetic Jira-only and mixed-profile integration suites pass through the
  public Module interface and HTTP route.

#### P11 — Remove duplicate paths, document, and run the full suite

- Model: frontier coding model, medium reasoning.
- Context target: 8–14k input tokens; under 1,000 output tokens.
- Owns: final moves/deletions, compatibility cleanup allowed by the migration
  policy, documentation, and full-suite fixes. The legacy CLI remains a supported
  thin delegator; P11 may remove duplicate orchestration behind it but must not
  remove or change its observable command behavior.
- Must read: P10 handoff and failing output only; no architectural redesign.
- Deliver: no duplicate orchestration, accurate docs, clean repository.
- Gate: full Backstage, Jira, decision-tree, type, format,
  Adapter-conformance, and hermetic mixed-profile tests pass.

### Review packets

After P11, run two read-only reviews in parallel:

- Standards review: lower-cost model, low reasoning, diff plus repository
  standards only.
- Specification review: lower-cost model, medium reasoning, this file plus diff
  only.

Escalate only concrete findings to the frontier integration agent. Do not ask
reviewers to restate the implementation.

## Token-control protocol

Every task prompt must contain only:

1. the packet section from this specification;
2. the frozen P0 types or fixture it consumes;
3. its allowed file list;
4. its one acceptance command; and
5. the exact predecessor commit and exported file paths;
6. one importable fixture demonstrating the expected interface; and
7. any predecessor handoff capped at 500 words.

Agents must not receive the full conversation, unrelated corpus documents, full
test output, or other agents' reasoning. Use `fork_turns: none` and a self-
contained prompt. Tell agents not to redesign frozen interfaces.

Every prompt records the Node and package-manager versions from the contract
gate. Agents consume committed predecessor state rather than copied type snippets
when the filesystem is shared; the prompt names the authoritative paths so stale
copies cannot become a second contract.

Each packet owns its tests beside its implementation. Agents report changed
files, acceptance-command result, and blockers only. They do not produce a prose
walkthrough unless blocked.

Parallelism reduces elapsed time, not automatically token use. The recommended
two- or three-agent waves should add no more than roughly 10–20% coordination
tokens over a serial implementation. Unbounded fan-out or asking several agents
to implement the same module would likely add 50% or more.

## Merge discipline

- P0 owns the contract surface until the contract gate passes. Later changes
  return to the P0 owner with a failing invariant as evidence.
- Packets have exclusive file ownership; cross-packet edits are returned to the
  owning agent.
- New modules are preferred over concurrent moves of existing Jira files.
- Only P11 performs final moves, deletions, and compatibility cleanup.
- Every merge is gated by the packet's focused tests before the next dependency
  consumes it.
- Failed packets receive one narrow correction prompt; they are not restarted
  with the whole repository context.

## Definition of done

1. Backstage lists configured publication profiles and publishes through the
   selected profile.
2. Jira-only behavior remains idempotent and preserves existing records.
3. The Atlassian Discovery profile publishes the proposal to JPD and keeps
   reviews/delivery in their configured Jira destinations.
4. All projections resolve to the same canonical proposal revision and SHA-256.
5. Catalog routing and every authority invariant remain in the Publication
   Module, not an Adapter.
6. A third Adapter can be added without changing the browser artifact or public
   Publication Module interface.
7. The legacy Jira route and CLI delegate to the same Module during migration.
8. No duplicate orchestration path remains.
9. Hermetic contract and integration tests pass without external services.
10. Opt-in Atlassian sandbox tests demonstrate create and reconcile behavior.
