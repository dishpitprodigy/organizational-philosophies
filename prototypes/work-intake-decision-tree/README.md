# Work Intake Decision Tree — Throwaway Prototype

This static prototype demonstrates how a fictional research-technology company might turn authenticated demand into a service route, a framed Work Proposal, ordered review records, and candidate delivery records without pretending that routing is authorization or Capacity Acceptance.

Its language and lifecycle come from:

- `Work-Intake-Is-an-Organizational-System.md`;
- `Framing-Technical-Work-Before-Design.md`; and
- `Writing Work Items - Epics, Stories, and Tasks.md`;
- `RFPs-and-Vendor-Selection-as-Evidence-Systems.md`; and
- `0.rfp-process-notes.md`.

When run by itself, it does not connect to Jira, ServiceNow, or any other ticketing system, and it does not create requests, reviews, approvals, or delivery work. When embedded by the sibling Backstage prototype, it can provide a versioned publication artifact only after an explicit request from its same-origin host. Backstage owns the publication action and the Jira connection.

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

Scenario presets populate evidence-complete fictional examples for a metrics capability selection, an SSO migration, and identity-platform Discovery. Their counts, component inventories, measurements, costs, dates, requirements, failure conditions, and acceptance thresholds are internally consistent demonstrations, not statements about a real organization.

## Guided evidence capture

The browser does not ask a requester to author each Work Proposal section as one undifferentiated essay. It captures atomic facts and assembles the canonical artifact language from them:

- Current State separates the authoritative baseline, live architecture, measured workload, observed failure/lifecycle/cost/operator behavior, and explicit delta.
- Desired Outcome separates operating scope, capability or removed failure mode, decisive proof, and operating horizon.
- Required Difference separates what must be preserved, what measured condition must change, and the evidence used for comparison.
- Requirements are repeatable `will` / `shall` / `should` records with stable identifiers and required verification methods.
- Acceptance Conditions are repeatable observable results with retained proof.
- Timing, dependencies, preconditions, Discovery phases, reusable artifacts, and candidate Epic outcomes each have their own evidence-shaped fields.

New or edited proposals remain drafts when these atomic fields are incomplete. The generated prose is inspectable in the form, but requesters supply facts; they do not select priority, size, reviewers, or another team's capacity.

The metrics scenario is deliberately much deeper than the others. It treats RFP logic as the invariant Capability Decision Loop for internal redesign, open-source adoption, vendor selection, or retaining the current system. Its result includes a referenced Current-State Baseline and explicit delta, explicit record boundaries, a measurement ledger, `will` / `shall` / `should` requirements, option claims, POC gates, Evidence-System Tailoring decisions, and the acceptance contract a later implementation proposal must satisfy. Historical ADRs remain with the systems they govern; selection produces a Selection Decision Record, not an ADR.

## Fictional company

Northstar Research Network operates shared research-computing and secure data-transfer services for universities and medical-research institutions. Its operating model includes Network Engineering, Systems Engineering, Data Center Operations, Platform Engineering, SRE, Application Engineering, Data Platform Engineering, Identity Engineering, Security, Architecture, Portfolio, Finance, and Privacy.

The prototype names the systems those teams own and models cross-system dependencies. Selecting an affected system derives additional dependencies, technical reviewers, and Capacity Owners. Those derived routes remain claims about participation: they do not commit another team's capacity.

## Code shape

- `model.js` contains the pure fictional-company and lifecycle logic.
- `app.js` is the throwaway browser shell shared by the three interaction variants.
- `styles.css` is intentionally prototype-only presentation.

## Prototype boundaries

- All state is in browser memory.
- The standalone prototype has no publication control; only its Backstage host can request the current artifact.
- All routing is deterministic JavaScript, not AI.
- Proposal identifiers, people, systems, review rules, financial thresholds, and sizing thresholds are illustrative.
- A reviewable Work Proposal is not shown as an Authorized Work Proposal.
- Candidate Initiatives, Epics, and Discovery Work Packages are planning outputs, not authorized implementation.
- Every scenario's architecture, identifiers, changes, workload, people, dates, costs, and requirements are fictional. The one-month, three-month, and two-year retention topology is informed by an earlier implementation pattern, but every number shown by the prototype was created for Northstar and does not disclose a real company's production measurements.
- This code intentionally lacks production hardening and should be deleted or rewritten after it answers the design question.
