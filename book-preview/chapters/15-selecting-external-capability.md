# Selecting External Capability

*Part V — Developing and Acquiring Capability*

An RFP is external work intake. It is the same evidence-and-authorization system used for internal proposals after the request crosses a commercial trust boundary.

The need must still be authenticated. Claims must still be preserved. Distinct authorities must still review the consequences they own. Unknowns must still become bounded proof. Capacity, risk, and acceptance must still be explicit. The result must still be reconciled against the original claim. What changes is the posture toward the claimant.

## One intake system, two trust boundaries

Internal intake is cooperative even when it is contentious. The requester, sponsor, reviewers, and receiving teams remain accountable to the same enterprise. Their incentives may conflict locally, but each has a duty to help the organization reach a valid decision and expose facts that could change it.

External intake is adversarial. That does not mean every vendor is dishonest or that the buyer should behave with hostility. It means the counterparty is paid when the buyer says yes. For control-design purposes, assume that making the sale is the vendor's dominant objective and that fit, implementation burden, long-term support, and the buyer's exit problem are secondary until the agreement makes them material.

The vendor is therefore an interested claimant, not an authority on whether its own claim has been proved. A polished demonstration is testimony. A benchmark selected and run by the seller is seller-supplied evidence. A reassuring relationship with one sales representative is not a durable operating control: the people involved in the sale may not own implementation, support, renewal, or the consequences years later. The record and the contract must survive everyone in the room.

The lifecycle does not change:

| Decision function | Internal work intake | External intake / RFP |
|---|---|---|
| Establish the need | Authenticated Work Proposal and sponsor | Buyer-owned capability statement and accountable sponsor |
| Preserve the claim | Requester facts, assumptions, target condition | Vendor response, exceptions, assumptions, and claim register |
| Route authority | Architecture, Security, Finance, operations, portfolio, and delivery reviews | The same internal authorities plus Procurement and Legal |
| Resolve uncertainty | Bounded discovery or Conditional Approval | Buyer-controlled demonstration, benchmark, reference check, or proof of concept |
| Authorize commitment | Authorized Work Proposal plus accepted delivery capacity | Award decision, negotiated obligations, funding, and implementation authority |
| Prove completion | Delivery evidence against acceptance conditions | Layered acceptance, burn-in, remedies, and payment gates |
| Reconcile | Baseline and forecast against delivered outcome | Original need and vendor claims against production operation |

The adversarial boundary changes the burden of proof. Internally, missing evidence may be repaired through shared discovery because the participants are working for the same outcome. Externally, an unsupported claim remains the seller's burden, proof conditions belong to the buyer, and ambiguity that survives into the contract usually becomes the buyer's cost.

This is the book's main rule crossing a trust boundary. The RFP does not introduce a separate procurement philosophy. It makes the intake philosophy easier to see because sales incentives punish every missing control.

## Why RFPs Exist

Organizations do not need formal RFPs because buying things is inherently complicated. They need formal RFPs because important purchases create commitments the organization will have to live with after the sales cycle ends.

A technology purchase can commit the organization to:

- an architecture
- an operating model
- a support relationship
- a security posture
- a migration path
- a cost structure
- a staffing model
- a vendor roadmap
- a failure mode
- an exit problem

Those commitments often last longer than the people who approved the purchase. If the original reasoning is not preserved, later teams inherit a system without the answer key. They may know what was bought, but not why it was chosen, what alternatives were rejected, what risks were accepted, what claims were made, or what outcomes the organization expected.

The RFP exists to prevent that loss of context.

At its best, an RFP does five jobs:

1. It defines the operational capability the organization needs.
2. It forces requirements, constraints, and decision criteria into the open before vendor preference hardens.
3. It turns vendor claims into records that can be verified later.
4. It ties selection, implementation, acceptance, and payment to evidence.
5. It leaves behind a decision record the organization can reconcile against actual outcomes.

This is the same closed-loop pattern that applies to work items, architecture decisions, process improvement, coaching, and talent development. The organization records a judgment when it is made, preserves the evidence and assumptions around it, routes the artifact through the people who must rely on it, then reconciles the original claim against what actually happened.

An RFP is that loop applied to external capability acquisition.

---

## The Failure Mode: Buying Activity Instead of Capability

Weak procurement processes tend to optimize for purchase completion:

- quote received
- budget approved
- purchase order cut
- contract signed
- hardware delivered
- license provisioned
- vendor installed it
- dashboard green for one afternoon

That sequence can produce the appearance of success while leaving the organization with an unproven production system. The vendor may have delivered equipment, labor, or access, but the buyer has not yet proven that the capability works in the environment where it matters.

For a storage cluster, "done" does not mean that racks arrived, disks are visible, and the admin UI loads.

For an HPC cluster, "done" does not mean that users can log in, a sample job runs, and the vendor benchmark looks impressive.

For an identity platform, "done" does not mean that authentication succeeds in a lab tenant.

For a backup system, "done" does not mean that backup jobs completed once.

The operational question is different:

**Does the system deliver the agreed capability, under agreed conditions, with known failure behavior, known support paths, known operating procedures, and evidence strong enough to trust it in production?**

A stronger RFP process optimizes for production readiness. It defines what must be true before selection, implementation, payment, handoff, and final acceptance can proceed.

The vendor should be accountable for the operational outcome, not merely the shipment of expensive parts.

---

## RFP as Operational Risk Transfer

Every technology purchase leaves some risk with the buyer and transfers some risk to the vendor. A mature RFP process makes that allocation explicit.

Some risks should remain internal:

- the business need
- the priority of the capability
- internal stakeholder alignment
- internal operating model choices
- site readiness
- data classification
- internal staffing
- internal change management
- organizational willingness to retire old systems

Some risks may be transferred to the vendor:

- whether the proposed design can meet stated requirements
- whether the product can achieve agreed performance targets
- whether integration assumptions are valid
- whether installation and configuration follow agreed standards
- whether support paths work under defined severity conditions
- whether failures trigger remediation, replacement, credit, or rejection

An RFP is how the organization decides which risks sit where.

If the buyer only asks for a bill of materials, most risk stays with the buyer. The vendor can say, "We delivered what you asked for." If the system later fails to meet throughput, resilience, operability, or support expectations, the organization may discover that those expectations were never converted into obligations.

If the buyer defines operational outcomes, acceptance tests, implementation gates, burn-in criteria, remedies, and support obligations, the risk picture changes. The vendor still cannot own everything. No vendor can fix an organization that failed to define its workload, prepare its site, assign operators, or approve required network changes. But the vendor can be held accountable for the claims it made and the outcomes it agreed to deliver.

That is operational risk transfer:

**The organization converts uncertain future pain into testable, enforceable vendor obligations before the system becomes too embedded to reject.**

This is not anti-vendor. Good vendors benefit from clear requirements, explicit assumptions, known acceptance criteria, and realistic buyer obligations. Ambiguity helps weak sales motions more than strong delivery teams.

![The buyer retains responsibility for defining organizational need and operating conditions; the RFP converts those facts into testable obligations that the vendor can own.](../assets/images/rfp-vendor-selection/risk-allocation-boundary.svg){#fig-rfp-risk-allocation-boundary}

---

## Before the RFP

The RFP process starts before the RFP document exists.

The organization first needs to define the problem well enough that vendors are responding to the same need. Without that pre-work, the vendor market will define the problem for the buyer. Sometimes that reveals useful information. Sometimes it turns a real operational need into a contest between sales narratives.

Before issuing an RFP, capture:

- the problem statement
- current-state pain
- target capability
- stakeholders and accountable reviewers
- non-goals
- constraints
- dependencies
- operating model
- integration assumptions
- security and compliance requirements
- performance expectations
- support expectations
- migration expectations
- reversibility or exit strategy
- budget and timeline realities
- known risks
- decision gates
- evidence needed for acceptance

This pre-work records what the organization believed it needed before vendors had a chance to reshape the question.

Market research or an RFI can happen before the formal RFP. The purpose is not to let vendors write the requirements. The purpose is to learn what the market can actually provide, where similar deployments fail, what assumptions matter, what vendors will and will not guarantee, and what testing they consider meaningful.

A vendor refusing to guarantee something can be more useful than a vendor promising everything. The refusal tells the buyer where risk may remain internal, where the requirement may be unrealistic, or where the contract needs sharper language.

---

## RFP Document Anatomy

The RFP document should make the evaluation path visible. A vendor should be able to understand the environment, the target capability, the response format, the decision process, and the acceptance bar without reverse-engineering the buyer's intent from scattered conversations.

A strong infrastructure RFP usually has this shape:

1. Executive summary
2. Department or business-unit overview
3. Current environment
4. RFP response instructions
5. Vendor qualifications
6. Hardware requirements
7. Networking requirements
8. Capacity requirements
9. Data-center requirements
10. Software and client requirements
11. Data protection requirements
12. Benchmark requirements
13. Documentation requirements
14. Warranty and support requirements
15. Acceptance test
16. Attachments

The current-environment section should be specific enough for vendors to design against reality. For a storage platform, that may include the existing parallel storage environment, current filesystem architecture, storage nodes, disk shelves or JBODs, protocol or gateway nodes, management nodes, network fabric, application layer, observed performance, storage profile, and the procurement context for the replacement.

The conditions-of-participation section is where the buyer defines the rules of engagement. It should cover:

- general terms
- eligibility to participate
- formal contact information
- proposal submission
- electronic proposal requirements
- large-file, hard-copy, or physical-media submission rules
- ownership and confidentiality of proposals
- clarity expectations
- supporting material
- vendor briefing
- proposal response requirements
- proposal-validity period
- language and measurement
- vendor responsibility
- required documentation
- options and alternates
- evaluation methodology
- partial or noncompliance
- vendor contact information
- target schedule and delivery
- definitions
- requirements structure

The technical requirements should then be organized by the operating surfaces the buyer must live with after award. For a storage RFP, that means storage hardware, networking, capacity, data center, software and clients, data protection, benchmarks, documentation, support, and acceptance. For another domain, the headings will change, but the logic should not: describe the environment first, define how vendors must respond, then state the requirements in the same categories operators will later use to validate and run the system.

The definitions section matters more than it looks. Terms such as "available," "supported," "integrated," "real time," "high performance," "production ready," "turnkey," and "accepted" are not self-executing. If the RFP does not define language and measurement, the vendor response will define them implicitly.

The response format is also a control surface. Vendors should be told how to answer requirements, how to identify exceptions, how to attach assumptions, how to price options, how many alternates they may submit, and which claims require supporting evidence. Without that discipline, comparison becomes a writing contest between sales teams.

The formal contact should usually be detached from the project team. That does not mean technical people stop talking to vendors. It means official questions, answers, schedule changes, requirement clarifications, and addenda flow through a controlled channel so one vendor does not receive private guidance that others never see.

---

## Requirements Structure

RFP requirements should describe what must be true in production, not merely which equipment or product the buyer thinks might make it true.

Do not only say:

> Provide a storage cluster with N nodes and X capacity.

Say:

> Provide a storage capability that supports these workloads, these throughput and latency requirements, these failure modes, these recovery expectations, these protocol requirements, these operational integrations, and these acceptance tests.

Design requirements are still valid when they are real constraints. Rack density, power, cooling, network topology, supported protocols, operating-system compatibility, encryption, FIPS posture, backup integration, identity integration, and datacenter limits may all be legitimate requirements.

The distinction is not outcome requirements versus design requirements. The distinction is whether the requirement represents a real operating condition or merely a guessed solution.

Useful requirement categories include:

- functional requirements
- non-functional requirements
- operational requirements
- security requirements
- integration requirements
- reporting and audit requirements
- performance requirements
- resilience requirements
- support and lifecycle requirements
- migration requirements
- exit requirements
- documentation and training requirements
- acceptance requirements

One useful requirement notation is to distinguish facts, requirements, and goals:

- `will` statements describe current facts, buyer constraints, or environmental conditions
- `shall` statements define mandatory requirements that must be met and verified
- `should` statements define goals, preferences, or non-mandatory provisions that vendors must address but that may not be formally verified

This keeps the RFP from treating every sentence as the same kind of obligation. It also gives evaluators a way to reference requirements later. For example, a requirement can be referenced as `Requirement 7[3]`, meaning the third `shall` statement in section 7. An option can be referenced as `Option 7[2]`, meaning the second `should` statement in section 7.

Examples:

- The proposed platform `will[1]` be installed in the buyer's primary production data center.
- The buyer `will[2]` provide rack space, network drops, power, and identity-provider access according to the site-readiness plan.
- The vendor `shall[1]` provide a concise architecture summary that identifies each major component, its role, and its relationship to the rest of the system.
- The vendor `shall[2]` include any auxiliary systems required for user access, orchestration, management, monitoring, or normal operation.
- The proposed design `shall[3]` allow routine service of individual components without interrupting the full platform, except where an exception is explicitly identified and accepted.
- The proposal `shall[4]` identify the model, configuration, firmware or software baseline, and support status of all major components.
- The vendor `shall[5]` provide current administrator documentation, troubleshooting documentation, configuration guidance, and update procedures electronically.
- The vendor `shall[6]` describe the warranty, maintenance, escalation, and software-update model for the full proposed solution.
- The vendor `should[1]` describe any design option that would improve resilience, observability, serviceability, or long-term expansion without changing the core scope of the purchase.

The requirement package should also identify disqualifiers. If the system cannot integrate with the identity provider, cannot meet encryption requirements, cannot support the expected operating system, cannot fit in the site power envelope, or cannot be supported in the required geography, the organization should know that before the vendor becomes the favorite.

The goal is not to make the requirements long. The goal is to make them real.

---

## Process Stages

A high-risk technology purchase should move through stages. Each stage produces evidence and gives the organization a chance to correct course before exposure increases.

A strict model looks like this:

1. Problem definition
2. Market research or RFI
3. Acquisition strategy
4. Requirements package
5. Evaluation model
6. RFP release
7. Vendor questions and clarifications
8. Response intake
9. Compliance screening
10. Scored evaluation
11. Demonstrations or proof of concept
12. Vendor claim register review
13. Selection decision record
14. Contracting and statement of work
15. Design review
16. Site-readiness review
17. Delivery
18. Installation
19. Baseline configuration
20. Integration
21. Functional validation
22. Performance validation
23. Failure-mode validation
24. Operational handoff
25. Burn-in
26. Final acceptance
27. Warranty and support lifecycle
28. Post-implementation review
29. Lessons learned

Most organizations will not need every stage for every purchase. That is fine. The important habit is that omitted stages are consciously omitted because the risk is low, not accidentally omitted because nobody had a complete model.

The public-facing RFP schedule should also protect fairness and decision quality. A practical sequence is:

1. RFP issued
2. vendors submit written questions
3. buyer publishes a shared FAQ or addendum
4. vendor briefing held so vendors understand the buyer's environment
5. final written question round
6. RFP closes
7. compliance screen completed
8. proposal clarification meetings held with individual vendors
9. scoring, demos, POCs, and selection proceed from the recorded responses

The vendor briefing is not a substitute for requirements. Its purpose is to help vendors understand the environment well enough to respond accurately. The shared FAQ is what keeps that understanding from becoming uneven private context.

For foundational infrastructure, the strict model is often appropriate because the cost of late discovery is high. Storage, HPC, virtualization, backup, identity, and network core purchases can reshape operations for years. They deserve a lot more than quote comparisons and vendor lunches.

---

## Scoring and Evaluation Principles

The evaluation model must exist before responses are scored.

That rule matters because people form preferences early. A persuasive vendor, familiar brand, strong incumbent relationship, impressive demo, or attractive price can quietly become the answer before the organization has agreed on the question. Once that happens, evaluation criteria often become decoration.

The scorecard should be visible to evaluators before vendor responses arrive. It should identify must-have gates, disqualifiers, weighted criteria, and risk factors.

Separate musts from wants.

Musts are pass/fail conditions. If a vendor cannot meet them, the proposal is noncompliant or the organization must explicitly rewrite the requirement and notify the field. Wants are comparative criteria. They distinguish acceptable proposals from stronger ones.

That distinction keeps the evaluation honest. A vendor should not be able to compensate for a failed hard requirement with a beautiful demo, a discount, or a pile of attractive extras. Likewise, a preference should not be smuggled into the process as if it were a non-negotiable constraint.

Useful evaluation categories include:

- technical fit
- requirement compliance
- implementation credibility
- performance evidence
- operational support model
- migration plan
- integration complexity
- acceptance-test credibility
- similar deployment history
- security and supply-chain posture
- lifecycle cost
- staffing impact
- operational burden
- support burden
- warranty and support terms
- vendor maturity
- roadmap risk
- reversibility
- contractual accountability
- commercial risk

Price matters. It should not be ignored, and a framework that pretends cost is secondary to every technical preference will lose credibility quickly. But price should be evaluated alongside lifecycle cost, operational burden, support quality, implementation risk, and the cost of being wrong.

For high-stakes decisions, the weights themselves should be decided before scoring and stress-tested for outliers. One useful method is a lightweight Band Delphi:

1. Evaluators privately assign each criterion a weight, such as 1-5.
2. A neutral facilitator gathers the weights.
3. Outliers on either side explain their reasoning.
4. Evaluators revote after hearing the rationale.
5. The final weights are recorded before vendor scores are applied.

Neutral does not mean senior, adjacent, or willing to claim objectivity. The facilitator should be detached from which solution wins. In many organizations, that means someone from procurement, legal, HR, finance, or another governance function whose job is to protect process integrity rather than win the technical argument. Procurement may be tightly coupled to budget rules, approval thresholds, and purchasing policy, but it should not care whether the systems team buys one storage platform over another except where cost, compliance, or process rules require a yes, no, or additional approval. If a systems engineering team is buying a storage cluster, the CTO is not neutral, the director of front-end engineering is not neutral, and an IC from the virtualization team is not neutral. Each may have useful judgment, but each is attached to the operating, political, or architectural consequences of the decision.

The same pattern can be used for value scores. The point is not to remove judgment. The point is to surface judgment before vendor preference hardens.

A simple scoring model can then separate technical merit from cost:

- score each vendor against the weighted criteria
- total the weighted merit score
- normalize merit across vendors
- normalize cost across vendors
- combine normalized merit and normalized cost using the agreed formula
- preserve any narrative override or accepted risk in the decision record

The highest combined score should create a strong presumption, not an automatic purchase order. A scorecard can show that a vendor performed best against the model. It cannot by itself prove that the model captured every material risk. That is why the final decision still needs a written record.

The selected vendor should not merely have the best sales motion. It should have the strongest case that it can deliver the required capability under the buyer's actual operating conditions.

Where possible, separate scoring from narrative judgment. The scorecard records how the vendor performed against known criteria. The narrative records why the organization believes the score does or does not tell the whole story.

Both matter. A numeric score without explanation hides judgment. A narrative without scoring invites memory drift.

---

## Vendor Demonstrations and Proofs of Concept

A demo is not evidence by default.

A good demo can clarify workflow, expose product assumptions, reveal support maturity, and help operators understand how the system behaves. A vendor-controlled path through a happy-case environment with no realistic load, no buyer data, no integration pressure, no failure mode, and no operational handoff can be useful during discovery (RFI), but remains insufficient for the RFP process.

Before a demo, define what the demo is supposed to prove. If the organization does not know what the demo is supposed to prove, it may be operating in the wrong stage.

This is where RFI, RFP, and POC work often get compressed into one ambiguous word: demo. In an RFI, a broad vendor demo can be legitimate discovery. It helps the buyer learn the market, sharpen language, and understand what a category of products can do. In an RFP, the demo should be evidence against stated requirements. In a POC, the demonstration should give way to direct contact with the buyer's workload, environment, operators, and failure modes.

Stage confusion matters because it changes the meaning of the evidence. A discovery demo can inform requirements. It should not become proof of production readiness.

At minimum, record:

- which requirements the demo addresses
- which requirements it does not address
- what environment the demo uses
- what data, workload, or scale is represented
- which assumptions the vendor is making
- who must attend
- who is responsible for capturing claims
- what questions must be answered
- what would count as a concern
- what evidence must be supplied afterward

A proof of concept should be even tighter. It should not be a sales demo with engineering labor attached.

Any meaningful platform, vendor, or open-source selection should include a live proof of concept unless the cost of doing so is clearly disproportionate to the decision. Research narrows the field. Demos explain the promise. POCs expose the operating reality.

For serious technology selections, the organization should prefer competing live POCs over paper comparison alone. If research identifies three plausible candidates, stand up the candidates, drive representative workload through them, observe how they behave, and record the tradeoffs. The point is not to create a perfect laboratory. The point is to replace sales motion, popularity, and assumption with contact against reality.

A POC should define:

- what claim it is testing
- what success means
- what failure means
- what inconclusive means
- what data and scale are realistic
- what representative workload, data volume, or workflow will be exercised
- who runs it
- who observes it
- which buyer systems are involved
- which vendor systems are involved
- what support model is exercised
- what assumptions remain afterward

The closed-loop rule is that demonstrations and POCs produce evidence against pre-stated claims.

If the vendor says a storage platform can sustain a required workload, the POC should preserve what workload was tested, what scale was used, what results were observed, what tuning was required, and what remains unproven.

If the vendor says an HPC cluster can support a workload profile, the POC should distinguish a vendor benchmark from a buyer workload benchmark. A benchmark can be useful, but it is not the same as proof that the buyer's scheduler, filesystem, identity integration, monitoring, and user environment will work.

If the organization is replacing an internal system, the POC should test the candidate against the operating burden that caused replacement to be considered in the first place. A metrics platform replacement, for example, should not be evaluated only by feature checklist. It should be tested with representative metrics volume, retention expectations, query patterns, ingestion behavior, operational architecture, failure modes, and the team's ability to run it. The selected solution may still require redesign later; evidence does not eliminate risk. It makes the decision educated enough to learn from.

The demonstration should never become the whole evaluation. It is one evidence source.

![Evidence becomes stronger as evaluation moves from vendor-controlled discovery to buyer workloads, production conditions, and contractual consequences.](../assets/images/rfp-vendor-selection/evidence-escalation.svg){#fig-rfp-evidence-escalation}

### Benchmark and Workload Selection

Benchmarks are useful only when they match the decision being made. A benchmark that proves one kind of capability can be noise, or even misdirection, for another.

For HPC-style parallel filesystems, IO500, IOR, and mdtest can provide useful evidence because the workload shape is massively parallel metadata and throughput behavior. They still need to be tied to the buyer's scheduler, filesystem layout, identity integration, monitoring, user environment, and representative job profile.

For enterprise NVMe block storage or transactional storage, FIO and VDBench are often more useful. The test should define block size, read/write mix, queue depth, random versus sequential access, working set size, test duration, IOPS, throughput, and latency percentiles. SPC-1 and SPC-2 may also provide useful industry-standard context. For latency-sensitive NVMe purchases, queue-depth-1 latency and p99.9 tail latency under sustained load may matter more than peak IOPS.

For latency-deterministic compute, the workload should emphasize jitter, tail spikes, cache behavior, NUMA locality, and single-thread performance instead of aggregate throughput alone. STAC-M3, STAC-A2, network jitter tests, PTP-synced round-trip timing, Intel MLC, and core-pinned synthetic tests may be more relevant than generic compute benchmarks.

For cloud-vendor comparisons, the buyer is not comparing like-for-like hardware. The test should focus on service behavior: provisioning tiers, noisy-neighbor exposure, network paths, scale-up time, cold-start behavior, cost under load, and the actual workload. Load replay through tools such as k6, Locust, or JMeter may be more meaningful than a synthetic benchmark. Database-shaped workloads may justify TPC-C, TPC-H, or TPC-DS. Raw storage and network numbers from FIO and iperf3 still help, but they should be normalized by cost because instance, storage, and network tiers rarely map cleanly across providers.

The buyer should also ask vendors for their own system-exercise tools. If the vendor has a burn-in harness, diagnostic suite, workload generator, or validation procedure, the RFP should require it to be disclosed and made available for acceptance testing when appropriate. A vendor's preferred test is not automatically sufficient, but it is useful evidence about what the vendor believes stresses the system.

### Application to Open Source Tooling
This matters for open-source tools as much as vendor products. A free license does not make a tool low-risk. The organization may still be choosing an operating model, a staffing profile, an integration burden, a support path, an upgrade lifecycle, a state-management problem, and a future migration cost. No serious platform decision should be made only because the tool is popular, widely adopted, well-marketed, or already common in large companies.

Tool adoption should distinguish between reducing accidental complexity and relocating it. A tool that replaces bespoke automation may still impose a new operating model, hiring profile, workflow, state-management burden, and ecosystem dependency. The question is not only "does this tool have market adoption?" The question is "what complexity does it remove, what complexity does it introduce, and is the organization prepared to operate the model it requires?"

Jane Street's Mailcore story is a useful example. The firm had been using a widely deployed open-source mail server that could perform the required work, but its bespoke configuration language made critical compliance behavior hard to reason about, hard to test in smaller units, and dependent on specialist knowledge. Building a replacement in OCaml was not a rejection of external tools on principle. It was a decision that the real long-term cost sat in operability, staffing, testability, and change safety. The replacement still required evidence: they shadowed the old and new systems, diffed real mail behavior for months, found classes of mismatches, and migrated users gradually.

---

## The Vendor Claim Register

Every important vendor claim should become a durable row.

Vendor claims often arrive through calls, emails, slide decks, hallway comments, demos, sales engineering sessions, contract redlines, and support conversations. If those claims are not captured, the organization later has to reconstruct what it thought it heard.

A vendor claim register should record:

- vendor
- claim
- date and source
- who heard or received it
- requirement or risk related to the claim
- condition or assumption attached to the claim
- evidence supplied
- verification method
- owner responsible for verification
- status: unverified, verified, contradicted, accepted risk, or not tested
- later implementation result

This is not about trapping vendors with gotcha notes. It is about preserving the operating memory of the selection.

If a claim is important enough to influence the decision, it is important enough to verify, contract, or explicitly accept as risk. If it cannot be verified and cannot be contracted, it should not quietly become a reason to buy.

The claim register is the RFP equivalent of an evidence ledger. It connects selection to implementation and implementation to post-implementation review.

---

## Decision Records

The final selection should leave behind a decision record.

The decision record should preserve:

- why this vendor was selected
- why the other vendors were not selected
- which requirements were fully met
- which requirements were partially met
- which tradeoffs were accepted
- which risks were accepted
- which assumptions must be revisited
- which vendor claims became commitments
- which vendor claims remained unverified
- what the organization expects to be true after implementation
- who owns follow-up
- when the decision should be reviewed

This record is not a press release for the chosen vendor. It should not pretend the choice was perfect. The best decision records are often plain about the compromise:

> We selected Vendor A because it met the operational requirements with the strongest support model and lowest integration risk. Vendor B had a stronger roadmap, but the missing identity integration would have created unacceptable implementation risk. Vendor C was cheaper, but the support model did not meet the required severity expectations. We accepted Vendor A's higher three-year cost because the operational burden was lower and the migration plan was more credible.

That kind of record gives future operators something to reconcile. If Vendor A later fails on support, the organization knows which assumption broke. If Vendor B later ships the missing integration, the next evaluation starts smarter. If Vendor C proves reliable elsewhere, the organization can revisit whether its concern was correct.

Without the decision record, later teams inherit folklore.

---

A strong selection record preserves the need, the claims, the comparison, and the accepted risks. The capability still does not exist. Delivery, burn-in, acceptance, payment, and later operation must grade the selected claim against reality.

<!-- Preview assembly source: Book-level synthesis connecting Work Intake to external acquisition; RFPs-and-Vendor-Selection-as-Evidence-Systems.md: Why RFPs Exist through Decision Records -->
