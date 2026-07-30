# Appendix A: Framing and Work-Item Tools

*Part Appendices*

These instruments support the transition from ambiguity to a reviewable frame and from an authorized outcome to executable work.

## Discovery Package Template

Use this template for ambiguous pre-design work.

**Name:**<br>
Short, outcome-oriented noun phrase

**Intent:**<br>
Discovery / Enablement / Migration / Redesign / Optimization

**Objective:**<br>
The question this work answers

**Non-Goals:**<br>
What it explicitly does not decide

**Inputs Required:**<br>
Who must be involved and what information must exist

**Output Artifact:**<br>
The thing that proves the package is done

**Downstream Enabled:**<br>
The work or decision that can now proceed without reconstructing the reasoning

### Stable discovery categories

The exact questions vary, but the categories remain fairly stable.

#### Operational impact

- What happens when this system is unavailable?
- What is the tolerated duration of failure?
- Who is paged, and with what context?

#### Lifecycle and change

- How often does this system change?
- Which other systems' changes invalidate work here?
- What must be retested when this changes?

#### Coupling and dependencies

- What other systems assume this "just works"?
- What hidden contracts exist around timing, identity, naming, or availability?

#### Failure and recovery

- How do we recover from partial failure?
- What is the slowest acceptable recovery path?
- What breaks if recovery exceeds that window?

#### Ownership and authority

- Who decides when change is allowed?
- Who can pause a rollout?
- Who owns risk acceptance?

### Refactor vague discovery epics

Backlog epics filled with "determine X" or "research Y" usually show that task-based thinking has been applied to discovery. They feel weak because they do not make progress visible and do not tell reviewers what artifact will exist at the end.

Instead of:

- Determine IAM requirements
- Research AWS authentication options
- Figure out directory structure

Use:

**Epic: Platform Identity Discovery**

Discovery packages:

- **Identity Surface Inventory**<br>
  Output: documented list of identity consumers
- **Authorization Verbs Definition**<br>
  Output: capability list of verbs rather than group names
- **Trust Boundary Definition**<br>
  Output: written trust model and escalation paths

Each package has a finish line, creates a reviewable artifact, and can be marked done without debate. Progress becomes visible, discovery stops pretending to be execution, and stakeholders can review outcomes rather than activity.

### Example: identity framing before design

Instead of creating tasks such as:

- Design IAM roles
- Configure SSO

Create a discovery package:

**Define identity types and lifecycles across platform systems**

- **Output:** documented taxonomy of human, service, and workload identities
- **Non-goal:** selecting tooling or access policies

The resulting taxonomy allows downstream design to proceed without re-litigating the basic identity model.

![Requirements, performance and failure behavior, operational impact, accountability, complexity and tooling, and pre-mortem evidence converge on a responsible design commitment; design-informing questions shape the implementation without substituting for those gates.](../assets/images/framing-technical-work/design-gate-convergence.svg){#fig-design-gate-convergence}

---

## Design-Informing Example: A DNS Service

If the problem is "design a new DNS service," the following questions should be answered before solution selection.

### How will people consume the service?

Will users interact through:

- a user interface;
- an API; or
- GitOps or infrastructure as code?

Also ask:

- Are different consumption models supported for different users?
- Does the model encourage safe, repeatable change?
- Does it require deep DNS expertise from every user?

### Who will manage DNS, and how?

Will DNS be managed by:

- one team through service requests;
- a shared service with enforced boundaries; or
- a self-service model for application teams?

For any model:

- What boundaries exist?
- How are they enforced?
- Is enforcement procedural, technical, or both?
- How does the model scale as the organization grows?

For shared-service or self-service models:

- Which record types may a typical user modify?
- Which record types remain centrally managed?

MX, NS, and SOA records may require central management.

### Who owns each record?

The design must ensure:

- only approved users can modify a record; and
- Team A cannot change records owned by Team B.

That raises additional questions:

- Does ownership affect the domain structure?
- Should ownership be delegated through subdomains?
- How are ownership and changes audited?

The answers determine the authorization model, delegation boundaries, operational workflow, and evidence the system must preserve. Choosing a DNS product before answering them would convert the product's defaults into organizational policy without an explicit decision.

---

## Templates

Copy-paste these. **Bold fields are required.** Delete the guidance in *italics*.

### 9.1 Epic template

```markdown
**Summary:** <Area> | <Capability or change, stated as a noun phrase>

**Outcome / Exit Condition (REQUIRED - the epic is done when this is true):**
When this is done, <capability now possible / failure mode now impossible>,
measured by <metric or specific verification>, by <horizon>.

**Why now / Context:**
<What's driving this. If spawned from demand-driven work (Section 6), link the incidents it retires and the cause-category baseline.>

**Definition of Done (inherited from the TEAM DoD - restated here, not invented per epic; NOT the outcome):**
*This is the team-wide quality bar that already applies to every task of this kind; list it (or link it) so authors see it - don't author a new one. Add an epic-specific item only if this epic genuinely needs one beyond the standard.*
- <e.g. tracked in the relevant repo>
- <e.g. has logging>
- <e.g. has a regression/validation test>
- <complies with applicable governing standards, or links a documented non-applicability determination>

**In scope / Out of scope:**
- In: <...>
- Out: <...>   ← name what this epic deliberately does NOT cover

**Linked work:** <related epics, dependencies>
```

#### Filled example - the Example Epic, corrected

```markdown
**Summary:** Base image | one image, multiple runtimes

**Outcome / Exit Condition:**
When this is done, a single base image provisions Linux hosts across two runtime
types with ZERO manual post-build steps, verified by >=20 consecutive automated
builds passing post-build validation, and the legacy build path is
decommissioned. Target: end of Q3.

**Why now / Context:**
Manual, per-runtime builds are slow and error-prone. (Link recurring build
incidents here.)

**Definition of Done (inherited from the team DoD - binary, universal, substitutable invariants only):**
- Image content tracked in version control in the image-build repo
- Scripts have logging
- Each config has a regression/validation test in the post-build step
- Complies with the team's applicable governing standards, or links a documented non-applicability determination
*(Dropped from the original ticket: "environment-specific conditional" - a base image holds only what all systems need, so environment divergence belongs in layering or runtime metadata, not the DoD; "modular" - an architecture choice for design review, not a requester-owned DoD bar. See [Section 5](#three-things-people-confuse-dod-vs-acceptance-vs-outcome).)*

**In scope:** image content & configuration.
**Out of scope:** provisioning automation / self-service pipeline (separate epic).
```

### 9.2 Story / Work Package template

```markdown
**Summary:** <Outcome-oriented noun phrase>

**Intent (pick ONE - if you need two, it's two work packages):**
Discovery / Migration / Redesign / Enablement / Optimization

**Objective:** <What question this answers / what outcome it delivers.>
  (For Optimization/Enablement, name the Automation Ladder transition, e.g. "L1 -> L3".)

**Non-Goals (REQUIRED - what this explicitly does NOT decide/cover):**
<If a reviewer could plausibly expect an adjacent change here, say yes or no to it.>

**Pre-conditions (what must be true on day 1 before anyone starts):**
<Constraints, not solutions: security sign-off, access-policy access, a vendor decision, an upstream API.>

**Acceptance Criteria (REQUIRED - story is done when these pass):**
Given <context>, when <action>, then <observable result + how it's verified>.
- [ ] <one line PER measurable variable - don't lump latency+concurrency+scope together>
  ✗ Do NOT write "PR submitted" / "script written" - those are outputs, not behavior.
  ✗ Do NOT compound ("build X, then migrate Y to X") - that's two work packages.

**Output Artifact (the thing that proves it's done):** <not "running code" for Discovery>
**Downstream Enabled:** <what work can now proceed without rework>
**Parent epic:** <KEY>
```

> **Why the extra fields vs. a bare user story:** these come from our Work Package model - a work package is *outcome-oriented and independently estimable*, so it needs **one intent**, an explicit **Non-Goals** line (the #1 source of mid-sprint scope drift), and **Pre-conditions** (the reason "clean-looking" stories silently rot - they were never actually startable). A story missing **Non-Goals** fails readiness when the work touches anything cross-team (base image, access-policy, provisioning).

#### Filled example - the delivery story extracted from the Example Task

```markdown
**Summary:** Instances auto-register to the correct regional endpoint on first boot

**Intent:** Enablement (one base image usable across environments without rework)

**Objective:** A launched instance registers itself against the registration endpoint and token for its own region, so one base image works across environments with no per-environment edits.

**Non-Goals:** the metadata-source decision (settled in the preceding Discovery WP); creating the
per-region secret and access-policy grant (separate tasks).

**Pre-conditions:** per-region registration secret exists; instance role can read it.

**Acceptance Criteria:**
Given an instance launches in region-X, when startup configuration runs on first boot, then it
registers against the region-X endpoint using the region-X registration token, and
the registration status check succeeds.
- [ ] Region determined from instance metadata; no hard-coded values
- [ ] Registration endpoint URL and registration token fetched from the per-region secret
- [ ] Verified end-to-end in at least 2 regions
- [ ] Secret-fetch failure fails the build loudly (logged, non-zero exit)

**Output Artifact:** merged, version-controlled startup registration script and the
2-region verification evidence.
**Downstream Enabled:** base image can be shared to other environments with only secret and access-policy configuration.
**Parent epic:** Example Epic
```

### 9.3 Task template

```markdown
**Summary:** <Concrete deliverable, e.g. "Create per-region registration secret">

**Deliverable (done when this objectively exists):**
<The merged code / created resource / applied config.>

**Parent story/WP:** <KEY>
**Notes / how-to:** <links, snippets, gotchas>
```

### 9.4 Discovery work package template

*Use this when the unknown is "how" - a decision must be made before the build can be specified. It's a Story/WP with the **Discovery** intent; its deliverable is a recorded decision, not code.*

```markdown
**Summary:** <the question to answer, e.g. "Decide how an instance determines its region and registration endpoint">

**Intent:** Discovery

**Question:** <What decision must we make?>
**Done when:** a decision is recorded (in a comment / linked doc) - NOT when code merges.
**Scope / time-box:** <keep it small, e.g. 1 day>
**Output feeds:** <which story this unblocks>
```

---

## Quick reference

Pin this.

**The one rule:** *An epic is not done when its child tickets close. It's done when its **outcome** is true.*

**Pick the level by completion condition:**
- **Epic** -> done when its **outcome** (measured change) is true -> write the Outcome / Exit Condition (one or more checkable conditions)
- **Story/WP** -> done when **acceptance criteria** (observable behavior) pass
- **Task** -> done when a **deliverable** objectively exists
- **Discovery WP** -> done when a **decision** is recorded

**Where to split (and which way):**
- *Diverges across "ands" but worthless apart?* -> **still one epic.** Epics are meant to diverge.
- *A piece delivers value alone, independent of its siblings?* -> it's its **own epic**.
- *A work package carries two intents (decide + build, build + migrate)?* -> **two work packages.** The single-intent rule lives at the story layer, not the epic layer.

**Three fields people confuse:**
- **DoD** = workmanship bar, same for every item (includes **standing gates**)
- **Acceptance** = does *this* item behave as promised
- **Outcome** = did the *epic* change what we wanted

**Standing gates (anti-weasel - on by default, every item):** security-compliant *or* approved+documented exception · test bar met · observability · docs updated. "It wasn't in the AC" is not a defense.

**Banned acceptance criteria:** "PR submitted," "code written," "script created." Describe the **behavior**, not the **artifact**.

**Outcome formula (use either form - qualitative is the common case for ops):**
> *Quantitative:* We'll know this is done when [metric/state] moves from [baseline] to [target], measured by [method], by [horizon].
> *Qualitative:* When this is done, [capability] is now possible / [failure mode] is no longer possible, verified by [specific check].

**Demand-driven work (Section 6):** capture it by **work type** (not a removable tag) + a resolve-gated **cause** + time. When a cause category crosses the threshold -> **spawn a roadmap epic to retire it, with its outcome measured back against the demand data.** That is the loop leadership needs to see. Roadmap vs demand is a clean two-way split; change/CAB is an audit overlay, not a third bucket.

**Three modes (author effort scales with uncertainty):** roadmap/bespoke -> full machinery · demand/reactive -> light, just enough to stay countable · repeatable/request -> machinery frozen into the work type.

**Definition of Ready (don't start until):** one intent · acceptance criteria written · Non-Goals written · standing gates satisfiable · vertical slice · dependencies known · unknowns resolved up front · linked to an epic that has a real outcome.

<!-- Preview assembly source: Framing-Technical-Work-Before-Design.md: Discovery Package Template and DNS example; Writing Work Items - Epics, Stories, and Tasks.md: Templates and Quick reference -->
