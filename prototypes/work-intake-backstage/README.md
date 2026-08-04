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

`packages/app/public/work-intake-assets` is a relative symbolic link to that
prototype rather than a copy. The original HTML, CSS, and JavaScript therefore
remain the source of truth; reload the Backstage page to see prototype changes.

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
