# How the Work Intake Prototype Works

## Executive summary

The form describes proposed work. Backstage decides where that proposal belongs. Jira stores the resulting records. Those are three different jobs, and the prototype keeps them separate so a requester cannot create authority merely by filling in a form.

When someone presses **Publish to Jira**, the browser asks the embedded intake form for its current Work Proposal. The browser sends that proposal to an authenticated Backstage backend plugin. The backend reads the Backstage catalog again to determine affected systems, dependencies, owning teams, reviewers, and Jira projects. It does not trust the browser to supply those decisions.

The publisher first builds a plan. A normal Reviewable Work Proposal produces one proposal record and its required review records in the `NWI` Jira project. Candidate Discovery, Initiative, and Epic records remain candidates unless the artifact also contains the Authorized Work Proposal, Planning Interval, Acceptance Authority, and Capacity Acceptances required to create delivery work. Completing intake does not silently commit another team's capacity.

Every Jira record receives a stable publication label derived from the proposal identifier, proposal revision, and local record identifier. A local ledger records whether each publication is being created or has been published. On retry, the publisher reuses or reconciles the same Jira issue; if it cannot tell whether an earlier create succeeded, it stops instead of risking a duplicate.

The deployment scripts solve a separate problem: they run Backstage as a user service, keep ports 3000 and 7007 on loopback, and expose one nginx HTTPS endpoint to the local network. Port 80 performs a catch-all redirect to HTTPS. The certificate is self-signed because this is a transferable internal demonstration, not a public service.

## The smallest useful mental model

A plugin lives inside Backstage and waits for requests. A script starts, performs one bounded job, reports the result, and exits.

The two work-intake plugins are local to the applications that run them:

- the frontend plugin lives under `packages/app/src/plugins/workIntake/`; and
- the backend plugin lives under `packages/backend/src/workIntakeJira/`.

They are called plugins because Backstage loads them through its frontend and backend plugin systems.

| Piece              | Its one job                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Intake form        | Collect and structure facts about proposed work.                                          |
| Frontend plugin    | Show the form and provide the deliberate Publish button.                                  |
| Backend plugin     | Guard the server-side publication boundary.                                               |
| Backstage catalog  | State which systems depend on which systems, who owns them, and where their work belongs. |
| Jira scripts       | Convert an accepted artifact and catalog structure into a repeatable publication plan.    |
| Publication ledger | Remember what was already created and stop unsafe retries.                                |
| Jira               | Store visible projections of proposals, reviews, and properly authorized delivery work.   |
| nginx and systemd  | Keep the demonstration running and expose it safely enough for a local network.           |

## The whole system in one picture

```text
Requester
   |
   | fills in facts
   v
Decision-tree form in an iframe
   |
   | versioned publication artifact
   v
Backstage frontend plugin
   |
   | authenticated POST /api/work-intake-jira/publish
   v
Backstage backend plugin
   |
   | temporary JSON file; invokes publisher
   v
Jira publication scripts
   |                    |
   | reads structure    | creates/reuses records
   v                    v
Backstage catalog      Jira Cloud
```

The direction of trust matters: the publisher accepts proposal facts from the form, but it accepts organizational ownership and routing only from the Backstage catalog.

## What happens when someone presses Publish to Jira

1. The frontend verifies that the Jira health check succeeded. If Jira is unavailable, the button remains disabled.
2. The frontend sends a same-origin message to the embedded form: “Give me the artifact for the state currently on screen.”
3. The form evaluates its own readiness. An incomplete draft returns an error instead of an artifact that can be published.
4. The frontend sends the artifact to the backend plugin using Backstage's authenticated fetch client.
5. The backend verifies that the caller is an authenticated Backstage user and that the request has the minimum publication shape.
6. The backend writes the artifact to an owner-only temporary file and invokes `publish.mjs --apply --json` as a child process. The temporary file is deleted afterward.
7. `publish.mjs` authenticates to the local Backstage catalog, follows every affected system's dependency closure, finds the owning Groups, and rebuilds the ordered review route.
8. The planner converts the routed artifact into Jira issue projections and relationship projections. This remains a plan until the publisher reaches the apply stage.
9. The publication ledger locks publication so two clicks cannot publish concurrently. For each projection, it reuses a known issue, reconciles an existing matching issue, creates a missing issue, or stops when the previous result is indeterminate.
10. The backend returns the Jira issue keys to the page. The page reports what was published; it does not reinterpret the result as delivery authorization.

## The frontend plugin

The frontend plugin is the part a user sees. It adds the **Work Intake** navigation entry and owns the page at `/work-intake`.

### `packages/app/src/plugins/workIntake/plugin.tsx`

This file registers one Backstage page:

- path: `/work-intake`;
- title: `Work Intake`;
- icon: the account-tree icon; and
- page component: `WorkIntakePage`.

It does not contain intake rules, Jira credentials, or publication logic. Its job is to make the page exist inside Backstage.

### `packages/app/src/plugins/workIntake/WorkIntakePage.tsx`

This component has three responsibilities:

1. ask Backstage service discovery for the backend plugin's URL;
2. call the backend health endpoint and enable the publication button only when Jira is available; and
3. embed the existing decision-tree prototype in an iframe.

When the user publishes, the page obtains the current artifact from the iframe and sends it to the backend. The page never reads `~/.atlassian.env`; credentials remain on the server.

### `packages/app/src/plugins/workIntake/artifactBridge.ts`

The artifact bridge is a narrow conversation between the Backstage page and the iframe:

- it generates a unique request identifier;
- it sends `northstar:work-intake:artifact-request` to the iframe;
- it accepts a response only from that iframe, for that request identifier, on the same browser origin; and
- it stops waiting after five seconds.

The request identifier prevents one response from satisfying the wrong click. The frontend accepts a response only from the embedded frame; the outbound message names the current Backstage origin, and the form independently checks both its parent and that origin before answering.

## The backend plugin

The backend plugin is the publication boundary. It is deliberately small: authenticate the user, validate the request envelope, invoke the scripts, and return the result.

### `packages/backend/src/workIntakeJira/plugin.ts`

This file registers the `work-intake-jira` backend plugin with Backstage. It receives Backstage's HTTP authentication, HTTP router, and logger services, then attaches the plugin router.

### `packages/backend/src/workIntakeJira/router.ts`

The router exposes two endpoints:

| Endpoint        | Purpose                                                     | State change            |
| --------------- | ----------------------------------------------------------- | ----------------------- |
| `GET /health`   | Verify the authenticated user and test the Jira connection. | None                    |
| `POST /publish` | Validate and publish a work-intake artifact.                | May create Jira records |

Both endpoints require a Backstage user identity. The publish endpoint accepts no more than 1 MiB of JSON and requires schema version 1, a proposal identifier, and at least one affected Backstage entity before it will invoke the publisher.

The router's schema check is an entrance check, not the entire governance model. The publication planner performs the deeper checks because those checks also protect command-line publication.

### `packages/backend/src/workIntakeJira/command.ts`

The command service adapts TypeScript plugin calls to the existing Node.js scripts:

- `health()` invokes `scripts/jira/health.mjs`;
- `publish(artifact)` writes an owner-only temporary JSON file and invokes `scripts/jira/publish.mjs --apply --json`;
- only the final JSON line is accepted as the command result; and
- temporary publication files are removed whether the command succeeds or fails.

This adapter lets the browser use the same publisher that can be inspected and run from a terminal. There is one publication mechanism, not a UI implementation and a separate CLI implementation that may drift.

## The Jira scripts

### `scripts/jira/environment.mjs`

This loader reads Atlassian settings from `~/.atlassian.env`, unless `ATLASSIAN_ENV_FILE` names another file. It does not print the token and does not send it to the frontend.

Expected values:

```text
ATLASSIAN_URL=https://example.atlassian.net
ATLASSIAN_EMAIL=account@example.com
ATLASSIAN_TOKEN=secret-token
```

### `scripts/jira/health.mjs`

The health script asks Jira two read-only questions: “Who am I?” and “Which projects can I see?” It returns a small JSON result containing the account name and project keys. A successful health check proves that the configured credentials can reach Jira; it does not prove that a proposal is ready or that the account may create every required record.

### `scripts/jira/bootstrap.mjs`

Bootstrap makes the fictional Jira project structure agree with the Backstage catalog.

It reads every Backstage Group whose `spec.type` is `team`, reads that Group's Jira project annotation, compares the required projects with Jira's existing projects, and produces only the missing project definitions. It also includes the central `NWI` intake project.

Its default behavior is a dry run:

```sh
./yarn jira:bootstrap
```

The dry run prints what would be created and changes nothing. Creation requires an explicit apply:

```sh
./yarn jira:bootstrap --apply
```

Repeated applies converge because existing project keys are removed from the plan.

### `scripts/jira/publish.mjs`

Publish turns one versioned work-intake artifact into Jira issue projections.

Its default behavior is also a dry run:

```sh
node scripts/jira/publish.mjs artifact.json
```

The dry run reads the artifact and Backstage catalog, derives routing, validates authority, and prints the issues and links it would create. Jira changes require `--apply`. The Backstage backend always supplies `--apply` because pressing the UI button is itself the explicit publication action.

The publisher does not accept a Jira project key from the artifact as authoritative. It replaces any such claim with the project key attached to the owning Backstage Group.

### `scripts/jira/planning.mjs`

Planning contains the governance rules. It performs four distinct jobs.

#### 1. Resolve dependencies

The planner starts with the affected Backstage entities supplied by the proposal and follows both catalog `dependsOn` relations and the prototype's dependency annotation. The result is the complete affected-entity closure, not merely the systems the requester remembered to select.

#### 2. Resolve owners and reviews

The planner finds each affected entity's owning Group, reviewer role, review profile, tags, and Jira project annotation. It creates the administrative review first, adds conditional Security, Privacy, Finance, Architecture, and Reliability reviews, then adds technical reviews for affected delivery teams.

#### 3. Enforce delivery authority

A Reviewable Work Proposal creates the proposal and review records in `NWI`; it does not create delivery records. Candidate delivery is published only when all of these exist and agree:

- `candidateDelivery.authorized` is true;
- an Authorized Work Proposal has state `Authorized`;
- that authorization governs the same proposal identifier and revision;
- a Planning Interval exists;
- an Acceptance Authority has recorded `Accepted`; and
- every implicated delivery project has an accepted Capacity Acceptance.

Missing one condition stops delivery publication. The planner does not average these decisions into “probably authorized.”

#### 4. Build Jira projections

The planner maps records as follows:

| Organizational record                 | Jira projection                   |
| ------------------------------------- | --------------------------------- |
| Work Proposal                         | Epic in `NWI`                     |
| Ordered review record                 | Task under the `NWI` proposal     |
| Authorized Discovery Work Package     | Task in the owning team's project |
| Authorized Initiative or Epic         | Epic in the owning team's project |
| Delivery dependency                   | `Blocks` issue link               |
| Delivery record to governing proposal | `Relates` issue link              |

The Jira hierarchy is a projection of organizational decisions; creating or moving a Jira issue does not create those decisions retroactively.

### `scripts/jira/clients.mjs`

The clients file contains the HTTP mechanics:

- `BackstageCatalogClient` obtains a guest Backstage token and reads catalog entities;
- `JiraClient` authenticates with Atlassian, lists and creates projects, searches for existing publication labels, creates issues, and creates missing issue links; and
- `toAdf()` converts plain descriptions into Atlassian Document Format.

Every non-success HTTP response becomes an error containing the operation and returned detail. The callers decide whether that error is safe to retry.

### `scripts/jira/ledger.mjs`

The ledger prevents duplicate or conflicting publication.

Its default location is:

```text
~/.local/state/work-intake-backstage/jira-publications.json
```

Before creating an issue, the publisher records a `creating` reservation. After Jira returns the issue key, it records `published`. Each record also carries a fingerprint of the projected project, type, parent, summary, description, and labels.

On a later run:

- a matching published record is reused;
- a matching Jira issue missing from the ledger is reconciled into it;
- changed content with the same proposal revision is rejected; and
- an unresolved `creating` reservation stops publication rather than guessing whether Jira created the issue.

The ledger uses an owner-only lock file so two publishers cannot operate concurrently. Writes use a temporary file followed by rename so a partial write does not replace the last complete state.

## The commands in `package.json`

The `scripts` block gives memorable names to commands implemented elsewhere. These aliases do not add another processing layer.

| Command                      | What it does                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `./yarn start`               | Starts the Backstage frontend and backend in development mode. The systemd unit adds the LAN configuration files. |
| `./yarn build:backend`       | Builds only the deployable backend package.                                                                       |
| `./yarn build:all`           | Builds every workspace package.                                                                                   |
| `./yarn build-image`         | Builds the backend container image through Backstage's build tooling.                                             |
| `./yarn tsc`                 | Runs the repository TypeScript check using the normal incremental configuration.                                  |
| `./yarn tsc:full`            | Runs the TypeScript check without incremental shortcuts and without skipping library checks.                      |
| `./yarn clean`               | Removes Backstage-generated build output and caches.                                                              |
| `./yarn test`                | Runs the normal Backstage unit-test command.                                                                      |
| `./yarn test:all`            | Runs Backstage unit tests with coverage.                                                                          |
| `./yarn test:jira`           | Runs the Jira client, planning, and ledger tests.                                                                 |
| `./yarn test:decision-tree`  | Runs the standalone intake model tests.                                                                           |
| `./yarn test:e2e`            | Runs Playwright against the assembled browser application.                                                        |
| `./yarn jira:bootstrap`      | Runs `bootstrap.mjs`; it remains a dry run unless `--apply` is appended.                                          |
| `./yarn jira:publish:sample` | Runs `publish.mjs` with the Metrics example; it remains a dry run unless `--apply` is appended.                   |
| `./yarn lint`                | Lints changes relative to `origin/master`.                                                                        |
| `./yarn lint:all`            | Lints the entire repository.                                                                                      |
| `./yarn fix`                 | Lets Backstage apply its supported dependency and repository fixes. Review the resulting changes.                 |
| `./yarn new`                 | Opens Backstage's package generator. It is development scaffolding, not part of work intake or publication.       |

## Deployment scripts and service files

### `deployment/install-local-https.sh`

This is a state-changing machine setup script. Given one LAN IPv4 address, it:

1. renders the nginx and Backstage environment templates;
2. generates a self-signed certificate when the installed certificate does not cover that IP;
3. installs the certificate, private key, and nginx configuration;
4. verifies nginx configuration before reload;
5. enables and reloads nginx;
6. opens the `http` and `https` firewalld services; and
7. records the public Backstage URL in `~/.config/work-intake-backstage/lan-environment`.

It requires `sudo` because it changes `/etc`, nginx, and the firewall. Re-running it for the same IP preserves the certificate; using another IP creates a matching replacement.

### `deployment/check-local-https.sh`

This is a read-only deployment check. It verifies:

- HTTP returns the catch-all 301 redirect to the same HTTPS URL;
- the HTTPS application page returns HTML;
- `app.js` and `model.js` return JavaScript rather than an HTML fallback; and
- both JavaScript files pass Node's syntax check.

The HTML check captures the specific failure that Firefox reports as `expected expression, got '<'`.

### `deployment/nginx-work-intake.conf.template`

The rendered nginx configuration owns the public boundary:

- the default port-80 server redirects every hostname to HTTPS;
- port 443 terminates TLS;
- `/api/` goes to the loopback Backstage backend on port 7007; and
- the application, iframe, static assets, and development WebSocket traffic go to the loopback frontend on port 3000.

Development responses receive `Cache-Control: no-store` so a browser does not retain a failed hot-reload response.

### `systemd/work-intake-backstage.service`

The user service starts Backstage from the repository without occupying a terminal. It loads the base and LAN configuration files, reads the installer-managed public URL, reads optional integration settings, restarts after a process failure, and sends output to the user journal.

It does not run as root. nginx owns the privileged network ports; Backstage owns only its two loopback listeners.

## What the system does not do

- It does not treat a completed form as an Authorized Work Proposal.
- It does not trust requester-supplied project keys, reviewer lists, or dependency closure.
- It does not commit delivery capacity because a team appears in a route.
- It does not create Jira records during dry runs.
- It does not place Atlassian credentials in browser code or repository configuration.
- It does not currently consume webhooks or act as an event manager. Publication is a synchronous, user-initiated request.
- It does not make Jira the source of organizational authority. Jira stores projections of decisions made elsewhere.

## Short operational reference

```sh
# Start, stop, and inspect Backstage
systemctl --user restart work-intake-backstage.service
systemctl --user status work-intake-backstage.service
journalctl --user --unit work-intake-backstage.service --follow

# Install or update LAN HTTPS
./deployment/install-local-https.sh 192.168.50.103

# Check redirect, TLS route, and JavaScript assets
./deployment/check-local-https.sh 192.168.50.103

# Inspect Jira project bootstrap without changing Jira
./yarn jira:bootstrap

# Create only missing Jira projects
./yarn jira:bootstrap --apply

# Inspect a sample publication without changing Jira
./yarn jira:publish:sample

# Publish the sample deliberately
./yarn jira:publish:sample --apply
```
