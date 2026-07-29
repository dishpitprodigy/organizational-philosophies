# Work Intake Decision Tree — Throwaway Prototype

This static prototype demonstrates how a fictional software engineering company might gather factual intake information and translate it into deterministic routing guidance. It does not connect to Jira, ServiceNow, or any other ticketing system, and it does not create tickets.

## Run it

From this directory:

```bash
./serve.sh
```

Then open <http://localhost:8000/?variant=A>.

The three deliberately different layouts share the same questions and routing engine:

- `?variant=A` — guided, step-by-step interview
- `?variant=B` — complete proposal worksheet with a live result panel
- `?variant=C` — conversational intake with a routing-map result

Use the floating arrows or the keyboard's left and right arrow keys to switch variants. The URL remains shareable.

Scenario presets populate fictional examples for a metrics-platform migration, an SSO migration, and an identity-provider migration.

## Prototype boundaries

- All state is in browser memory.
- All routing is deterministic JavaScript, not AI.
- Ticket identifiers, stakeholders, reviews, and subtasks are illustrative.
- This code intentionally lacks production hardening and should be deleted or rewritten after it answers the design question.
