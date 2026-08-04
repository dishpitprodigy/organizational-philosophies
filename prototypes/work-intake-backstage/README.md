# Work Intake Backstage Prototype

This is a standalone Backstage app for the work-intake prototype. Its catalog
models the fictional Northstar Research Network used by the decision-tree
prototype, and it uses the local development database.

The catalog includes Northstar's organizational hierarchy, thirteen operating
and governance teams, three fictional requesters, eleven systems, their primary
components and resources, seven APIs, cross-system dependencies, and explicit
Jira-project routing metadata. Jira routing is recorded once on each owning
Group; consumers derive it by following an entity's `ownedBy` relation. The
source descriptors are under `examples/northstar/`.

To start the app, run:

```sh
./yarn install
./yarn start
```

The frontend listens on <http://localhost:3000> and the backend listens on
<http://localhost:7007>.

## Work Intake page

Backstage exposes the decision-tree prototype at
<http://localhost:3000/work-intake> and adds **Work Intake** to its navigation.
The page embeds the existing `prototypes/work-intake-decision-tree` interface
inside the Backstage shell.

`packages/app/public/work-intake-assets` contains relative symbolic links to the
prototype's four runtime files rather than copies. The original HTML, CSS, and
JavaScript therefore remain the source of truth without publishing its notes or
helper files; reload the Backstage page to see prototype changes.

The project-local `yarn` wrapper runs the Yarn release pinned under `.yarn/`.
It exists because Fedora's Node.js package does not install a global Yarn or
Corepack launcher.

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

Backstage is then available at <http://localhost:3000>. Common controls are:

```sh
systemctl --user status work-intake-backstage.service
systemctl --user restart work-intake-backstage.service
systemctl --user stop work-intake-backstage.service
journalctl --user --unit work-intake-backstage.service --follow
```

The unit starts automatically with the user's systemd session. Before starting
it, stop any manually launched `./yarn start` process so ports 3000 and 7007 are
available.

The optional environment file
`~/.config/work-intake-backstage/environment` can supply integration settings
without storing secrets in the repository. Use one `NAME=value` assignment per
line, then restart the service. The file is not required for the local demo.

## Jira prototype

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

`scripts/jira/publish.mjs` consumes a versioned JSON artifact, then resolves its
owner entities, Jira routes, and affected-entity dependency closure through the
live Backstage catalog. An artifact cannot supply its own trusted Jira project
key. It publishes a Work Proposal and its ordered review records to `NWI`.
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

The metrics example is a Reviewable Work Proposal, so its dry run shows nine
`NWI` projections and no delivery issues:

```sh
./yarn jira:publish:sample
./yarn jira:publish:sample --apply
```

For another artifact:

```sh
node scripts/jira/publish.mjs path/to/artifact.json
```

Publication labels are derived from proposal id, revision, and local record id.
The publisher serializes local publication through an owner-only ledger at
`~/.local/state/work-intake-backstage/jira-publications.json`. Before a create,
it records an in-progress reservation; after the Jira response, it records the
issue key. A retry reconciles an existing Jira label, reuses a recorded key, or
stops on an indeterminate create instead of risking a duplicate. Set
`JIRA_PUBLICATION_LEDGER` to move the ledger. Cross-project delivery
dependencies use Jira issue links; candidate delivery records are related
to—but are not children of—the intake record.
