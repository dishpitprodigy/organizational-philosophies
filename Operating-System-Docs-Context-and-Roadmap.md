# Operating-System Docs — Context & Roadmap

*Working brief for follow-up discussions. Captures the doc family, the single thesis underneath it, the state of each piece, the design invariants discovered so far, the open questions, and the prior art to build on. Self-contained: a reader (or a future session) should be able to start cold from this file.*

---

## The one-sentence thesis

**Organizations run open-loop: they make predictions and judgments constantly, then throw away the answer key — so they repeat the same mistakes at every scale.** Every document in this family bolts a *closed feedback loop* onto a place the org currently leaves open. The mechanism is always the same: **record the prediction/judgment in a durable, structured form as it happens, then go back and grade it against what actually occurred.**

Why quantify / write it down at all: *not* because numbers are truer than judgment (they often aren't), but because **a written, structured record is the only organizational memory that can't be quietly discarded.** Qualitative judgments are forgettable; the org forgets them on purpose, because reconciliation is diffuse-deferred-cost work that no incentive structure funds. A recorded number is un-discardable. That is its entire job.

This same pattern recurs across three subjects, which is the tell that it's a real invariant and not a coincidence:

| Subject | The open loop today | The doc that closes it |
|---|---|---|
| **People** | Year-end rating reconstructed from memory; recency-biased, personality-based | Coaching & Calibration Guide (evidence ledger) |
| **Work / risk** | Significant finds & averted risks die in a verbal mention; never reach risk review | Risk Find capture standard *(planned)* |
| **Projects** | Business case made to get funding, never reconciled against actuals | Engineering-leverage / benefits-realization metrics *(planned)* |

---

## The design invariants (discovered across the discussion — reuse these)

These are the load-bearing principles. They showed up repeatedly and independently, which is why they're listed once here rather than re-derived per doc.

### 1. Describe behavior, not personality
Feedback/records must name **observable behavior + its impact against an expectation**, never inferred personality, motive, or disposition. Personality claims are unfalsifiable, uncoachable, and the primary entry point for bias. Test: *if the subject changed the named behavior, would the feedback be satisfied?* If yes -> behavioral. If it'd still feel true -> it's a personality verdict and doesn't belong.

### 2. Append, don't summarize (event sourcing, not a cache)
The year-end/closure summary is a lossy, recency-biased recomputation from a decayed source. The robust pattern is an **append-only event log**: record immutable events as they occur, compute the answer at read time from the full stream. The evidence ledger, the Risk Find register, and the project-forecast record are all the same append-only log applied to different subjects.

### 3. Separation of concerns: the scorer cannot be the player
(Appeared **three times**: calibration, risk-scoring, post-audit validation.) When one role bundles concerns that conflict — advocacy vs. throughput vs. outcome-ownership — it optimizes whichever has the nearest deadline and the rest decay. Self-scored anything (impact, severity, value) drifts toward whoever games hardest, not toward truth. **Whoever records the play must not be whoever scores its value.** Scrum is the existence proof that the manager's bundle is decomposable (it splits prioritization/PO from facilitation/SM) — and it orphans people/career management entirely, which is why that concern is done worst.

### 4. Fidelity ∝ travel distance
How accurate an auto-generated artifact must be is a function of **how far it travels from the people who can correct it.**
- Travels *zero* distance (reader = actor = same room, same hour) → low fidelity is fine; live correction *is* the mechanism. Optimize for "provocative and roughly right."
- Travels *far* (distant reader, months later, no one present to correct) → high fidelity required **plus** a routing mechanism that forces a read.

### 5. Automate generation, but force the artifact into a path where ignoring it is visible
An auto-generated artifact that lands unread is **worse than no artifact** — the org *feels* audited and stops noticing the loop is open ("loop theater"). Auto-post + tag the owner = a loop. Save-to-wiki = theater. AI lowers the cost of generating theater too, so this guard matters more, not less.

### 6. The AI draft is a foil, not an oracle
The value of an 80%-correct auto-generated draft is **not** the 80% it gets right — it's that a concrete wrong draft is trivial to correct while a blank page is paralyzing. Design *toward* the human↔AI correction passes, not away from them. Target: "good enough that human engagement is cheap and pleasant." Chasing 100% rebuilds the cost wall you just removed.

---

## The AI-leverage keystone (why this is buildable *now*)

The reason post-audits, retros, TDD, and benefits-realization "never happen" is not disputed value — it's that they're high-value work with **immediate, personal cost and diffuse, deferred payoff.** The incentive structure won't fund them; it's not a willpower failure.

**LLMs change the cost side of that equation, not the quality side.** They collapse the *activation energy* — the blank-page, full-day-to-build-the-briefing cost. The stranded labor was never the data pull (tools half-do that); it's the **synthesis of data into a discussion artifact / briefing** — a language-and-framing task LLMs are uniquely suited to. "Automate the briefing, not the dashboard."

Corollary — the honest "AI and jobs" framing: AI's best target is the **economically-stranded long tail of toil** — the task too infrequent to justify a script but recurring enough to enrage, which traditional automation could never reach because writing it cost more than it saved. AI collapses *that* cost curve. Not "AI takes the job" — "AI finally kills the toil that's been making good engineers furious for years."

---

## Document status

### 1. Career Progression Guide — DONE (live)
`DevOps-SRE-Career-Progression-Guide.{md,html}`. The grade ladder (IC1–IC9, MGR4–MGR8, EX9–EX11) and the seven dimensions of level: **Scope, Complexity, Autonomy, Impact, Influence, Leverage, Durability.** This is the measuring instrument the rest of the family supports. HTML is card+modal, dark theme.

### 2. Coaching & Calibration Guide — DRAFTED (md + html), needs terminology + coaching nuance pass
`DevOps-SRE-Coaching-and-Calibration-Guide.{md,html}`. Three parts:
- **Part 1 — Describe behavior, not personality** (invariant #1): translation drill, the bias angle, verbal delivery, and the *rigor/arrogance confusion* (exhaustive self-falsification produces output that looks identical to arrogance; the tell is the response to a *new* objection — engagement vs. restatement). Open terminology change: replace "character" with "personality" because the intended rule is "make behavior assessments, not personality assessments."
- **Part 2 — The evidence ledger** (invariant #2): append-only, seven-dimension, artifact-linked, before/after metrics, maintained continuously.
- **Part 3 — Separating the concerns** (invariant #3): the advocate/throughput/outcome conflict, Scrum as existence proof, event-sourcing analogy.

HTML built by a sibling generator reusing the ladder's CSS. **Open: user review; add a coaching-conversation model; pixel-check in a browser (built headless, structurally validated only).**

### 3. Talent Development Architecture (TDA) — DRAFTED (md), needs review
`Talent-Development-Architecture.md`. Sits between Coaching & Calibration and Hiring. The thesis: organizations should be architected more like talent-development systems, with deliberate observation, coaching, placement, progression, and intake, rather than treating hiring, coaching, and calibration as disconnected manager behaviors.
- **Sports-franchise analogy:** useful because strong franchises scout, draft/sign, assign level-appropriate reps, coach specific skills, observe performance, and move people through a development pipeline. MLB's farm system is the clearest example.
- **Where the analogy breaks:** athletes can lose physical capacity suddenly or visibly through age/injury; engineers usually do not wake up one day unable to perform. A sudden performance decline should be treated like a system degradation until proven otherwise: what changed, what load increased, what dependency shifted, what hidden constraint appeared?
- **Coaching nuance:** separating behavior from personality is necessary but insufficient. Bad coaching hyperfixates on the mistake; good coaching diagnoses the system around the behavior, exposes human-level metrics through conversation, and builds an agreed corrective plan.
- **Named step — Talent Utilization Review:** proactively before major assignments and reactively when performance regresses, review whether the person's assignments, priorities, hidden work, constraints, support, and career-development goals match the reason they were hired or trusted with the work. The loop: map assignments, expose hidden work, compare priorities, inspect constraints, gather additional context, reassess, and decide what changes in the person, the work, the priorities, or the system around them.
- **Career alignment hook:** whenever possible, assign people work they enjoy and want to grow toward. Forced stretch work is sometimes necessary for baseline competence: for example, a person who hates Terraform may still need to support it competently on a team that owns both on-prem systems and cloud. But if the same person is happiest and strongest writing Ansible, Python, Bash, or working on-prem, a wise manager should bias their long-term assignment mix toward that fit. Forced stretch has an elastic limit: sustained misalignment creates brittleness, burnout, reduced elasticity, failure, or a snapback that hurts the system.
- **Preference as evidence:** employee preference is operational signal, not a perk. It predicts quality, durability, learning rate, burnout risk, and where forced stretch will be costly. Employees should be encouraged to discuss these preferences openly with managers, while also understanding that some necessary work will not match their preferences.
- **Internal farm system:** if an employee expresses interest in another team's work, managers should coordinate to find small, useful stretch assignments of that kind. Four hours a week can be enough to create meaningful development while helping another team burn down real work: an EUS helpdesk employee migrating Python 2 scripts to Python 3, helping move Terraform 0.x to 1.x, or refactoring repetitive conditional logic into data structures. The specific technologies will change; the pattern is stable. This is also succession pipeline: the organization is creating future capability before it is forced to need it.
- **Career-pathing theater:** "own your career" only works when the organization exposes real roles, departments, skill needs, safe-reps paths, and manager-coordinated opportunities. Generic career tools that produce abstract advice without real paths create the appearance of development while pushing employees toward guesswork, side channels, or exit.
- **Technology boundary:** development tooling can augment good behavior, but it cannot fix bad development architecture. Career portals, workflow tools, dashboards, and AI assistants can surface paths and reduce friction only when real roles, opportunities, coaching, and safe-reps paths exist underneath.
- **Formal coordination rule:** employees should be encouraged to talk with people on other teams, compare patterns, notice where Team A's practices apply to Team B's problems, and propose stretch work. To get the work on the books, manager-to-manager coordination is required: the employee's manager, the receiving team's manager, and the work owner agree on the time box, expected value, supervision, priority impact, and success criteria.
- **Stretch proposal guardrails:** Stretch Proposal should be normal career-development language, not reserved for cross-team work. The same pattern applies whenever someone is trying to move from seeing and reporting problems, to fixing them, to building or automating the prevention. When an employee offers to help with a problem, the safe formal version should be bounded: no promise of outcome, explicit owner, explicit time box, clear read-only vs. write-action permission, agreement on when to check before changing anything, and a shared understanding of how broken the thing already is and how much worse it could get. This keeps exploration from becoming unmanaged risk while preserving the self-directed stretch work that often creates career mobility.
- **Career transition gates:** TDA should explicitly name the hard experience jumps people struggle to cross, especially in support and operations environments: seeing and reporting problems -> fixing problems -> building or automating prevention. Stretch Proposals and the Internal Farm System are how the organization creates legitimate reps across those gates before a person is blocked by "no prior experience."
- **Safe-reps rule:** every Career Transition Gate needs a Safe-Reps Path. If the organization requires experience before granting opportunity, it must also provide bounded ways to gain that experience without unacceptable risk. Otherwise early- and mid-career development depends on luck or off-book initiative instead of culture.
- **Development culture:** early- and mid-career development should be a normal expectation of the company: coaching, practice, feedback, and bounded stretch are how the organization gets one percent better every day. External hiring becomes more like sports free agency higher on the seniority ladder, especially when the company lacks principal/staff-level capability in-house.
- **Career-stage development:** TDA should split expectations by career stage while reusing the Career Progression Guide's existing tiers. Earlier/mid-career development emphasizes safe reps across transition gates. Senior development emphasizes scope fit, durable ownership, and leverage. Staff+ development emphasizes cross-team capability, succession, strategic placement, and whether missing capability must be hired externally as free-agent talent.
- **One-on-one note:** one-on-ones should be acknowledged in TDA as the primary venue for career alignment, utilization review, constraints, coaching, and support. Frequency can vary by person and work, but there should be a minimum cadence. Working hypothesis: one meaningful one-on-one per month is the floor; higher frequency may be appropriate during forced stretch assignments, role changes, performance regressions, or ambiguous work. TODO: keep this as a small TDA section for now and reference a future off-screen companion doc for "how to run one-on-ones well."
- **Coaching formula:** start from the reason the person was hired or trusted with the work; assume there was a valid strength to preserve. Lead with the purpose of the meeting and the concrete issue. Ask whether the person knows why the conversation is happening. Listen long enough to expose missing context. Then ask the mandatory coaching question: "What do you think would have made that situation a success?" A conversation without that question, or its equivalent, is not coaching.
- **What coaching changes:** coaching is not telling someone the right answer. It is understanding the world as they see it, finding defects in their mental model, and attaching corrections to future cues so they can make better decisions later. In sports terms: teach the player what the defender's action reveals about the defensive concept and where the exploitable space opens. In engineering terms: teach the engineer what signals reveal the resource constraint, dependency pressure, capacity issue, or failure mode.
- **Action-plan close:** end with a defined period, a specific list of evidence markers the person will produce, the commitments the manager made, and the follow-up point. The plan must include both sides of the system: what the person will change and what the organization/manager will change to get better performance out of the talent.
- **Talent utilization principle:** the sports-franchise mentality is to create conditions where talent can produce, not to conclude that the talent failed while the organization was asking it to win from an impossible position. Businesses should treat coaching as improving talent utilization, not as treating people like machines that need exact instructions.
- **Pinned rule:** never lie, stretch, or massage facts in a coaching conversation. Distinguish facts from stories.

### 4. Risk Find / Significant-Issue capture standard — PLANNED (own doc; needs refinement)
Captures when someone finds/averts a significant issue. Origin: a class of high-value events (e.g. catching a latent cross-tenant data-exposure risk pre-release) that bug trackers can't hold — **no code defect, so no bug ticket; business impact isn't a bug-ticket field; the signal dies in a verbal mention and never reaches risk review.**
- **Record type fields:** what was found, blast radius, business consequence, realized-vs-averted, who was informed, mitigation, **link to the durable control that now prevents recurrence** (this field separates a hero save from a real fix).
- **Scoring:** wants a CVSS-like generalized severity for *work impact broadly* (code bugs, process bugs, averted risk). Prior art to build on, not reinvent: **FAIR** (quantifies risk as financial business impact — closest existing thing to "internal CVE with business impact"), CVSS (technical only — the gap), DREAD, ISO 31000 / NIST RMF likelihood×impact.
- **Aggregation is the prize:** where risk concentrates, averted-loss totals (finance/audit care, currently can't see), and which finds trace to the same root failure mode. A scored Risk Find is also top-grade *Impact*-dimension evidence for the ledger — **the ledger and the risk register share rows.**
- **Guards:** self-scoring inflates → needs second-party calibration (invariant #3). Check for an existing GRC/risk register before building parallel; the original contribution is *capture-at-discovery + cross-class generalization*, not the scoring math.

### 5. Engineering-leverage metrics framework — PLANNED (longer horizon; research-heavy)
Pairs with #3, shares a spine. **Build #3 first** — you can't compute advanced metrics on data you aren't recording yet ("Retrosheet before WAR").
- **The actual idea (refined):** not WAR/VORP (counting realized outcomes). The target class is **QB-pressure / clogged-passing-lane / basketball-gravity** — metrics that score *a change in outcome probability caused by presence or position*, where the contributor did nothing recordable.
- **The mechanism sports uses:** an **expected-outcome model** + measure the **delta a player's presence creates vs. that baseline.** Businesses *do* build expected-outcome models (every business case / OKR / forecast is f(attributes) → success probability) — the gap is they aren't recorded in a regress-able common shape, aren't scored against actuals, and have small-n.
- **The enabling substrate sports has and engineering lacks:** tracking data (Statcast / optical). The Risk Find register + evidence ledger are *hand-built tracking data* — like PFF hand-charting pressures before optical cameras existed.
- **The conceptual model already exists:** it's the ladder's *Influence / Leverage / Durability* dimensions (the architect who kills a bad decision in review = the safety in coverage; a standard that prevents a bug class = the clogged passing lane).
- **Where it lives or dies:** the expected-outcome baseline. No clean objective training set like sports; whoever fits the model controls who looks valuable. Must be **transparent and falsifiable, not authoritative** — or it becomes the black box invariant #1 exists to outlaw.
- **AI-era entry-level work hypothesis:** the failure modes of yesterday will wear new clothes. Yesterday's low-risk growth work might have been Python 2 -> 3 migrations or Terraform 0.x -> 1.x upgrades; tomorrow's may be reducing AI instruction-file bloat, consolidating repeated special cases, and making slash commands/agent instructions more general, testable, and cheaper to run. Route summarization is the useful metaphor: do not write four narrow routes when one broader route captures the same forwarding decision.

### 6. Hiring guide — PLANNED (user believes he has a non-obvious view)
**Thesis:** the world gets hiring intake wrong by *grossly undervaluing the contextual metadata a CV provides*, and builds the hiring system incorrectly because of it. Same shape as the rest of the family — the high-signal data gets thrown away and the system operates on the lossy remainder. *Open: pin down exactly what "contextual metadata" means to him before drafting.*

---

## The auto-generated retro/review system (cross-cutting capability)

Not a document — the *capability* the keystone enables, and the thing several docs would specify. Auto-generate **both** the reports (data) **and** the discussion artifact (synthesis/talking-points) on project/sprint closure. This is what makes the closed loops cheap enough to actually run.

**Two artifact classes with opposite constraints — keeping them apart is a first-class requirement:**

| | Retro | Post-audit / Risk Find |
|---|---|---|
| Reader | the team itself | distant: SLT, finance, risk |
| Acted on | live, in the room | later, elsewhere |
| Fidelity needed | low (corrected live; foil) | high (no one's there to correct) |
| Travels upward? | **never** — kills psychological safety | yes — that's its job |
| AI's job | seed the discussion | produce a trustworthy, routed record |
| Validator | Scrum-master-equiv vouches for *shape* | someone who can't game it |
| Failure mode | becomes SLT reporting → learning stops | becomes the unread artifact → theater |

**Hard governance wall:** a **retro is the team's own final feedback-loop step** (without it, teams repeat identical planning mistakes forever). The instant it's consumed upward as evaluation, people stop surfacing real mistakes and it degrades into a sanitized status report. **The retro must never be an upstream reporting surface — by design and by access control.** Leadership wants signal? It gets the *post-audit*, never the retro.

---

## Prior art / terminology (so we build on, not reinvent)

- **DORA metrics** (deploy frequency, lead time, change-fail rate, MTTR) — the engineering "box score." Explicitly *not* leverage-weighted = the gap the metrics doc addresses.
- **SPACE framework** — broader dev-productivity model (satisfaction, performance, activity, communication, efficiency).
- **FAIR** (Factor Analysis of Information Risk) — quantitative risk → financial business impact. The scoring engine for Risk Find.
- **WSJF / Cost of Delay** (SAFe) — the existing crude attempt to put priority-leverage into integers. Read it to see where it fails; the metrics doc must beat it.
- **Benefits realization (rate)** — PM discipline: did the project deliver the benefits its business case promised? ("Did the money do what it was supposed to.")
- **X-inefficiency** (Leibenstein, 1966) — gap between an org's possible and actual output due to organizational slack (not misallocation). The academic name for "we accept rework as the cost of doing business."
- **Capex post-audit / post-implementation review** — finance's formal score-actuals-vs-request discipline. Widely recommended, rarely done = the same open-loop bug, finance edition.
- **People analytics / evidence-based management / online experimentation (A/B)** — the underbuilt field behind "tech A/B-tests the product relentlessly but never A/B-tests the org." Confounding is handled not by eliminating it but by **apportioning** credit via a transparent agreed model; techniques: class-level attribution (where n accumulates), partial pooling / shrinkage (hierarchical Bayes), difference-in-differences on uneven rollouts.

---

## Open questions / next moves

1. **Coaching guide:** rename character language to personality language; add the coaching-conversation model; user review + browser pixel-check of the HTML.
2. **Talent Development Architecture:** review and polish the drafted system-layer doc; decide later whether it needs an HTML version and whether one-on-ones split into a companion doc.
3. **Risk Find:** confirm whether an org GRC/risk register already exists; design the record type + which existing severity model (likely FAIR-derived) to adapt; design the second-party scoring step.
4. **Metrics framework:** decide the first expected-outcome baseline to attempt and at what *altitude* (class-level, not individual-play). Probably waits on Risk Find data accumulating.
5. **Hiring guide:** interview the "CV contextual metadata" thesis into specifics.
6. **Auto-retro system:** decide where it's specified (own doc vs. section), and lock the two-artifact-class wall into the design from day one.
7. **Build order overall:** capture layers before analytics layers, everywhere. Record the plays before computing the leverage.
8. **Packaging:** this document family may have enough scope to become a book-length artifact. Keep an eventual packaging path in mind: source Markdown may need a LaTeX/PDF route for print-quality output and an HTML-to-ePub or Markdown-to-ePub route for digital distribution.
