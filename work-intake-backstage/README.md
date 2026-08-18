# Work Intake Backstage Prototype

This is a standalone Backstage app for the work-intake prototype. Its catalog
models the fictional Northstar Research Network used by the decision-tree
prototype, and it uses the local development database.

For the plain-language explanation of every script, plugin, trust boundary, and
publication step, start with [How the Work Intake Prototype Works](HOW-IT-WORKS.md).
The canonical domain language is defined in [Work Governance Context](CONTEXT.md),
and the durable closed-loop direction is specified in
[Work Governance Control Plane](WORK-GOVERNANCE-CONTROL-PLANE-SPEC.md).
The implementation design for durable Work Proposals, deliberately smaller team
delivery records, typed Jira relationships, and the Registry-style Backstage
portfolio view is [Work Proposal Repository and Portfolio Explorer](WORK-PROPOSAL-PORTFOLIO-SPEC.md).

The catalog includes Northstar's organizational hierarchy, thirteen operating
and governance teams, three fictional requesters, eleven systems, their primary
components and resources, seven APIs, cross-system dependencies, and explicit
Jira-project routing metadata. Jira routing is recorded once on each owning
Group; consumers derive it by following an entity's `ownedBy` relation. The
source descriptors are under `examples/northstar/`.

To start the app, run:

```sh
podman compose up -d postgres
./yarn install
./yarn start
```

The frontend listens on <http://localhost:3000> and the backend listens on
<http://localhost:7007>.

## Work Intake page

Backstage exposes the decision-tree prototype at
<http://localhost:3000/work-intake> and adds **Work Intake** to its navigation.
The page embeds the existing `work-intake-decision-tree` interface
inside the Backstage shell. Its native toolbar loads the publication profiles
available to the signed-in user and provides one destination-neutral
**Publish** action. **Save** records the current state as the next immutable
Proposal Revision; incomplete evidence returns the saved revision and its
missing-evidence inventory through Assisted Intake. Select a scenario in the embedded
prototype, inspect or edit it, and publish when its route is **Work Proposal —
Ready for Ordered Review**.

The embedded prototype sends a versioned publication artifact to its Backstage
host on request. The Backstage frontend discovers the backend plugin through
Backstage service discovery; the backend validates the artifact and invokes the
Publication Module. Atlassian credentials never enter the browser. Backstage catalog
entities remain the authority for ownership, dependencies, and Jira routing.
System dependency edges are catalog annotations under
`northstar.example/depends-on`; Jira review projections are rebuilt from that
catalog closure and the owning Groups instead of trusting review or project
claims supplied by the browser artifact.

`packages/app/public/work-intake-assets` contains relative symbolic links to the
prototype's runtime HTML, CSS, JavaScript, and versioned form definitions rather
than copies. The decision-tree directory therefore remains the source of truth
without publishing its notes or tests; reload the Backstage page to see
prototype changes.

The project-local `yarn` wrapper runs the Yarn release pinned under `.yarn/`.
It exists because Fedora's Node.js package does not install a global Yarn or
Corepack launcher.

### Fresh-checkout demo setup

On another machine with Node.js 22 or 24 and the same repository checkout:

```sh
cd work-intake-backstage
podman compose up -d postgres
./yarn install
chmod 600 ~/.atlassian.env
./yarn jira:bootstrap
./yarn start
```

The bootstrap command above is a non-mutating preview and verifies the Backstage
catalog, Jira credentials, and required project set. Use
`./yarn jira:bootstrap --apply` only when the fictional projects are absent. No
Jira records need to be populated by hand. Open <http://localhost:3000>, enter as
the guest user, select **Work Intake**, and choose **Metrics selection** for the
complete demonstration.

## LAN HTTPS through nginx

The systemd deployment keeps Backstage's development listeners private on
`127.0.0.1:3000` and `127.0.0.1:7007`. nginx owns the LAN-facing ports:

- the default port-80 server returns a `301 Moved Permanently` to the same host,
  path, and query on HTTPS;
- port 443 terminates TLS;
- `/api/` proxies to the Backstage backend on port 7007; and
- every other path, including `/work-intake-assets/`, proxies to the frontend on
  port 3000.

Install or update the proxy for this machine with:

```sh
./deployment/install-local-https.sh 192.168.50.103
systemctl --user daemon-reload
systemctl --user restart work-intake-backstage.service
./deployment/check-local-https.sh 192.168.50.103
```

The installer renders the nginx template, opens the `http` and `https`
firewalld services, writes the matching `WORK_INTAKE_PUBLIC_URL` to
`~/.config/work-intake-backstage/lan-environment`, and creates a self-signed
certificate whose Subject Alternative Names include the supplied IP,
`127.0.0.1`, and `localhost`. Re-running it for the same IP preserves the
existing certificate. Passing a different IP replaces it.

The resulting entry point is
<https://192.168.50.103/work-intake>. Browsing to the corresponding HTTP URL
redirects to HTTPS. The browser must explicitly accept the self-signed
certificate, or the public certificate can be imported from
`/etc/pki/nginx/work-intake/server.crt` into the relevant trust store.

On another machine, pass that machine's LAN IP to the same installer. No source
file needs to be rewritten: the rendered nginx configuration and systemd
environment file carry the machine-specific address.

## Run as a user service

The included user-level systemd unit runs Backstage in the background without
requiring root. From this directory, install and start it with:

```sh
systemctl --user link "$PWD/systemd/work-intake-backstage.service"
systemctl --user daemon-reload
systemctl --user enable --now work-intake-backstage.service
```

The unit intentionally targets this workstation's checkout under
`%h/Documents/code/dishpitprodigy/organizational-philosophies`. If the checkout
moves, update its `Documentation`, `WorkingDirectory`, and `ExecStart` paths
before relinking it.

The unit loads both `app-config.yaml` and `app-config.lan.yaml`; run the HTTPS
installer first so `~/.config/work-intake-backstage/lan-environment` exists.
Backstage is then available through nginx at the HTTPS URL for that LAN address.
Common controls are:

```sh
systemctl --user status work-intake-backstage.service
systemctl --user restart work-intake-backstage.service
systemctl --user stop work-intake-backstage.service
journalctl --user --unit work-intake-backstage.service --follow
```

The unit starts automatically with the user's systemd session. Before starting
it, stop any manually launched `./yarn start` process so ports 3000 and 7007 are
available.

The optional integration environment file
`~/.config/work-intake-backstage/environment` can supply integration settings
without storing secrets in the repository. Use one `NAME=value` assignment per
line, then restart the service. The separate `lan-environment` file is managed
by the HTTPS installer and contains only the public Backstage URL.

## Publication profiles

The backend initially exposes two server-defined profiles:

- **Jira Work Management** publishes proposals and ordered reviews to `NWI`,
  then sends authorized delivery to catalog-routed Jira projects.
- **Atlassian Discovery** publishes the proposal as an Idea in the `MDP` Jira
  Product Discovery project, while reviews and authorized delivery retain their
  Jira placements.

The browser chooses a profile, never arbitrary project keys or endpoints. The
backend validates authority, resolves catalog facts, creates destination-neutral
records and relations, and then invokes the configured Jira or JPD Adapter. Add
later destinations by implementing the publication target and artifact-store
ports; intake artifacts and the browser interface do not change.

The generic backend API is:

```text
GET  /api/work-intake-publication/profiles
POST /api/work-intake-publication/preview
POST /api/work-intake-publication/publish
POST /api/work-intake-publication/proposals
GET  /api/work-intake-publication/proposals/:id
GET  /api/work-intake-publication/proposals/:id/:revision
```

`/api/work-intake-jira` remains a compatibility route that delegates to the
`jira-work-management` profile.

## Atlassian configuration

The Jira scripts treat Backstage as the source of organizational structure and
routing metadata. They authenticate to the local Backstage catalog, read Group
entities, and derive Jira project keys from
`northstar.example/jira-project-key`. Nothing needs to be entered in Jira by
hand.

Credentials live outside the repository in `~/.atlassian.env` by default:

```sh
ATLASSIAN_URL=https://example.atlassian.net
ATLASSIAN_EMAIL=account@example.com
ATLASSIAN_TOKEN=replace-me
```

The credential file must be readable only by its owner:

```sh
chmod 600 ~/.atlassian.env
```

Set `ATLASSIAN_ENV_FILE` to use another location. The scripts resolve this path
themselves; package commands do not contain a workstation-specific credential
path.

### Bootstrap projects

The bootstrapper creates one `NWI` intake project and one project for each
Backstage Group whose `spec.type` is `team`. Governance Groups participate in
review and authority records within `NWI`; the bootstrapper does not pretend
that each governance authority needs a delivery queue.

```sh
# Preview; changes nothing
./yarn jira:bootstrap

# Create only projects that do not already exist
./yarn jira:bootstrap --apply
```

Both commands query the live Backstage catalog and Jira site. Repeated applies
converge without recreating projects.

### Publish an artifact

`scripts/jira/publish.mjs` is a compatibility client for the running Backstage
Publication Module. It consumes a versioned JSON artifact and calls the generic
preview or publish API with the `jira-work-management` profile. The backend then
resolves owner entities, routes, and the affected-entity dependency closure
through the live catalog. An artifact cannot supply its own trusted project key.
It publishes a Work Proposal and its ordered review records to `NWI`.
Candidate delivery records are created in their owning teams' projects only
when the artifact contains all of the following:

- an explicit Authorized Work Proposal whose state is `Authorized`;
- an exact match to the governing proposal id and revision;
- a Planning Interval;
- an Acceptance Authority; and
- an accepted Capacity Acceptance for every implicated delivery project.

That check is deliberate: completing intake or clearing specialist review does
not commit a delivery team's capacity. Candidate work remains in the artifact
when those decisions do not exist.

Start Backstage before using the CLI. The metrics example is a Reviewable Work Proposal, so its dry run shows the
catalog-derived `NWI` proposal and review projections with no delivery issues:

```sh
./yarn jira:publish:sample
./yarn jira:publish:sample --apply
```

For another artifact:

```sh
node scripts/jira/publish.mjs path/to/artifact.json
```

Publication identities include profile, placement, Adapter, concrete target,
proposal id and revision, and local record id. PostgreSQL owns the canonical
Proposal Lineage, immutable Proposal Revisions, one-per-profile publication
claim, normalized Publication Results, and per-projection reconciliation
records. Before external work, the backend atomically claims the proposal
revision and profile. After Jira responds, it retains every external identity
and the complete receipt. A completed retry returns that receipt; a failed
attempt retains partial results and can repair the same logical publication
without creating a second one. Publication claims use expiring, fenced attempt
identifiers: a process crash can be reclaimed, while a late abandoned attempt
cannot overwrite the repair attempt's result. Healthy workers renew the lease
while external work is in progress.
Cross-project delivery dependencies use Jira issue links; candidate delivery
records are related to—but are not children of—the intake record.

The Module durably stores the catalog-routed canonical JSON as a
content-addressed attachment on the profile's proposal anchor—an `NWI` issue or
an `MDP` Idea—before dependent review or delivery placements begin. Retries
verify and reuse the same attachment; changed JSON under the same proposal
revision is rejected. PostgreSQL also retains the catalog-routed canonical JSON,
its SHA-256, schema version, generator provenance, and reconciliation metadata.
Jira's attachment remains a projection of that authoritative revision.

The same publisher is exposed through the Work Intake page. Repeated clicks are
safe: PostgreSQL constraints, database reconciliation records, and Jira labels
reconcile the same proposal revision and local record ids to the existing issues
instead of creating duplicates.

## PostgreSQL persistence

The prototype uses PostgreSQL by default, including local development. Start the
included PostgreSQL 18 service with `podman compose up -d postgres`; its named
volume survives container recreation. The checked-in credentials are local-only
and bind PostgreSQL to `127.0.0.1`. Production continues to read
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
`POSTGRES_DB` from `app-config.production.yaml`.

PostgreSQL is dedicated to the Work Intake control plane. The
`work-intake-publication` plugin connects to database `work_intake` through a
plugin-specific Backstage database override. Other prototype Backstage plugins
retain their default ephemeral SQLite storage and do not create PostgreSQL
databases.

If the named volume predates this dedicated-database configuration, stop the
Backstage backend and migrate its former plugin database before starting the
new configuration:

```sh
systemctl --user stop work-intake-backstage.service
./yarn postgres:migrate-dedicated
systemctl --user start work-intake-backstage.service
```

The guarded migration renames
`backstage_plugin_work-intake-publication` to `work_intake` inside PostgreSQL,
so Proposal Lineages, revisions, and publication receipts keep their existing
identities. It is idempotent when only `work_intake` exists and refuses to
overwrite anything when both database names exist. Set
`WORK_INTAKE_LEGACY_DATABASE` only if the prior plugin database used a different
name. Take a volume snapshot or `pg_dump` before any production cutover.

The backend applies its Knex migrations at startup. The schema includes Proposal
Lineages and immutable Proposal Revisions, Decisions, Authorized Work,
Deliverables, Outcome Observations, Closure Decisions, Publications, Publication
Results, and reconciliation journal entries. PostgreSQL triggers reject updates
and deletes to append-only governance records.
Jira's immutable issue id and human-readable issue key are stored separately;
attachment ids returned during publication are retained with the receipt.
Proposal lineage reads and writes are restricted to the authenticated lineage
owner in this prototype.

The normal test suite is hermetic. To exercise one disposable JPD Idea against
the configured Atlassian sandbox, run the focused opt-in test with
`WORK_INTAKE_JPD_SANDBOX=1`; the created Idea is prefixed `[DISPOSABLE]` and may
be deleted afterward.

Run the retained PostgreSQL integration suite against the local service with
`./yarn test:postgres`. It creates an isolated schema, applies the production
migrations, verifies that only the Work Intake plugin is routed to PostgreSQL,
checks immutable lineage and fenced publication behavior, and drops only that
schema afterward.

```sh
WORK_INTAKE_JPD_SANDBOX=1 ./yarn workspace backend test \
  --runTestsByPath src/workIntakePublication/adapters/atlassian/jpdTarget.sandbox.test.ts \
  --watch=false
```
