# Writing Work Items: Epics, Stories & Tasks

*A standard for pre-task project planning — how to describe the work and how to know when it's done.*

**Audience:** everyone who writes work items in Jira — across every tech-related department. No project-management background assumed.
**Status:** v1. This is a living standard; see [Section 10](#10-quick-reference) for the one-page version you'll actually keep open.

---

## How to read this document

Sections 1–8 explain the **principles** — *why* we do this and *how* to think about it. Section 9 gives you the **strict templates** to copy-paste. Section 10 is the **checklist**.

If you only have five minutes, read [Section 1](#1-why-this-exists) and [Section 10](#10-quick-reference).

Throughout, we use two of our own real work items as worked examples — one epic and one task — because the lessons land harder when the material is ours. Their **as-written** content lives in the [**Example tickets**](#the-example-tickets-as-written) tab; the analysis below refers to them as the **Example Epic** and the **Example Task**:

- the **Example Epic** — a golden-image epic
- the **Example Task** — a cloud-init / capsule-registration item (typed a Task; child of the epic above)

Both are useful precisely because they show what to fix.

---

## The example tickets (as written)

> **Why these are here.** This standard uses two of our own real work items as worked examples — one Epic, one Task — because the lessons land harder when the material is ours. Their **as-written** content is reproduced here so the rest of the document is self-contained; Sections 1–9 refer to them as the **Example Epic** and the **Example Task**. They're useful precisely because they show what to fix — not to single out whoever wrote them.

### The Example Epic

**Type:** Epic

**Description (as written):**

> Epic to track work related to enabling and building a golden image. This focuses on the Image itself and not necessarily automating provisioning with GitHub Actions or existing self-service, which will be covered in the Golden Image Pipeline Epic.
>
> Note: Many of these configs are only applicable to on-premise machines. EC2's get a DHCP IP from within their host subnet. DHCP also provides nameservers and NTP servers for EC2 instances. As this image will eventually be used for provisioning all machines, there should be logic to skip configurations if it is being run on an EC2.

**Definition of Done for all Jiras in this Epic (as written):**

- image-based configurations should be tracked in our Image Builder tool (RHIB/Packer) repo
- almost all of these configurations are for on-prem machines only, so additional logic for them to not run on EC2's should be included
- cloud-init scripts should be modular and managed in code
- scripts should have logging
- all configurations should have a regression test or validation test in a final post-build validation step
  - the output of this test would be parsed by the VM-creation workflow to determine success/fail of the VM build
  - these images will eventually be used for EC2, Nutanix, and hopefully Baremetal builds, so any hypervisor-specific logic should account for hypervisor or machine type. We don't need to make every function work in all hypervisors now, but the code should not be written in a way where significant refactor would be necessary to do so later.

*What's wrong with this — and the corrected version — is worked through in [Section 1](#1-why-this-exists), [Section 3](#3-writing-outcomes-for-epics), and [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome); the corrected epic is in [§9.1](#91-epic-template).*

### The Example Task

**Type:** Task — *mis-typed; it's really a Discovery work package, then a Story, then tasks (see [Section 2](#2-the-work-hierarchy)).*

**Description (as written):**

> This Jira will identify methodology for dynamically targeting a region- or VPC-specific RH Capsule server.
>
> I would propose we use a cloud-init script that will use IMDSv1 EC2 instance metadata (I do not believe we have IMDSv2 enabled on our EC2s) to determine its account number / VPC / region. Then, based on OS major version, it will fetch a secret which contains the capsule URL and RHEL-version activation key.
>
> The secret will be created in: *[internal reference]*. Updating EC2 instance role for permissions to access the secret: *[internal reference]*.
>
> Please note we are not using the subscription-manager registration command. We are pulling a script from the target capsule:

```
#/etc/cloud/cloud.cfg
runcmd:
# the '|' takes the following line as a string so ':' is not interpreted by the json as part of a key:value pair
 - |
   wget -O /root/anaconda-register.sh 'https://<capsule_IP>:9090/register?hostgroup_id=17&organization_id=1&update_packages=false' --header='<Satellite registration auth token>'
 - sudo bash /root/anaconda-register.sh
 - sudo subscription-manager repos --enable=Default_Organization* --enable=rhel*
 - sudo yum-config-manager --disable *rhui*
```

> The methodology we use to dynamically get the capsule URL and activation key should be transportable to other accounts, so ideally we can share a single AMI to other accounts while only needing to worry about the secrets / KMS key / IAM permissions in the destination accounts.

**Acceptance Criteria (as written):**

> PR submitted with cloud-init script that can dynamically determine capsule URL and activation key.

*Why this is mis-leveled — and how to split it — is in [Section 2](#2-the-work-hierarchy), [Section 4](#4-acceptance-criteria-for-stories--work-packages), and [Section 7](#7-splitting--sizing); the extracted story is in [§9.2](#92-story--work-package-template).*

---

## 1. Why this exists

We keep hitting the same wall: **we cannot tell when an epic is done.** We close the child tickets, and then we stand around asking "…so, is it finished?" Nobody can answer, because nobody wrote down what *finished* means.

This is not a discipline problem or a writing-style problem. It is a **definition problem**, and it has a specific root cause:

> **We describe work by its *output* (the thing we build) instead of its *outcome* (the change the thing is supposed to cause).**

An **output** is an activity or artifact: *"build a golden image,"* *"submit a PR."* An output is "done" when the activity stops — which is to say, never cleanly, because there's always more you *could* do.

An **outcome** is a change in the world, stated as a condition that is either true or false: *"all hosts provision from one image with zero manual steps,"* *"instances auto-register to the correct regional capsule on first boot."* An outcome is done when the condition becomes true. You can *check* it.

### The one rule that fixes the headline problem

> **An epic is not done when its child tickets are closed.**

The child stories and tasks are a *bet* — our best current guess at the work that will produce the outcome. If every child is closed but the outcome didn't happen, **the epic is not done.** You write more stories, or you change the approach. Closing tickets is activity; achieving the outcome is the point.

Everything else in this document exists to make that rule operable.

### Worked example: what the Example Epic gets right and wrong

The Example Epic actually *has* a "Definition of Done." Here it is, paraphrased:

- image-based configs tracked in our Image Builder (RHIB/Packer) repo
- on-prem-only configs include logic to skip on EC2
- cloud-init scripts modular and managed in code
- scripts have logging
- every config has a regression/validation test in a post-build step

Read that list again. **Not one item tells you when the *epic* is finished** — at best they're per-*child-task* quality bars. "Enabling and building a golden image" is an activity with no end state — so it ends when we get tired of it, which is exactly the problem we're trying to kill.

(And only *at best*: two of these aren't even clean quality bars. "Skip on EC2" misunderstands the epic — a *golden/base* image holds only what **all** systems need, so per-environment conditionals don't belong in it at all; environment divergence lives in image *layering* or runtime metadata, not baked-in `if-EC2` logic. "Modular… in code" dictates an *architecture*, which a Definition of Done has no business mandating. We dissect why in [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome); for now just note that a sloppy DoD is hiding an *absent* outcome.)

What's missing is an **outcome / exit condition** for the epic itself. Something like:

> *A single golden image provisions RHEL9 hosts across EC2 and Nutanix with zero manual post-build steps; ≥20 consecutive automated builds pass post-build validation; the legacy PXE/kickstart path is decommissioned.*

That sentence is checkable. Today's epic is not. We'll fix it properly in [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome).

---

## 2. The work hierarchy

We use four levels. **The level is decided by the *kind of completion condition* the work has — not by how big it feels or how many hours it takes.**

| Level | What it is | "Done" means… | Completion condition is… |
|---|---|---|---|
| **Epic** | A meaningful change in capability, reliability, risk, or cost | The **outcome / exit condition** is met | A measured change in the world (metric or verifiable end-state) |
| **Story / Work Package** | One coherent slice of user- or system-visible behavior | **Acceptance criteria** pass | Testable behavior — observable from outside |
| **Task** | A concrete deliverable contributing to a story | The deliverable **objectively exists** | Binary: it's merged / created / configured, or it isn't |
| **Sub-task** | A checklist step inside a task | The step is done | Binary, usually only meaningful to the assignee |

> **"Story" and "Work Package" are the same level**, named differently by different teams. Planned product-style work tends to say "Story"; operational and infrastructure work tends to say "Work Package." Pick one term per project and stick to it. This doc uses **Story/WP** interchangeably.

> **Who owns what (this matters for the rest of the doc):** an epic is, in effect, a **broad-stroke request from the business** — and its **Outcome** and **Definition of Done are owned by the requester / standard-owner, not by the implementers.** The people choosing *how* to build it don't get to rewrite the bar they're measured against. The practical consequence shows up in [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome): because the DoD isn't the implementers' to write, it can only hold things the business can legitimately demand — **substitutable, checkable invariants** ("works on both hypervisors," "complies with our standards") — never *architecture choices* like "make it modular," which would be the requester reaching into the implementers' domain.

### Where to split — and at which layer

One mistake people make is trying to split an *epic* the moment its scope diverges. Usually that's wrong. **Epics are supposed to be divergent.** An epic aggregates work that serves *one capability* — and the pieces are often *expected* to span wildly different kinds of work.

> **Worked example — a metrics system epic.** "Ingest *X* metrics in time *t*," "render visualizations of *Y*-size queries in *t₂*," "enforce standard RBAC." Those three diverge enormously — different skills, different acceptance tests, different risk profiles. **It's still one epic**, because none of them delivers a usable metrics system on its own: ingestion with no visualization is invisible plumbing; visualization with no RBAC isn't releasable. They are worthless apart, so they cohere.

So the "I diverged widely across the *ands*" instinct is a **false alarm at the epic layer.** 

Apply two tests in order — one for whether a piece is its own epic, one for whether a work package is really two.

**Test A — the standalone-value test (decides: one epic or two?)**
> *If I shipped this slice and nothing else, would someone get real value from it — without the siblings shipping too?*
- **Yes** → it stands alone; make it its **own epic.**
- **No — it's worthless or unreleasable without its siblings** → **same epic.** (Metrics: ingestion, visualization, and RBAC each fail this, so all three stay together.)

**Test B — the single-intent test (decides: one work package or two?)**
Once you're inside an epic, each "and" becomes a **work package (story)**. Name its intent — pick exactly one:

- **Discovery** — reduce uncertainty; deliverable is a reusable artifact (taxonomy, decision record, capability list)
- **Migration** — move state A → state B
- **Redesign** — change structure
- **Enablement** — remove blockers for others
- **Optimization** — improve efficiency

> *Can I name a single intent for this work package, or do I need two?*
- **One intent** → it's one work package.
- **Two intents** (a *decision* **and** a *build*; a *build* **and** a *migration*) → it's **two work packages wearing one ticket** — split it. The tell: an acceptance criteria that reads *"1. build and test X; 2. migrate Y to X"* is two work packages, and either half can keep the ticket alive forever.

So the metrics epic splits *downward* into work packages — "ingest pipeline," "query/visualization layer," "RBAC" — **not sideways into more epics.** (A decide-then-build is the same call: the Discovery and the build are two intents, so pull the Discovery out as its own work package whose done-condition is *"a decision is recorded,"* then build against the decision — see [Section 7](#7-splitting--sizing).)

### Worked example: why the Example Task is mis-leveled

The Example Task is typed as a **Task**, but it bundles three different kinds of work, each with a different completion condition:

1. **A Discovery / decision** — *"This Jira will identify methodology for dynamically targeting a region or VPC-specific RH Capsule server."* Done when a decision is recorded.
2. **An implementation** — the cloud-init script using IMDSv1 metadata to fetch the regional secret. Done when it's merged and works.
3. **Infrastructure changes** — *"create the secret,"* *"update the EC2 instance role IAM permissions."* Done when those resources exist and grant access.

Three completion conditions = at least three items, and by **Test B** it fails immediately: it carries multiple intents — a *Discovery* ("identify the methodology") fused to a *Redesign/Enablement* build. This isn't one task; it's a **Discovery work package** (decide the approach) followed by a **Story/WP** to implement it, with child tasks for the secret and the IAM change. It is not one task.

---

## 3. Writing outcomes (for epics)

> **Scope:** outcomes are a **roadmap-work** construct (Section 6). Reactive demand items — incidents, standard requests — are *not* given outcome statements; they're governed by resolution and structured capture. This section is about the improvement epics we *choose* to run.

Every epic needs an **Outcome / Exit Condition** — at least one checkable condition, and often several bundled into the one field (the corrected Example Epic below combines three). Use one of these two forms for each condition.

**Quantitative (preferred when a metric exists):**
> We'll know this is done when **[metric/state]** moves from **[baseline]** to **[target]**, measured by **[method]**, by **[horizon]**.

**Qualitative (when the change is a capability or a removed risk):**
> When this is done, **[capability]** is now possible / **[failure mode]** is no longer possible, verified by **[specific check]**.

The qualitative form still has to be *checkable* — "verified by [check]" is not optional. "Improve reliability" is not an outcome; "no P1 incidents attributable to cause X for 30 rolling days, confirmed from the incident log" is.

> **The substitutability test — outcome vs. implementation.** The trap isn't vagueness; it's naming a *how*. An outcome must survive **swapping the implementation underneath it**: "ingest X metrics within *t*" stays true whether you use cloud-init, Telegraf, or anything else, so it's an outcome. "cloud-init scripts are modular" names a mechanism — swap cloud-init out and the clause is meaningless — so it's an *implementation detail*, not an outcome (and not a DoD invariant either; see [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome)). Note the test is **not** "is it specific?" — "zero manual post-build steps" is brutally specific and names no *how*, so it passes. **Ask: does this clause name a mechanism? If yes, it doesn't belong in the outcome.**

### The ops outcome catalog

Much of our work delivers value as **reduced risk or reduced toil**, which people find genuinely hard to phrase as an outcome ("how do I put 'we made it less likely to break' into a done-condition?"). Use these four patterns — most ops epics are one of them. **Phrase them additively, not subtractively** (see the *Automation ROI — SLT Reporting* template): leadership hears "capacity reclaimed," not "work avoided."

| Outcome type | Phrase it as… (additive) | Example |
|---|---|---|
| **Reliability / SLO** | A failure rate or availability target held over a window — or *zero-miss execution* | "Image-build success rate ≥ 99% over 30 days" |
| **Toil → throughput** | **Capacity reclaimed**, measured `t × n` per period and redirected to roadmap | "Host provisioning requires 0 manual post-build steps (was 7); ~`t×n` hrs/period reclaimed for roadmap" |
| **Risk retirement** | A failure mode made impossible, or a single point of failure removed | "No host can register against the wrong regional capsule; enforced by per-region secret + IAM scoping" |
| **Capability at zero marginal cost** | New capability that scales **without added headcount** | "New VPCs' hosts stand up with no bespoke config — output grows, team size flat; proven in 2 regions" |

> **Quantifying toil:** `reclaimed = t × n` per period (t = time per occurrence, n = occurrences per period). When `t×n` is small, **lead with the reliability/zero-miss win, not the hours** — e.g. auto-sprint-creation saves ~2 hrs/yr but its real value is "the team always has a place to plan into; no one has to remember." Don't undersell a reliability win by reporting only its modest hours.

> **Automation Ladder** — for *Optimization / Enablement* outcomes, state the **level transition** rather than "automate X":
> **L0 Undocumented** (tribal) → **L1 Documented** (runbook) → **L2 Checklist** (verifiable, no shadowing) → **L3 Semi-automated** (human runs + validates) → **L4 Fully automated** (event-triggered, human notified).
> e.g. *"Move pipeline-X provisioning from L1 (runbook) to L3 (Ansible playbook)."* Not everything needs L4 — but **nothing should stay at L0**, because that's key-person risk written as a process.

### ❌ → ✅ for the Example Epic

**❌ As written:** *"Epic to track work related to enabling and building a golden image."* — an activity, no end state.

**✅ Outcome statement:**
> *When this is done, a single golden image provisions RHEL9 hosts across EC2 and Nutanix with **zero manual post-build steps**, verified by **≥20 consecutive automated builds passing post-build validation**, and the **legacy PXE/kickstart path is decommissioned** by end of Q3.*

That combines toil-reduction + reliability + risk-retirement, and every clause is checkable.

---

## 4. Acceptance criteria (for stories / work packages)

Acceptance criteria (AC) define **done for a story** in terms of **observable behavior**. They are the contract: if the AC pass, the story is accepted — no debate.

Two formats. Use whichever fits; don't mix within one criterion.

**Given / When / Then** — best for behavior with conditions:
> **Given** an instance launches in VPC-X, **when** cloud-init runs on first boot, **then** it registers against the VPC-X regional capsule using the VPC-X activation key, and `subscription-manager status` reports `Overall Status: Current`.

**Checklist** — best for a set of concrete, independent conditions:
> - [ ] Script determines region/account/VPC from instance metadata with no hard-coded values
> - [ ] Correct capsule URL + activation key fetched from the per-region secret
> - [ ] First-boot registration verified in **at least 2 regions**
> - [ ] Failure to fetch the secret fails the build loudly (logged, non-zero exit)

### The "PR submitted" rule

> **Never write "PR submitted," "code written," or "script created" as an acceptance criterion.** Those describe an *output existing*, not a *behavior working*.

The Example Task's sole acceptance criterion was:

> ❌ *"PR submitted with cloud-init script that can dynamically determine capsule URL and activation key."*

This is done the moment a PR exists — even if the script never successfully registers a single instance. The real done-condition is the ✅ Given/When/Then above: *an instance actually boots in a region and registers against the correct capsule.* A PR is how the work arrives; it is not proof the work worked.

**Good AC are:** observable from outside, testable (pass/fail with no judgment call), and about *behavior or end-state* — never about the existence of an artifact.

---

## 5. Three things people confuse: DoD vs. Acceptance vs. Outcome

This is the single biggest source of our "is it done?" confusion. These are **three different fields** that answer **three different questions**, and the Example Epic mixed them up.

| | **Definition of Done (DoD)** | **Acceptance Criteria** | **Outcome / Exit Condition** |
|---|---|---|---|
| **Answers** | "Is our *workmanship* up to standard?" | "Does *this specific item* do what it promised?" | "Did the *epic* achieve the change we wanted?" |
| **Scope** | Same checklist for **every item of its kind, team-wide** (e.g. every task) — authored once, not per ticket and **not per epic** | **Unique** to each story | **Unique** to each epic |
| **Example** | "Has tests, has logging, peer-reviewed, docs updated" | "Registers in 2 regions on first boot" | "Zero manual provisioning steps; legacy path retired" |
| **Lives on** | Team standard (applies to all stories/tasks) | The story/WP | The epic |

**The key insight applied to the Example Epic:** that epic's "Definition of Done" block was doing the **outcome's** job — it was the de-facto "are we finished?" list — while the actual outcome slot sat empty. That's the core error: a DoD was made to carry a burden it can't bear, because no outcome existed. Both fields should exist, and they're different:

- **Promote the *valid* items** — "tracked in version control," "has logging," "has a validation test" — to the **team's DoD**, so they apply to every task (probably every infra task we write).
- **Drop the items that were never DoD material.** Two of the five don't belong in *any* of these three fields:
  - *"On-prem-only configs skip on EC2"* — incoherent for this epic. A **golden/base image contains only what every system needs**; environment divergence belongs in image **layering** or runtime metadata resolution, never as baked-in conditionals. This isn't a mis-slotted bar, it's a misunderstanding of how images compose.
  - *"cloud-init scripts are modular"* — an **architecture decision**, and (per the ownership model in [Section 2](#2-the-work-hierarchy)) the DoD is the requester's bar, not the implementers'; it has no standing to mandate a design. Architecture quality is real and worth pursuing — it just lives in **design / code review**, not a DoD (see the note at the end of this section). *(Note "modular **and managed in code**" was also redundant: "managed in code" = version-controlled = the item we already kept.)*
- **Add** the missing **Outcome statement** from [Section 3](#3-writing-outcomes-for-epics).

Two different fields. We were writing one, calling it the other, and smuggling two non-bars into the mix.

### Standing gates (the anti-weasel rule)

There's a failure mode the DoD exists to kill: someone ships something insecure (or undocumented, or untested) and defends it with *"it wasn't in the acceptance criteria."* That's a lame defense — but if our standard relies on each author *remembering* to write a security criterion every time, it will eventually win, because people forget and reviewers are busy.

The fix is **standing gates**: a small set of requirements baked into the team DoD that apply to **every** item **by default**, whether or not anyone wrote them on the ticket. The only way past a standing gate is a **documented, approved exception** — not silence.

> **Standing gates (apply to every story/WP unless an approved exception is linked):**
> - [ ] **Complies with existing security requirements, or has an approved and documented exception** (link it)
> - [ ] **Complies with the team's applicable governing standards, or links a documented non-applicability / exception determination**
> - [ ] Meets the team's testing/validation bar (see DoD)
> - [ ] Observability in place where applicable (logging/metrics)
> - [ ] Docs/runbook updated where behavior changed

> **The compliance gate is *parameterized* — bind it to your team's standard, don't hardcode one.** The portable part is the **mechanism** (default-on; the only way past is a *written* determination, never silence). The **specific standard is per-team configuration**: an SRE-governed service binds to the relevant SRE RFCs (e.g. service-acceptance and scorecard standards); an enterprise-applications team binds to whatever governs their SaaS estate (ServiceNow, Salesforce, NetSuite); image/Satellite work binds to whatever governs it. Hardcoding one team's standard into this doc would silently exclude every team it doesn't cover — the same parochialism we avoid by treating project keys like OPS/SED as *our instance*, not the rule.
> **Why "or links a documented non-applicability determination" carries the load — not the word "applicable":** letting an author silently judge a standard "not applicable" reopens the exact "it wasn't in the AC" hole this section exists to close. The escape isn't an *assertion* that something doesn't apply; it's a **recorded determination** that it doesn't. Spell the opt-out out inline so "applicable" is just a pointer, never the thing doing the adjudicating.

Why this beats "train everyone to imagine how 'done' could be false": that habit (asking *"under what condition is this claim untrue?"*) is excellent and worth teaching — but it's a *personal* discipline, unevenly applied. A standing gate is *structural*: it doesn't depend on the author's diligence, and it converts *"it wasn't in the AC"* from an escape hatch into an admission that a required gate was skipped without an approved exception. Security as a default-on gate means nothing ships insecure *quietly*; if there's a real reason to defer, it gets written down and approved, which is exactly the audit trail you want.

> **Note the scope:** standing gates live in the **DoD column** (apply to everything), not the **Acceptance column** (unique per story). The whole point is that they're *not* something each author re-invents per ticket.

### Architecture quality has a home — and it isn't here

A DoD holds **binary, universal, substitutable invariants** — things that are pass/fail with no judgment call and stay true no matter which solution you pick. "Modular," "loosely coupled," "easy to change later" are none of those: they're **judgment calls**, they're **solution-dependent** (sometimes one tight script is the right answer), and the DoD is the requester's bar, not a place to grade engineering taste. So they don't go in the DoD, Acceptance, or Outcome.

That does **not** make them unimportant. Here we deliberately push back against building a monolithic, single-purpose solution for every narrow use case — **build for modifiability**, so the system flexes as markets (and threats) change unpredictably. That's a real and valued **engineering principle** — it just lives in **design review and code review**, where judgment-based quality is assessed by people, not auto-checked off a ticket. Keep the work-item fields for what's checkable; keep architecture where it can be argued.

---

## 6. Demand-driven work is first-class

We are an operations team: a large share of our work is **not roadmap work** — hardware failures, resource exhaustion, incidents, and a steady stream of standard requests (build me a server, sign this RPM). A planning standard that pretends everything is deliberate project work is useless to us. So we name this work explicitly and give it a place in the same reporting system.

Throughout this section, distinguish two things people lump together:

- **Roadmap-driven work** — improvement we *chose* to do. This is where the epic/outcome machinery in Sections 2–5 lives.
- **Demand-driven work** — work that *arrives*, whether we planned for it or not. It splits in turn into **reactive** (incidents — unpredictable) and **repeatable** (requests — predictable, same shape every time).

### The reporting-boundary principle (and our instance of it)

> **Once roadmap-driven and demand-driven work are reviewed by different people and at different cadences, putting them in one bucket can only produce confusion.** Give each its own reporting boundary.

Think of a ticketing boundary the way you'd think of a service boundary: separating two concerns that are owned, reviewed, and reported differently buys you clean signal; collapsing them buys you noise. (Sometimes one bucket genuinely *is* right — a small team with low interrupt volume. Deciding **where to draw your own boundaries** is out of scope for this document; what follows assumes you've decided you need one.)

> **Our instance.** We split the boundary across two Jira projects: **OPS** for roadmap-driven work, **SED** for demand-driven work (enterprise-infrastructure operations — analogous to a service desk, different skill set). The examples in this doc (the Example Epic and Example Task) are roadmap items, so they're OPS. Your org will have its own names; the *pattern* is what's portable, not the project keys.

> **A note on change management.** Changes are roadmap-driven by definition, and here a separate change/CAB system governs them — but that system is an **audit overlay**, not a third category of work: no central board can assess a change's impact independently of the experts who own it, so CAB exists to confirm the i's are dotted, not to own the work. It does not affect the roadmap-vs-demand split, which stays a clean **two-way** cut. (We borrow ITIL as a shared vocabulary for these ideas; we are not a strict ITIL shop, and nothing here requires ITIL compliance.)

### The work taxonomy

| Type | What it is | How we track it | Becomes an epic? |
|---|---|---|---|
| **Incident / break-fix** | Reactive response to something broken now | A distinct **work type** set at creation; cause from a **required, resolve-gated field**; time from the **worklog**. **Not** an epic. | No — a single incident *feeds* the data below |
| **Request** | A standard, repeatable ask with a known procedure (e.g. server build, RPM signing) | Its own **work type(s)**; governed by **acceptance criteria frozen into the type** (see [below](#repeatable-requests-the-machinery-frozen-into-a-form)) | No — it's steady-state demand, not improvement |
| **Recurring toil** | The same manual fix/request, again and again | **Not a work type you create** — a **derived signal** from aggregating the above **by cause** | **Yes — when a *cause category* crosses a threshold** (see below) |
| **Roadmap project work** | Deliberate improvement we chose to do | Epics with outcomes (Sections 2–5) | It already is one |

> **Surface toil by work *type*, not by *tag* — and let that get harder, not easier, as you mature.** Two rungs:
> - **Rudimentary (one project):** make "incident," "request," etc. **distinct work types chosen at creation**, and have humans **reclassify** the occasional mistake. Do **not** use a removable *tag* or *label* for this. Reclassifying a work type and toggling a tag are nearly identical effort — but a tag is a manual setting that's trivially and *accidentally* removed (a config change living outside version control), whereas a work type is closer to an immutable choice: changing it is deliberate. That friction is a **feature** — it resists silent reclassification, and a misclassification you *have* to consciously fix is itself a **signal that intake (or the system being managed) needs attention**. Use the tool's real capabilities; technology won't fix a behavioral failing, but a proper work type buys you organization, audit trail, and clean aggregation that a tag never will.
> - **Advanced (separate boundary, our OPS/SED setup):** once demand-driven work has its own project, **"recurring toil" stops being a type you file and becomes a number you compute** — aggregate SED items by their resolve-gated **cause** and rank by count and reclaimed hours. This is the [Automation Ladder](#the-ops-outcome-catalog) pointed at the planning process itself.

### The toil-to-epic rule (this is the feedback loop)

> **When a cause category crosses a threshold — e.g. *N occurrences* or *X hours* in a rolling window — it spawns a roadmap epic (in OPS) whose outcome is "retire this demand source," measured back against the demand data (SED).**

This is the mechanism that turns reactive pain into planned improvement, and it's exactly the narrative SLT wants to see — note that it **crosses the boundary** (demand data in → roadmap epic out → outcome verified against the same demand data):

```
demand-driven work (SED): incidents + requests
        │  cause + time captured structurally (work type, resolve-gated field, worklog)
        ▼
top demand drivers, ranked by count × hours
        │
        ▼
   spawn roadmap epic (OPS) to retire the driver
        │                                   │
        ▼                                   ▼
   reported as %                  outcome measured in SED (Section 3)
 roadmap vs demand     ◄──────  did the driver's volume actually shrink?
```

So the reporting story to leadership becomes digestible and honest: *here's our roadmap-vs-demand ratio → here are the top drivers of the demand half → here are the epics retiring those drivers → here's the outcome each one moved, read straight from the demand data.* That loop only works if (a) cause and time are captured **structurally**, and (b) the epics we spawn from it have **real outcomes** — which is the whole point of this document.

> **Worked example — the loop crossing the boundary.** Over a rolling 90 days, SED shows **23 On-Premise Incidents** sharing the resolve-gated cause *"manual capsule re-registration after capsule cert rotation,"* totalling ~31 hours. That crosses our threshold, so it spawns a roadmap epic in OPS — *not* another SED incident:
> - **OPS epic outcome:** *"No host requires manual capsule re-registration after a cert rotation; verified by zero SED incidents with this cause for 90 consecutive days post-rollout, and a successful automated re-registration observed across ≥2 capsules."*
> - The **baseline (23/quarter, ~31 hrs)** comes straight from SED; the **outcome is measured back in SED** (does the cause category go to zero?). The incident tickets themselves stay in SED as reactive work — they were never going to "become" the epic; they're the *evidence* that justified opening it.

### What the demand data is *for*

The point of capturing demand-driven work this carefully is two specific payoffs:

1. **A leading indicator.** Aggregated incidents should surface a systemic problem **before our customers feel it**. (We hold a deliberate, *non-zero* tolerance for customers noticing first today — but that tolerance is a stated baseline we intend to drive down, not an accepted permanent state.)
2. **A prioritization signal for the roadmap.** Demand data is how we *rank* OPS bugs and improvements honestly: "this bug caused **17 incidents in the last 30 days**" or "this feature reclaims **~`t` hours/month**." Severity comes from incident count; value comes from reclaimed effort. Without this, prioritization is opinion.

> **The data is only as good as its weakest manual input.** This loop drives leadership reporting and epic prioritization, so it cannot rest on anyone *remembering* to classify a ticket — voluntary tagging fails often enough to make the totals untrustworthy, and unreliable data here is worse than none because it gets acted on. Push the capture into the structure: **work type** chosen at creation, a **cause** field made **required to resolve** (the same resolve-gate mechanism as the standing gates in [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome)) and presented as a **closed dropdown** (not free text) so categories aggregate cleanly, and **time from the worklog** rather than a hand-typed estimate. Keep the human surface as small as possible, and treat any number that depends on optional input as an estimate, not a fact.

### Repeatable requests: the machinery frozen into a form

A **request** (server build, RPM signing) is the limit case of everything in this document. Sections 2–5 are all machinery for managing *uncertainty* — outcomes because epic completion is divergent, acceptance criteria because each story's behavior must be pinned down, a Discovery work package because you don't yet know "how." A request is the case where **variance from one instance to the next drops to nearly zero**: the outcome is the same every time, and the procedure is known.

So the rules don't disappear — they get **authored once into the request *type*** instead of re-written on every ticket:

| For bespoke work (an OPS story) you… | For a request you… |
|---|---|
| Write an outcome per epic | Inherit a **fixed outcome** baked into the request type ("server built to spec, reachable, registered") |
| Write acceptance criteria per story | Reuse **identical AC** every instance — defined once on the type |
| Enforce a Definition of Ready as a checklist | Enforce DoR through **required form fields** |
| Pull out a Discovery WP when "how" is unknown | Have **no unknown** — the "how" is the standard procedure |
| Apply the single-intent test yourself | Get single-intent **guaranteed by the type** |

This is the same two ideas you've already met, taken to their limit: it's the [Automation Ladder](#the-ops-outcome-catalog) applied to *work definition* (a bespoke outcome is tribal/per-instance; a request type is encoded and verifiable without re-authoring), and it's the [standing-gates](#standing-gates-the-anti-weasel-rule) idea where *everything* is a standing gate and *nothing* is bespoke.

> **The precondition is a stable outcome, not just tidy fields.** Well-defined form fields are how you *encode* a repeatable request — they are not what *makes* it one. If two instances of the same request could legitimately have different success conditions, it isn't a request yet; it's bespoke work wearing a form, and you still need per-ticket outcome thinking. Fields are downstream of a stable outcome, never a substitute for one.

> **Where this lives for us:** requests are **SED work types** (our instance), governed this way — standard ITIL service-request handling applied to a function that benefits from the model, in a place that doesn't require ITIL compliance.

### The three modes, in one frame

Everything above resolves into three modes of work, and the right machinery follows from which mode you're in:

| Mode | Example | Completion is defined… | Governance |
|---|---|---|---|
| **Roadmap / bespoke** | An OPS improvement epic | **Authored per item** (outcome → AC → DoD) | Full machinery, Sections 2–5 |
| **Demand / reactive** | A SED incident | By **resolution + structured capture** (cause, time) | Light; its *value* is as the evidence base feeding roadmap prioritization |
| **Repeatable / request** | A SED server-build request | **Frozen into the work type** once | Authoring collapses to form-filling + field validation |

The portable claim — independent of OPS/SED or any tool — is that **authoring effort should scale with uncertainty.** Bespoke work earns the full machinery; repeatable work amortizes it into a form; reactive work is governed just enough to stay countable.

---

## 7. Splitting & sizing

### INVEST — the quick gut-check for a story/WP

A good story is:
- **I**ndependent — can be built without waiting on a sibling
- **N**egotiable — describes the *what*, leaves room on the *how*
- **V**aluable — delivers something observable to a user or system
- **E**stimable — the team can size it; if not, it's too vague or too big
- **S**mall — fits comfortably in a sprint
- **T**estable — has acceptance criteria that pass/fail

If it fails **E** or **S**, split it. If it fails **T**, you haven't defined done yet.

### Split by vertical slice, not by layer

Prefer slices that each deliver a working end-to-end sliver (*"register in one region, end to end"*) over horizontal layers (*"write all the IAM,"* then *"write all the scripts,"* then *"test everything"*). Vertical slices each have a real acceptance criterion and can be called done independently. Horizontal layers can't be "done" until the last one lands.

### Separate the decision from the delivery

If you don't yet know *how*, the unknown is its own work. Pull it out as a **Discovery work package** (Section 2) that:
- has the done-condition **"a decision is recorded"** (e.g. a comment, a short doc, a chosen approach) — *not* "code merged";
- is deliberately **scoped small / time-boxed**;
- produces the information needed to write the *real* story's acceptance criteria.

**The Example Task should have been split:**
1. **Discovery WP** — "Decide how an instance determines its region/capsule (IMDSv1 vs v2, secret layout)." Done when the approach is written down.
2. **Story** — "Instance auto-registers to the correct regional capsule on first boot" (AC from [Section 4](#4-acceptance-criteria-for-stories--work-packages)).
3. **Task(s)** — "Create per-region capsule secret," "Grant EC2 instance role read access to the secret."

Three completion conditions, three (or more) items.

---

## 8. Definition of Ready

The mirror image of "done." **Definition of Ready (DoR)** is the gate an item must pass *before* anyone starts it. This is what lets us **scope work before committing to it** — our stated short-term need before we can move from scramble to predictable flow.

> **Scope:** this DoR is for **roadmap work** (Section 6). Reactive demand items don't pass through it — an incident has no parent improvement epic and can't wait on a readiness gate; a standard request is "ready" by virtue of its work type's required fields being filled. Applying the gate below to either would be a category error.

**A story/WP is Ready when:**
- [ ] It carries **one intent** (Section 2) — not a build *and* a migration in one ticket
- [ ] It has a clear **acceptance criteria** set (Section 4) — one line per measurable variable, and none say "PR submitted"
- [ ] **Non-Goals are written** — mandatory when the work touches anything cross-team
- [ ] **Pre-conditions are met** (or it's in `Blocked` with the unblock owner named)
- [ ] **Standing gates** are satisfiable — security/test/observability bar met or an approved exception linked (Section 5)
- [ ] It's a **vertical slice** that fits in a sprint (Section 7)
- [ ] Any genuine unknown has been pulled out into a **Discovery work package** and resolved first
- [ ] It links to its **parent epic**, and that epic has a real **outcome statement**

**An epic is Ready when:**
- [ ] It has an **Outcome / Exit Condition** (Section 3) — checkable, with a measure and a horizon (one or more conditions)
- [ ] The **team DoD** (the standing per-task quality bar) is linked/restated and is distinct from that outcome (Section 5) — you inherit it, you don't author one
- [ ] Its first slice of stories is drafted (you don't need them all up front)

> **The discipline:** nothing enters a sprint until it meets DoR. If we can't make it Ready, that's the signal we don't understand it yet — which is itself useful information, and far cheaper to learn now than mid-sprint.

---

## 9. Templates

Copy-paste these. **Bold fields are required.** Delete the guidance in *italics*.

### 9.1 Epic template

```markdown
**Summary:** <Area> | <Capability or change, stated as a noun phrase>

**Outcome / Exit Condition (REQUIRED — the epic is done when this is true):**
When this is done, <capability now possible / failure mode now impossible>,
measured by <metric or specific verification>, by <horizon>.

**Why now / Context:**
<What's driving this. If spawned from demand-driven work (Section 6), link the incidents it retires and the cause-category baseline.>

**Definition of Done (inherited from the TEAM DoD — restated here, not invented per epic; NOT the outcome):**
*This is the team-wide quality bar that already applies to every task of this kind; list it (or link it) so authors see it — don't author a new one. Add an epic-specific item only if this epic genuinely needs one beyond the standard.*
- <e.g. tracked in the relevant repo>
- <e.g. has logging>
- <e.g. has a regression/validation test>
- <complies with applicable governing standards, or links a documented non-applicability determination>

**In scope / Out of scope:**
- In: <...>
- Out: <...>   ← name what this epic deliberately does NOT cover

**Linked work:** <related epics, dependencies>
```

#### Filled example — the Example Epic, corrected

```markdown
**Summary:** Golden image | one image, all platforms

**Outcome / Exit Condition:**
When this is done, a single golden image provisions RHEL9 hosts across EC2 and
Nutanix with ZERO manual post-build steps, verified by ≥20 consecutive automated
builds passing post-build validation, and the legacy PXE/kickstart path is
decommissioned. Target: end of Q3.

**Why now / Context:**
Manual, per-hypervisor builds are slow and error-prone. (Link recurring build
incidents here.)

**Definition of Done (inherited from the team DoD — binary, universal, substitutable invariants only):**
- Image content tracked in version control (the Image Builder — RHIB/Packer — repo)
- Scripts have logging
- Each config has a regression/validation test in the post-build step
- Complies with the team's applicable governing standards, or links a documented non-applicability determination
*(Dropped from the original ticket: "skip on EC2" — a base image holds only what all systems need, so env divergence belongs in layering/runtime, not the DoD; "modular" — an architecture choice for design review, not a requester-owned DoD bar. See [Section 5](#5-three-things-people-confuse-dod-vs-acceptance-vs-outcome).)*

**In scope:** image content & configuration.
**Out of scope:** provisioning automation / self-service pipeline (separate epic).
```

### 9.2 Story / Work Package template

```markdown
**Summary:** <Outcome-oriented noun phrase>

**Intent (pick ONE — if you need two, it's two work packages):**
Discovery / Migration / Redesign / Enablement / Optimization

**Objective:** <What question this answers / what outcome it delivers.>
  (For Optimization/Enablement, name the Automation Ladder transition, e.g. "L1 → L3".)

**Non-Goals (REQUIRED — what this explicitly does NOT decide/cover):**
<If a reviewer could plausibly expect an adjacent change here, say yes or no to it.>

**Pre-conditions (what must be true on day 1 before anyone starts):**
<Constraints, not solutions: security sign-off, IAM access, a vendor decision, an upstream API.>

**Acceptance Criteria (REQUIRED — story is done when these pass):**
Given <context>, when <action>, then <observable result + how it's verified>.
- [ ] <one line PER measurable variable — don't lump latency+concurrency+scope together>
  ✗ Do NOT write "PR submitted" / "script written" — those are outputs, not behavior.
  ✗ Do NOT compound ("build X, then migrate Y to X") — that's two work packages.

**Output Artifact (the thing that proves it's done):** <not "running code" for Discovery>
**Downstream Enabled:** <what work can now proceed without rework>
**Parent epic:** <KEY>
```

> **Why the extra fields vs. a bare user story:** these come from our Work Package model — a work package is *outcome-oriented and independently estimable*, so it needs **one intent**, an explicit **Non-Goals** line (the #1 source of mid-sprint scope drift), and **Pre-conditions** (the reason "clean-looking" stories silently rot — they were never actually startable). A story missing **Non-Goals** fails readiness when the work touches anything cross-team (golden image, IAM, provisioning).

#### Filled example — the delivery story extracted from the Example Task

```markdown
**Summary:** EC2 instances auto-register to the correct regional RH capsule on first boot

**Intent:** Enablement (one AMI usable across accounts/regions without rework)

**Objective:** A launched instance registers itself against the capsule + activation
key for its own region/VPC, so one AMI works across accounts with no per-account edits.

**Non-Goals:** the IMDSv1-vs-v2 decision (settled in the preceding Discovery WP); creating the
per-region secret and the IAM grant (separate tasks); IMDSv2 migration.

**Pre-conditions:** per-region capsule secret exists; EC2 instance role can read it.

**Acceptance Criteria:**
Given an instance launches in VPC-X, when cloud-init runs on first boot, then it
registers against the VPC-X regional capsule using the VPC-X activation key, and
`subscription-manager identity` returns rc=0.
- [ ] Region/account/VPC determined from instance metadata; no hard-coded values
- [ ] Capsule URL + activation key fetched from the per-region secret
- [ ] Verified end-to-end in at least 2 regions
- [ ] Secret-fetch failure fails the build loudly (logged, non-zero exit)

**Output Artifact:** merged, version-controlled cloud-init registration script + the
2-region verification evidence.
**Downstream Enabled:** golden AMI can be shared to other accounts (secret/KMS/IAM only).
**Parent epic:** Example Epic
```

### 9.3 Task template

```markdown
**Summary:** <Concrete deliverable, e.g. "Create per-region capsule secret">

**Deliverable (done when this objectively exists):**
<The merged code / created resource / applied config.>

**Parent story/WP:** <KEY>
**Notes / how-to:** <links, snippets, gotchas>
```

### 9.4 Discovery work package template

*Use this when the unknown is "how" — a decision must be made before the build can be specified. It's a Story/WP with the **Discovery** intent; its deliverable is a recorded decision, not code.*

```markdown
**Summary:** <the question to answer, e.g. "Decide how an instance determines its region/capsule">

**Intent:** Discovery

**Question:** <What decision must we make?>
**Done when:** a decision is recorded (in a comment / linked doc) — NOT when code merges.
**Scope / time-box:** <keep it small, e.g. 1 day>
**Output feeds:** <which story this unblocks>
```

---

## 10. Quick reference

Pin this.

**The one rule:** *An epic is not done when its child tickets close. It's done when its **outcome** is true.*

**Pick the level by completion condition:**
- **Epic** → done when its **outcome** (measured change) is true → write the Outcome / Exit Condition (one or more checkable conditions)
- **Story/WP** → done when **acceptance criteria** (observable behavior) pass
- **Task** → done when a **deliverable** objectively exists
- **Discovery WP** → done when a **decision** is recorded

**Where to split (and which way):**
- *Diverges across "ands" but worthless apart?* → **still one epic.** Epics are meant to diverge.
- *A piece delivers value alone, independent of its siblings?* → it's its **own epic**.
- *A work package carries two intents (decide + build, build + migrate)?* → **two work packages.** The single-intent rule lives at the story layer, not the epic layer.

**Three fields people confuse:**
- **DoD** = workmanship bar, same for every item (includes **standing gates**)
- **Acceptance** = does *this* item behave as promised
- **Outcome** = did the *epic* change what we wanted

**Standing gates (anti-weasel — on by default, every item):** security-compliant *or* approved+documented exception · test bar met · observability · docs updated. "It wasn't in the AC" is not a defense.

**Banned acceptance criteria:** "PR submitted," "code written," "script created." Describe the **behavior**, not the **artifact**.

**Outcome formula (use either form — qualitative is the common case for ops):**
> *Quantitative:* We'll know this is done when [metric/state] moves from [baseline] to [target], measured by [method], by [horizon].
> *Qualitative:* When this is done, [capability] is now possible / [failure mode] is no longer possible, verified by [specific check].

**Demand-driven work (Section 6):** capture it by **work type** (not a removable tag) + a resolve-gated **cause** + time. When a cause category crosses the threshold → **spawn a roadmap epic to retire it, with its outcome measured back against the demand data.** That's the loop SLT sees. Roadmap vs demand is a clean two-way split; change/CAB is an audit overlay, not a third bucket.

**Three modes (author effort scales with uncertainty):** roadmap/bespoke → full machinery · demand/reactive → light, just enough to stay countable · repeatable/request → machinery frozen into the work type.

**Definition of Ready (don't start until):** one intent · acceptance criteria written · Non-Goals written · standing gates satisfiable · vertical slice · dependencies known · unknowns resolved up front · linked to an epic that has a real outcome.
