# Appendix E: Vendor-Selection Tools

*Part Appendices*

These templates make the acquisition evidence system reusable without forcing the narrative chapters to carry every row, scorecard, participation condition, and acceptance-test field.

## Appendix: Lightweight Templates

These templates are intentionally plain. Real organizations already have forms, master purchase agreements, universal terms and conditions, NDAs, insurance requirements, approval workflows, and legal language that should not be recreated in an RFP philosophy document. The purpose here is to show the shape of the evidence, not to replace procurement, legal, finance, security, or contract specialists.

### Sample Vendor Claim Register

| Vendor | Claim | Source | Related Requirement | Assumption or Condition | Evidence Required | Verification Owner | Status | Implementation Result |
|---|---|---|---|---|---|---|---|---|
| Vendor A | Platform supports required client OS versions. | Written proposal | Client compatibility | Buyer maintains supported patch levels. | Compatibility matrix and test result | Engineering | Unverified | TBD |
| Vendor A | System can meet target throughput under representative workload. | Demo and proposal | Performance | Workload profile matches supplied test plan. | Benchmark report and buyer-run POC | Engineering | Verified | TBD |
| Vendor B | Support responds within required severity window. | Contract response | Support | Buyer uses named escalation path. | SLA language and reference check | Operations | Accepted risk | TBD |
| Vendor C | Migration can complete within planned window. | Proposal | Migration | Required network changes complete first. | Migration plan and dependency list | Project owner | Unverified | TBD |

Useful status values include: unverified, verified, contradicted, accepted risk, not tested, superseded, and converted to contract obligation.

### Sample Selection Decision Record

Use this as a lightweight decision record, not a ceremony.

- Decision title:
- Date:
- Decision owner:
- Evaluators:
- Procurement or process facilitator:
- Business need:
- Operational capability being purchased:
- Vendors considered:
- Vendors rejected before scoring and why:
- Must-have gates:
- Scored criteria:
- Selected vendor:
- Why this vendor was selected:
- Why the other finalists were not selected:
- Major tradeoffs accepted:
- Major risks accepted:
- Vendor claims converted to obligations:
- Vendor claims accepted without verification:
- Required implementation gates:
- Acceptance criteria:
- Payment or invoicing dependencies:
- Follow-up owner:
- Review date:

The decision record should be short enough that people will actually write it and specific enough that future operators can reconcile the choice against reality.

### Sample Evaluation Scorecards

The numbers below are examples, not doctrine. Criteria, weights, and gates should be changed for the purchase in front of the organization.

**Storage Cluster**

| Criterion | Type | Example Weight |
|---|---|---:|
| Meets required capacity and growth profile | Must | Pass/fail |
| Meets required protocol and client support | Must | Pass/fail |
| Fits data-center power, cooling, and rack constraints | Must | Pass/fail |
| Meets security and authentication requirements | Must | Pass/fail |
| Performance under representative workload | Want | 5 |
| Failure-mode behavior and rebuild impact | Want | 5 |
| Operational support model | Want | 4 |
| Management, alerting, and reporting quality | Want | 3 |
| Migration plan credibility | Want | 4 |
| Lifecycle cost | Want | 4 |
| Vendor maturity and references | Want | 3 |
| Exit or expansion flexibility | Want | 2 |

**HPC or GPU Compute Platform**

| Criterion | Type | Example Weight |
|---|---|---:|
| Meets required accelerator, CPU, memory, and interconnect constraints | Must | Pass/fail |
| Integrates with scheduler, identity, storage, and monitoring | Must | Pass/fail |
| Fits data-center power, cooling, and serviceability constraints | Must | Pass/fail |
| Meets support geography and response requirements | Must | Pass/fail |
| Performance on representative workloads | Want | 5 |
| Latency, jitter, NUMA, or cache behavior where relevant | Want | 4 |
| Burn-in and hardware replacement plan | Want | 4 |
| Management and firmware lifecycle | Want | 3 |
| User environment compatibility | Want | 3 |
| Operational handoff quality | Want | 4 |
| Lifecycle cost | Want | 4 |
| Comparable deployments and references | Want | 3 |

**Lower-Risk SaaS Tool**

| Criterion | Type | Example Weight |
|---|---|---:|
| Meets security, privacy, and data-handling requirements | Must | Pass/fail |
| Supports required identity and access model | Must | Pass/fail |
| Meets budget and purchasing constraints | Must | Pass/fail |
| Satisfies core workflow requirement | Must | Pass/fail |
| Ease of adoption | Want | 4 |
| Administrative burden | Want | 4 |
| Reporting and auditability | Want | 3 |
| Support quality | Want | 3 |
| Integration effort | Want | 3 |
| Renewal and exit terms | Want | 4 |
| Total cost over expected use period | Want | 4 |

### Sample Conditions of Vendor Participation

This section should be reviewed by procurement and legal before use. The point is to make the participation rules explicit, not to invent contract language from scratch.

**General terms**

- The RFP is a request for proposals, not an offer to contract.
- The buyer is not obligated to reimburse vendors for proposal preparation costs.
- Submitted materials become the property of the buyer and may be copied or retained for RFP-related purposes.
- Proposal statements, supplemental submissions, and negotiation materials may be treated as binding on the selected vendor if incorporated into the final agreement.
- Price changes after award require documented justification and may be considered during renewal or extension review.
- The selected vendor must satisfy required insurance, compliance, and contracting conditions before execution.
- If contract documents conflict, the final agreement takes precedence over the RFP, and the RFP takes precedence over purchase-order or invoice terms unless the agreement says otherwise.
- The vendor acts as an independent contractor, not as an employee, agent, or managed extension of the buyer.

**Eligibility and formal contact**

- State who is eligible to participate.
- Require non-invited vendors to request permission through the formal contact.
- Reserve the buyer's right to decide whether to invite additional vendors.
- State that adding a vendor does not automatically change deadlines.
- Require all official questions, clarifications, addenda, and submission issues to flow through the formal contact.

**Proposal submission**

- State the closing date, closing time, timezone, and submission destination.
- Make vendors responsible for ensuring complete proposals are received before the deadline.
- State whether late proposals may be rejected without review.
- State the maximum number of proposals, alternates, or options a vendor may submit.
- Define electronic submission requirements.
- Define large-file, physical-media, or hard-copy submission requirements if needed.
- State that corrupted, unreadable, unavailable, or incorrectly linked materials may be excluded from evaluation if not corrected promptly on request.

**Ownership, confidentiality, and clarity**

- State that RFP materials are confidential and may be used only to prepare a response.
- Require vendors to mark any confidential portions of their proposal.
- State whether the buyer may copy and distribute proposal materials internally for evaluation.
- Make vendors responsible for removing ambiguity from their responses.
- State that the buyer is not responsible for discovering or correcting unclear vendor language.
- Require supporting material to be directly relevant, clearly referenced, and tied to the formal proposal.

**Vendor briefing**

- State whether the briefing is optional or mandatory.
- Require preregistration through the formal contact.
- State whether summaries, recordings, or written addenda will be provided afterward.
- Keep authoritative clarifications in written addenda or shared FAQ form so the briefing does not create uneven private context.

**Proposal response**

- State how long proposals must remain valid.
- State when and how proposals may be withdrawn.
- Require responses, attachments, and supporting materials to use the required language and measurement system.
- Make vendors responsible for understanding the RFP and promptly seeking clarification when requirements are unclear.
- State how RFP amendments will be acknowledged.
- Require vendors that decline to bid to notify the formal contact if that matters to the process.

**Required documentation**

Typical required documents include:

- formal proposal addressing the requirements
- line-item costs detailed enough to support a negotiated larger or smaller purchase
- administration, operations, and support documentation for the proposed solution
- RFP acknowledgment or intent-to-bid form
- comments or redlines to the master agreement, if requested
- confidentiality or NDA documents, if required
- company background survey
- exceptions, assumptions, and noncompliance list

**Options and alternates**

- Require options to be clearly identified as options.
- Require the vendor to state the benefit of each option.
- Require each option to meet the scope and functional intent of the relevant requirement.
- Require pricing, assumptions, and acceptance impact to be explicit for each option.

**Evaluation**

- Identify the review group or evaluation authority at the right level of abstraction.
- Reserve the buyer's right to reject noncompliant proposals.
- Reserve the buyer's right to accept or reject responses even when stated requirements are met.
- Disqualify attempts to bypass the formal contact or privately influence evaluators.
- State how and when vendors will be notified of selection status.
- State whether the selected vendor, scores, or evaluation details will be disclosed.

**Partial or noncompliance**

- Require proposals to address the entire RFP.
- State that partial or noncompliance may make a proposal ineligible.
- Require conditional, partial, alternate, or noncomplying responses to be identified explicitly.
- Require vendors to explain why an alternate approach satisfies the intent of a requirement.

**Target schedule and delivery**

The schedule should identify, at minimum:

- RFP issued
- intent to bid due
- confidentiality documents due, if required
- initial questions due
- vendor briefing
- final questions due
- RFP closes
- demonstrations or POCs for shortlisted vendors
- preferred vendor notified
- target delivery date

The buyer can provide the schedule in good faith without promising that every date is immovable. The selected vendor should still be required to nominate a firm delivery date once the implementation plan is known.

**Definitions and requirement notation**

Useful definitions include business day, closing time, timezone, measurement conventions, byte-versus-bit notation, acceptance period, and formal contact. The RFP should also define how requirement statements are interpreted, especially if it uses `will`, `shall`, and `should` notation.

### Sample Acceptance Test Structure

Acceptance testing should prove that the buyer received the contracted capability, not merely the delivered equipment. The exact test belongs in the RFP, statement of work, or implementation plan, but a useful acceptance structure often looks like this:

- The selected vendor shall submit an acceptance-test plan that maps each test to the agreed requirements.
- The buyer shall approve, reject, or request changes to the plan using the stated acceptance criteria.
- Release of final payment should be tied to successful completion of the approved acceptance test.
- The buyer should execute, witness, or control acceptance testing, with vendor support available during the test window.
- The acceptance test shall demonstrate that all delivered equipment, software, licenses, services, and supporting components needed for normal operation are functional and reliable.
- Phase 1 shall validate integration with the buyer environment, including required network, identity, management, monitoring, logging, and support-path dependencies.
- Phase 2 shall validate that the system meets or exceeds the proposed performance under the agreed workload or benchmark conditions.
- Phase 3 shall validate stability under sustained real or representative load for the agreed burn-in period.
- The vendor shall provide tools, procedures, or workload generators sufficient for the buyer to exercise the system during stability testing.
- The stability period will begin when the system is operational and ready for buyer testing, subject to the site-readiness assumptions in the implementation plan.
- The acceptance plan shall define what failures pause, extend, or restart the test window.
- The acceptance plan shall define what failed hardware, failed software, missing licenses, unavailable components, or unstable dependencies mean for acceptance.
- The agreement should define the buyer's remedy if acceptance is not completed within the agreed cure period.

Availability language should be precise. If one failed component makes another component unusable, degraded, or unstable, the acceptance plan should say whether both count as unavailable. If site infrastructure failure, buyer-caused misconfiguration, planned maintenance, or approved vendor remediation is excluded from uptime calculations, those exclusions should be written down before testing begins.

### Sample Company Background Survey

Ask only for information that is relevant to the purchase, risk level, and contracting process. A low-risk SaaS purchase does not need the same company survey as a foundational infrastructure purchase.

**About the respondent**

1. Provide your name, company address, email address, phone number, and role.
2. Are you the primary contact for technical questions? If not, identify the appropriate technical contact or contacts.
3. Are you the primary contact for commercial, contracting, or legal questions? If not, identify the appropriate contact or contacts.

**About the company**

1. Provide the full legal company name.
2. Provide the location of company headquarters.
3. Provide relevant business registry, tax, or commercial credit identifiers, if applicable.
4. State the company's fiscal year.
5. State whether the company is publicly traded. If so, provide the exchange symbol and most recent public annual report.
6. State whether the company is a subsidiary, division, or brand of a larger entity. If so, describe the ownership structure.
7. Provide the current number of full-time-equivalent employees for the relevant division and the overall company.
8. List current office locations, excluding partner offices.
9. List planned office locations or major geographic expansions, if relevant.
10. Provide revenue for the last three fiscal years, if disclosure is permitted.
11. Provide annual revenue for the relevant product or service category, if disclosure is permitted.
12. Describe projected growth over the next three years.
13. Describe experience with customers similar to the buyer in scale, operating model, regulatory posture, technical complexity, or mission criticality.
14. Provide three relevant customer references, including contact name, organization, phone number, and email address.
15. Identify comparable deployed systems, customers, or public reference architectures that demonstrate experience with this class of solution.
16. Identify any recognized benchmark lists, certification programs, reference programs, or industry validations relevant to this purchase category.
17. State how many customers currently use the proposed solution category, distinguishing between production deployments, pilots, and discontinued deployments where possible.

### Organizational Ownership Boundary

An RFP does not need to explain how to run the whole enterprise. It should name the interfaces where the purchase depends on other parts of the organization.

For many purchases:

- procurement owns the purchasing process, supplier intake, bid handling, policy compliance, and commercial process integrity
- legal owns contract language, liability, indemnity, IP, data-use terms, NDAs, and enforceable remedies
- security owns security requirements, risk review, data classification, identity, access, auditability, and supply-chain concerns
- engineering owns technical fit, architecture, performance, integration, and implementation feasibility
- operations owns runbooks, monitoring, support paths, incident response, handoff, maintenance, and day-two burden
- finance owns budget availability, capitalization or expense treatment, payment timing, renewal exposure, and long-term cost visibility
- executive sponsors own priority, risk acceptance, funding escalation, and organizational commitment

The RFP does not have to teach each function its profession. It has to make sure the purchase cannot silently pass through gaps between them.

<!-- Preview assembly source: RFPs-and-Vendor-Selection-as-Evidence-Systems.md: Appendix: Lightweight Templates -->
