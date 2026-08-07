# Prototype Notes

## Question

Can one deterministic lifecycle make the boundaries among service work, Assisted Intake, a Draft Work Proposal, framing, bounded Discovery, ordered review, authorization, Capacity Acceptance, and delivery work visible without letting one artifact silently acquire another artifact's authority?

The prototype must also answer a second question: can a fictional company's service ownership and dependency map derive organizational consequences from requester-supplied facts without asking the requester to select reviewers, project size, enterprise priority, or another team's capacity commitment?

## Current model

The shared domain model now represents:

1. **Front door:** Incident / Break-Fix, Standard Service Request, General Inquiry, Assisted Intake, or proposed change.
2. **Provenance and sponsorship:** an authenticated requester authors demand; a Work Sponsor accepts a specific proposal revision.
3. **Work Proposal evidence:** Current State, Desired Outcome, Required Difference, Requirements, Acceptance Conditions, Non-Goals, Dependencies, Known Uncertainty, Timing Evidence, Operational Ownership, and Acceptance Authority.
4. **Five-Box Framing Scaffold:** primary intent, preconditions, Non-Goals, reusable artifact, and downstream work enabled.
5. **Separate consequence views:** Delivery Capacity Profile, Delivery Size Class, Financial Commitment Class, and Work Proposal Risk Profile.
6. **Ordered review:** Administrative Authority, Security when triggered, then specialist financial, architecture, reliability, privacy, and technical review records.
7. **Capacity Acceptance:** every implicated delivery function retains its own Capacity Owner and remains uncommitted merely because routing identified it.
8. **Candidate delivery structure:** Known Uncertainty produces a bounded Discovery Work Package; one top-level outcome produces an Epic candidate, while several independently valuable outcomes produce an Initiative candidate containing Epics.
9. **Capability Decision Loop:** the metrics case applies one invariant evidence sequence to status quo, internal redesign, maintained open source, managed service, and commercial product options.
10. **Current-State reuse:** every decision resolves a versioned Current-State Baseline, but a proposal may reference the baseline and record only its explicit delta.
11. **Record boundaries:** historical ADRs stay with the systems they govern and may inform later design; selection produces a Selection Decision Record, never an ADR.
12. **Evidence-System Tailoring:** ceremony and controls scale independently from the evidence obligations; the prototype shows which RFP controls are retained, conditional, or deferred.

## What the first pass established

- **Assisted Intake is not an incomplete-proposal bucket.** It explains the process and returns missing decisions to their owners; substantive research crosses into sponsored Discovery.
- **A sponsor name is not sponsorship.** The model needs an explicit acceptance act tied to the proposal revision.
- **Routing is not authorization.** The output stops at a reviewable Work Proposal and shows the Authorized Work Proposal as pending.
- **Review is not Capacity Acceptance.** Specialist approval does not commit a delivery team's capacity within a Planning Interval.
- **Hierarchy cannot be inferred from effort.** The prototype needs the shape of independently valuable outcomes before it can distinguish an Epic from an Initiative.
- **The fake company is part of the logic.** Without named service ownership and dependencies, reviewer and team routing is arbitrary decoration.
- **Selection and migration are different commitments.** The metrics scenario is Discovery because the target is not yet selected; its output may frame a later migration proposal but cannot authorize one.
- **A populated example must contain evidence, not repeat the question.** Each preset now supplies a precise fictional architecture, measured Current State, material gap, requirements, acceptance evidence, ownership, dependencies, and timing consequence. Guidance remains in the help text; the example answer demonstrates what that guidance produces.

## Next cases to prototype

1. Add ordinary Incident, Standard Service Request, and General Inquiry presets so the front door is tested with non-project demand.
2. Let a user drive review records through Approved, Conditional Approval, and Review Rejection; verify that dependent stages unlock or stop correctly.
3. Model proposal revisions so a changed outcome, boundary, requirement, risk, data flow, vendor, or operating model invalidates only the decisions whose examined facts changed.
4. Drive one candidate Epic through Delivery Readiness: governing proposal revision, design evidence, dependency commitments, specialized approvals, operational ownership, Capacity Acceptance within a Planning Interval, and Acceptance Authority.
5. Separate an Approved Delivery Baseline from later Delivery Forecasts and require new authority when the commitment materially changes.
6. Close one scenario by reconciling the original outcome and intake predictions against the delivered result.
7. Decide whether requesters should select affected systems directly or describe affected capabilities so the service map can derive systems as well as dependencies.

## Variants to evaluate

- **A — Guided interview:** Does progressive disclosure help requesters answer unfamiliar questions without feeling buried?
- **B — Proposal worksheet:** Is showing the entire evidence record at once better for experienced requesters and reviewers?
- **C — Routing conversation:** Does an interview-like presentation and visible routing map make the organizational workflow easier to explain to an audience?

## Verdict

The lifecycle vocabulary is coherent enough to test, and the metrics case now demonstrates how intake, framing, capability selection, design history, work items, acceptance, and reconciliation interact without becoming the same artifact. ADRs remain design records owned by the systems they govern. The prototype has not yet exercised decisions through authorization and delivery. The next useful pass is state transitions, not more fields or visual polish.

Record which interaction model worked, what should be combined, and which state transition felt illegitimate before this prototype is deleted or absorbed.
