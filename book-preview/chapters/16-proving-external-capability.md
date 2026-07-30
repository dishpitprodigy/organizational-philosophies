# Proving and Accepting External Capability

*Part V — Developing and Acquiring Capability*

Procurement ends too early when delivery, installation, or a green dashboard becomes evidence that the organization received the capability it intended to buy. Acceptance must remain attached to the requirements, failure conditions, operational handoff, support obligations, and proof defined before production pressure made rejection politically expensive.

> **Preview note — future edition**
>
> A future version will make the shared intake lifecycle even more explicit with a paired internal/external example: the same need, claim, review, proof, authorization, acceptance, and reconciliation decisions shown on both sides of the trust boundary. The implementation detail will remain inline because the reader must be able to derive the method from a complete example, not merely be told to choose appropriate requirements or metrics.

## Acceptance, Burn-In, and Payment

Acceptance criteria are not ceremony. They are the buyer's defense against ambiguity.

If the RFP does not define how success will be tested, success becomes whatever the vendor can persuade the buyer to accept.

Acceptance should be planned before award and finalized before implementation. It should not be improvised after the system starts failing.

Useful acceptance layers include:

- delivery acceptance: the contracted items arrived
- installation acceptance: the system is racked, cabled, powered, installed, and configured according to the statement of work
- functional acceptance: the system performs required basic functions
- integration acceptance: required connections to identity, monitoring, backup, network, ticketing, logging, or other systems work
- performance acceptance: the system meets agreed performance targets under agreed test conditions
- failure-mode acceptance: expected component, path, node, controller, or dependency failures behave within agreed limits
- operational acceptance: documentation, runbooks, escalation paths, monitoring, alerting, training, and support handoff are complete
- production acceptance: the system survives a defined burn-in period under real or representative load

For infrastructure purchases, a minimal acceptance sequence often has three practical phases:

1. Validate connectivity and required integrations.
2. Validate the agreed benchmarks or workload tests.
3. Run burn-in under sustained load and resolve defects before final acceptance.

The details depend on the system. A storage platform may need protocol, multipath, metadata, throughput, rebuild, failover, and client-behavior tests. A GPU or HPC platform may need HPL, GPU burn, scheduler integration, filesystem behavior, thermal observation, and power observation under load. A network or latency-sensitive platform may need jitter testing, failover timing, packet-loss behavior, and clock-synchronization validation.

The acceptance plan should state who runs each test, what evidence is captured, who signs off, what constitutes failure, how failed hardware is replaced, and whether replacement or remediation restarts any portion of burn-in.

A burn-in period is the bridge between "it passed the demo" and "we trust it in production."

The burn-in period should define:

- duration, such as 30, 60, or 90 days depending on criticality
- workload type: real, synthetic, or representative
- performance thresholds
- defect severity levels
- uptime expectations
- allowed maintenance windows
- environmental observations such as heat, power, and throttling under load
- what resets the burn-in clock
- what defects delay acceptance
- what failures trigger vendor-funded remediation
- what failures trigger replacement, credit, rejection, or termination

Final payment should follow final acceptance, not vendor optimism.

Invoicing should not be treated as complete merely because delivery occurred. Delivery proves that the buyer received the contracted items. It does not prove that the buyer received the contracted capability.

Payment structure is one of the strongest ways to assign risk. For well-defined infrastructure purchases, milestone-based payment is often more appropriate than paying the full amount when equipment arrives.

Milestones may include:

- design accepted
- equipment delivered
- installation complete
- baseline configuration complete
- integration complete
- functional acceptance passed
- performance acceptance passed
- operational handoff complete
- burn-in complete
- final acceptance signed

The contract should also define remedies when the vendor fails to deliver the promised thing. Possible remedies include a cure period, escalation path, withheld payment, service credits, vendor-funded remediation, replacement obligations, extended warranty or support, delayed final acceptance, right to reject, right to terminate, refund terms, and post-acceptance defect obligations.

The exact remedy language belongs with procurement and legal counsel. The operating principle belongs in the RFP: the organization should know what happens if the promised capability does not arrive.

![Delivery begins a gated acceptance path; failed gates return to remediation, while final payment waits for proven operational capability.](../assets/images/rfp-vendor-selection/acceptance-payment-gates.svg){#fig-rfp-acceptance-payment-gates}

---

## What to Strip Down Under Lower-Risk Conditions

Not every purchase needs the full process.

The lightweight process should be a conscious reduction of the strict process, not a guessing game about what might matter.

### Tier 1: Low-Risk Purchase

Examples include small non-critical tools, easily reversible purchases, and purchases where failure creates limited operational impact.

Minimum process:

- define the need
- confirm basic requirements
- compare reasonable options
- document the decision
- verify delivery
- preserve receipts, terms, and renewal dates

Usually stripped down:

- formal RFI
- formal RFP
- weighted scorecard
- detailed vendor claim register
- proof of concept
- staged payment
- long burn-in
- post-implementation review

The decision still needs a record, but the record can be short.

### Tier 2: Moderate-Risk Technology Purchase

Examples include team-level infrastructure, non-critical storage, monitoring tools, limited-scope platforms, and tools that affect a bounded user group.

Minimum process:

- define the operational capability
- document requirements
- compare vendors
- define acceptance criteria
- require an implementation plan
- verify integration
- complete a short burn-in
- document handoff
- record the selection decision

Usually stripped down:

- broad market RFI (in practice, this is frequently senior+ engineers researching capabilities)
- highly formal source-selection procedure
- extensive contract remedies
- 60- or 90-day burn-in
- heavy executive governance

The buyer should still preserve vendor claims that materially affect the decision.

### Tier 3: High-Risk Foundational Infrastructure

Examples include production storage clusters, HPC clusters, virtualization platforms, backup systems, identity platforms, major network infrastructure, and systems whose failure would create business continuity, security, or large operational risk.

Use the strict model:

- acquisition planning
- market research or RFI
- formal RFP
- scored evaluation
- vendor claim register
- milestone-based payment
- design review
- site-readiness gate
- implementation gates
- functional acceptance
- performance acceptance
- failure-mode testing
- operational handoff
- 30- to 90-day burn-in
- final acceptance
- remedies for failure
- post-implementation review
- lessons learned

The stricter process exists because late discovery is expensive. Once a foundational system is wired into production, rejected alternatives become harder to recover, vendor leverage changes, and the organization may start accepting defects because backing out feels impossible.

---

## Common Failure Modes

### The Organization Cannot State the Need

The RFP starts with a preferred product, architecture, or vendor rather than a capability need. Vendors respond to the buyer's guessed solution instead of the operating problem.

### Requirements Are Written as Preferences

The buyer turns familiar mechanisms into requirements without proving they are non-negotiable. This can exclude better solutions or hide the real constraint.

### Evaluation Criteria Arrive Too Late

The organization decides what matters after it already knows which vendor it wants. The scorecard becomes a justification artifact instead of a selection tool.

### Demos Are Mistaken for Evidence

The vendor demonstrates a happy path in a controlled environment, and the organization treats that as proof of production readiness.

### Consensus Replaces Live Proof

Credible people agree that a credible tool is the right choice, but nobody proves the tool against representative workload, real operating constraints, or the team's ability to run it. The organization mistakes agreement for evidence.

### Adoption Gravity Is Mistaken for Fit

The selected tool is popular, common in large companies, or strongly recommended by vendors and peers, so the organization assumes it is architecturally fit. Popularity may reduce some risks, but it does not prove the tool matches the workload, skill base, operating model, or failure modes the buyer actually has.

### Vendor Claims Are Not Preserved

Important promises remain trapped in meetings, emails, slide decks, and memory. During implementation, nobody can prove what was claimed, what was assumed, or what was accepted as risk.

### Procurement, Engineering, Security, Finance, and Operations Evaluate Different Realities

Each function focuses on a different part of the purchase. Procurement sees terms, engineering sees technical fit, security sees control gaps, finance sees cost, and operations sees future toil. The RFP process fails when those realities are never reconciled into one decision.

### Delivery Becomes Acceptance

The organization treats arrival, installation, or initial login as success. The vendor exits before performance, resilience, monitoring, documentation, training, and support paths are proven.

### Payment Rewards Activity Instead of Proof

The contract pays for shipment, installation, or effort without holding enough leverage for acceptance, burn-in, and remediation.

### Operational Burden Is Left Out of the Decision

The selected tool works, but only by creating staffing load, alert fatigue, manual maintenance, upgrade risk, or support complexity that was not included in the evaluation.

### No One Owns Reconciliation

The purchase is approved, implemented, and forgotten. Nobody compares actual outcomes against the original problem statement, scorecard, vendor claims, cost model, implementation plan, and operator experience.

That final failure is the most important one. Without reconciliation, every RFP starts from organizational amnesia.

---

## Post-Implementation Review

The post-implementation review closes the loop.

After implementation, compare actuals against:

- original problem statement
- RFP requirements
- evaluation scorecard
- vendor claim register
- demonstration and POC findings
- implementation plan
- cost model
- support model
- reliability expectations
- operability expectations
- user experience
- operator experience
- accepted risks
- final acceptance criteria

The purpose is not to punish the selection team. The purpose is to make the next RFP smarter.

Useful questions:

- Did the system solve the problem we said it would solve?
- Which requirements mattered most in practice?
- Which requirements were unnecessary?
- Which vendor claims were verified?
- Which vendor claims failed, shifted, or became irrelevant?
- Which assumptions were wrong?
- Which risks were accepted knowingly?
- Which risks appeared without being captured?
- Did the support model work?
- Did the implementation plan match reality?
- Did the operating burden match the evaluation?
- Did the payment and acceptance structure preserve enough leverage?
- What should the next RFP do differently?

This review should feed back into requirement templates, scorecards, contract language, demo rules, POC design, acceptance criteria, and the vendor claim register.

The organization is allowed to learn. The system should make learning hard to lose.

---

Each domain now has some form of reconciliation: work, systems, talent, and vendors. Enterprise learning begins when those local reviews change portfolio and executive decisions without destroying the context that made the evidence honest.

<!-- Preview assembly source: RFPs-and-Vendor-Selection-as-Evidence-Systems.md: Acceptance through Post-Implementation Review; tools moved to Appendix E -->
