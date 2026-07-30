# Management Is Evidence Infrastructure

*Part V — Developing and Acquiring Capability*

A career ladder does not make people decisions fair. The judgment depends on the quality of the evidence, the language used to describe it, the incentives of the person reading it, and whether the organization created the work that could have produced the expected evidence in the first place.

> **Preview note — future edition**
>
> A future version will expand one-on-ones from a minimum operating requirement into the recurring management venue: cadence, preparation, agenda shape, confidentiality, constraint discovery, career alignment, coaching follow-up, evidence capture, and the boundary with formal performance management.

## Purpose

The Career Progression Guide is a measuring instrument. Like any instrument, it produces accurate readings only when used correctly, and most of the ways it is used incorrectly are not failures of the ladder — they are failures of feedback, of evidence, and of organizational design. This chapter addresses those three.

It is written for managers, calibration groups, and the engineers being calibrated. It assumes the reader has the seven dimensions of level — scope, complexity, autonomy, impact, influence, leverage, durability — already in hand.

Three principles organize it:

1. **Describe behavior, not character.** Feedback that names what a person *is* cannot be verified, disputed, or improved. Feedback that names what a person *did*, and what it caused, can be all three.
2. **Collect evidence continuously; never reconstruct it.** A rating assembled from memory at year-end is a lossy summary of the wrong data. The fix is an append-only record kept as the work happens.
3. **Separate the concerns one manager is asked to hold at once.** Advocacy, throughput, and outcome-ownership conflict inside a single role, and that conflict is the root cause of most miscalibration.

---

## Part 1 — Describe Behavior, Not Character

### The principle

Feedback must stay on **observable behavior and its impact against the expectation.** It must not cross into conclusions about the *drivers* of that behavior — personality, motive, disposition, or character.

> "Merged changes with failing tests three times in the quarter without flagging them" is a behavior. "Careless" is a verdict on the person.
>
> "Restated his objection three times after the group had moved on" is a behavior. "Can't compromise" is a verdict on the person.
>
> "Raised his voice and the conversation escalated" is a behavior. "Can't control his emotions" is a verdict on the person.

The left-hand versions describe the same situations as the right-hand versions. The difference is not severity or politeness. The difference is that the left can be confirmed, contested, and changed, and the right cannot.

### Why the line matters

Three reasons, in order of weight:

1. **Character claims are unfalsifiable, and therefore uncoachable.** "Not detail-oriented" describes no event. The person cannot point to a counter-example that disproves it, cannot dispute it without sounding defensive, and — critically — cannot *do anything tomorrow* to change it, because no specific behavior was named. A trait is a sentence, not a development plan.

2. **Character claims are where bias enters.** Inferred dispositions — "abrasive," "lacks confidence," "too aggressive," "not leadership material" — correlate far more strongly with the rater's demographic and affinity reactions than behavioral descriptions do. The same behavior is read as "assertive" in one person and "abrasive" in another. Holding feedback to observable behavior is not only an accuracy control; it is a fairness control. It removes the surface that bias attaches to.

3. **A surprising amount of "character" is actually unrecognized rigor or context.** A person who states conclusions confidently and lists the exceptions they already ruled out can look identical, from the outside, to someone who is closed-minded — when in fact they have done more of the work, not less. (See *The rigor/arrogance confusion*, below.) If you rate the surface impression, you will sometimes punish your most thorough people for being thorough.

### The translation drill

The skill is converting a trait claim into a behavioral one before it is ever written or spoken. The pattern:

| Trait claim (do not use) | Behavioral translation (use) |
|---|---|
| "He's not collaborative." | "In the X review, he re-argued his position after the group had decided, which extended the meeting and left two peers feeling unheard." |
| "She's not strategic." | "Her last three proposals optimized her own service without addressing the cross-team dependency that was the stated goal." |
| "He thinks he's always right." | "When challenged, he restates his original argument rather than engaging the specific objection raised." |
| "She lacks executive presence." | "In leadership reviews she presents implementation detail before the decision and recommendation, so the room loses the thread." |

Notice what the translation forces: a specific instance, the observable action, and the impact. If you cannot fill those in, you do not have feedback — you have an impression, and an impression is not calibration-grade evidence.

A useful test: **if the subject genuinely changed the named behavior, would the feedback be satisfied?** If yes, it is behavioral. If the feedback would still feel true after the behavior changed, it is a character claim, and it does not belong in a review.

### Delivering it verbally without it landing as an attack

The behavioral standard is hardest to hold in live conversation, where the trait version is faster and more vivid. Three moves:

- **Lead with the behavior and its impact, not the label.** "When the conversation escalated, the room stopped problem-solving" — not "you got defensive again."
- **Attribute impact, not intent.** You can observe that a peer felt unheard. You cannot observe that the person *meant* to dismiss them. Claiming the intent is mind-reading, and it invites a fight about motive that no one can win.
- **Separate the observation from the ask.** First the behavior and its effect; then the specific, different behavior you want next time. "Next time, when you've made your case once and the room leans another way, ask what they're weighing before restating" is coachable. "Be more collaborative" is not.

### The rigor/arrogance confusion

Calibrators should know one specific failure mode well, because it punishes good engineers. A person who reasons by trying to *falsify* their own conclusions — asking "under what condition is this wrong?" repeatedly until they can't break it — produces an output that looks, from the outside, almost identical to arrogance: confident, exception-laden, "I already considered that and ruled it out." The signature of exhaustive rigor and the signature of a closed mind are nearly the same shape when you only see the output.

The tell that distinguishes them is not in the delivery; it is in the response to a *new* objection. The rigorous person engages a genuinely new condition with interest, because finding a flaw is the goal. The closed mind restates. Before you write "thinks he's always right," check which one you actually observed. And if the person's confidence is the problem, the coaching is not "be less rigorous" — it is **externalize the search**: show the conditions you tried and failed to break it with, not just the verdict, so the humility in the method becomes visible and the confidence is not all that lands.

---

## Part 2 — The Evidence Ledger

### The problem it solves

Most ratings are produced the same way: at review time, the manager reconstructs a year of work from memory and compresses it into a level and a score. This is **lossy, recency-biased summarization.** The most recent two months are overweighted, the quietly durable work of the spring is forgotten, and the events that survive into the summary are the ones that were emotionally vivid — usually conflicts — rather than the ones that were consequential.

The ladder already names the consequence: *"the absence of stakeholder evidence in a packet is more often a failure of evidence collection than a failure of the engineer."* A person's apparent level can swing one or two full grades depending only on whether someone bothered to collect the evidence. That is not a property of the person. It is a property of the process, and it is fixable.

### The instrument

Do not summarize as the work happens. **Append.** Keep a running, append-only record — one entry per consequential event — and run the analysis at review time against the full record, not against memory.

Each entry is small and is written when the event occurs, not retrospectively:

- **Date**
- **Dimension(s)** touched — scope, complexity, autonomy, impact, influence, leverage, durability
- **What happened** — one or two behavioral sentences
- **Artifact** — link to the PR, ADR, dashboard, doc, incident record, or message thread
- **Before/after** — the metric that changed, where one exists (toil hours, failure rate, cost, lead time, blast radius)

Organized by the seven dimensions, the ledger becomes a standing answer to the calibration table in the ladder. At review time you are not remembering; you are reading.

### Why it serves both sides

- **For the engineer:** it removes dependence on whether anyone happened to be watching. The engineer who cannot advocate for themselves in a room — which is most engineers, and is itself unrelated to their level — is no longer penalized for it. The work is on the record as it happens.
- **For the manager:** it converts the year-end scramble into a read. The packet assembles itself. The manager stops reconstructing twelve months from the last three weeks.
- **For calibration:** it supplies exactly the artifact-linked, before/after, dimension-tagged evidence the ladder asks for, and it makes "I don't have evidence for that dimension" a visible gap to fill rather than a silent default to a lower level.

### Cadence

The ledger is maintained continuously — ideally the entry is made the day the event happens, when the detail and the metric are still at hand. A brief monthly pass keeps it honest. The one thing it must never become is a document created the week before a review; at that point it is just the old lossy summary wearing a new format.

---

## Part 3 — Separating the Concerns

### The structural conflict

A single line manager is typically asked to hold three jobs at once:

1. **Advocate** for the person's growth and advancement.
2. **Optimize** team process and throughput.
3. **Own** the outcomes of the work.

These three loyalties conflict, and the conflict is not occasional — it is structural. The manager who must hit a delivery date has an incentive to keep a strong engineer in their current, productive scope rather than stretch them into the next-level work that would prove a promotion. That same manager then judges whether the engineer demonstrated next-level scope. **The person who rations the opportunity is the person who scores its absence.** This is a conflict of interest in the precise sense, and it is the root cause of the "scope-starvation" miscalibration the ladder warns about: next-level scope withheld, then its absence cited as evidence the person is not ready.

It is also why evidence collection (Part 2) is chronically starved. Continuous evidence collection serves the *advocacy* concern, but it competes for the manager's time with the *throughput* concern — and throughput has a deadline while advocacy does not. The urgent crowds out the important, every cycle.

### The principle: one role should not own conflicting concerns

This is single-responsibility applied to management. When one role bundles concerns that pull in different directions, the role optimizes whichever concern has the nearest deadline, and the others decay. The fix is to give the conflicting concerns to different owners.

**Scrum is an existence proof that this decomposition is possible.** Scrum splits *what to work on* (the Product Owner, who owns prioritization) from *how the team works* (the Scrum Master, who owns process and facilitation), and it deliberately removes the manager from both. What Scrum conspicuously leaves out of scope is the third concern — *people and career development* — which is precisely why that concern, orphaned by the framework and bundled back onto an already-conflicted line manager, tends to be the one done worst. The lesson is not "adopt Scrum." The lesson is that the concerns *are* separable, and the people/career concern is the one most starved of a dedicated owner.

### The data analogy: stop summarizing, start sourcing

The reason the year-end rating is unreliable is the same reason an in-memory cache drifts from the truth: it is a **lossy summary recomputed from a decayed source.** The manager compresses a year of events into a single rating from whatever is freshest in working memory, and the compression throws away most of the signal.

The robust pattern is **event sourcing.** Do not store the summary; store the immutable stream of events as they occur, and compute the answer at read time from the full stream. The evidence ledger in Part 2 *is* that event log. Part 3 is what makes it usable: separating the concerns gives someone the time and the neutrality to read the log without judging their own scope-rationing decisions in the process. **The ledger is the log; role-separation is the unconflicted reader.** They are one system, not two ideas.

### What separation can look like

Full reorganization is rarely available, but the concerns can be separated in lighter ways:

- **Calibration by a body, not an advocate.** The promotion decision is read off written evidence by a group, per the *Read, do not pitch* rule — explicitly so the outcome does not depend on one conflicted manager's live advocacy.
- **A development owner distinct from the delivery owner.** A mentor, skip-level, or guild lead can own the growth/evidence concern even when the line manager owns delivery, so that advocacy has a dedicated owner who is not trading it against a deadline.
- **The ledger as shared infrastructure.** Because the evidence is on a standing record rather than in one manager's memory, any of these owners can read the same source, and a manager change does not erase the engineer's history.

---

## How the evidence practice relates to the ladder

The Career Progression Guide tells you *what* the levels are. The evidence practice protects the integrity of the *act of judging* against them:

- **Part 1** keeps the evidence clean — behavior, not character — so the judgment is fair and the development is possible.
- **Part 2** keeps the evidence complete — continuous, not reconstructed — so the judgment is accurate.
- **Part 3** keeps the evidence read by someone able to read it honestly — separated concerns — so the judgment is unconflicted.

Clean, complete, and honestly read. A rating that fails any one of the three is not a calibration; it is an impression with a number attached.

## Principle 4: Coaching Updates the Mental Model

Coaching is development. Sometimes development means expanding a strength. Sometimes it means correcting a mistake. Sometimes it means reducing scope temporarily so the person can reset, practice, or stop costing the team yards. A reprimand may accompany a coaching conversation when policy or severity requires it, but coaching and reprimand are separate mechanisms.

Coaching is a diagnostic conversation that starts from a concrete behavior or performance gap and surfaces the map the person was using when they made the decision. That map includes the signals they noticed, the signals they missed, the constraints they believed mattered, the outcome they thought they were optimizing for, and the action they believed those conditions called for.

Human learning is contextual. New information rarely updates every related belief at once. It updates the part of the mental model that is active in the moment, and later the correction has to be recalled when a similar-but-not-identical situation appears. Coaching works by attaching the correction to cues the person will actually see again: "when this signal appears, it usually means this condition exists, so these options become stronger and those options become weaker."

### Coaching vs Conversation
Conversations shift to coaching when this question is asked:

**What do you think would have made that situation a success?**

A conversation without that question, or its equivalent, is not really coaching. It may be feedback. It may be correction. It may be documentation. But coaching requires understanding the world as the person being coached saw it.

The manager is looking for defects in the person's mental model:

- Did they miss a signal?
- Did they read the signal incorrectly?
- Did they optimize for the wrong outcome?
- Did they misunderstand the priority?
- Did they lack context?
- Did the organization give them contradictory instructions?
- Did the system make the desired behavior harder than leadership realizes?

A sports analogy is useful here: a football coach does not say "you misread the defense; reading defenses is a requirement for this job, and you have to get better at that." A good coach explains what a defender's movement or action reveals about the defensive concept, how that informs where the exploitable space opens, which offensive player is expected to move through it, and the role the individual being coached is supposed to play in exploiting these weaknesses.

The lesson is not that every player should try to score on every play. The lesson is that every player should understand the position that gives the team the best chance to score. That difference separates excellent teams from mediocre ones: the team has a coherent operating concept, and each person understands the role they need to play for the system to work.

The business equivalent is teaching the person how to read systems: what signals reveal a resource constraint, dependency pressure, capacity issue, priority inversion, customer impact, or failure mode.

### A Coaching Conversation Shape

The exact language can vary by person, manager, culture, and severity. The conversation should have phases rather than a rigid script:

**Open with purpose and perspective.** Mentally begin from the reason the person was hired or trusted with the work. Assume there is a valid strength to preserve. Be plain about the concern, but establish immediately that their interpretation is integral to the outcome: "I want to talk about X because it caused Y. Before I go further, what is your read on what happened?"

**Listen and orient.** Coaching requires more listening than talking. Let the person describe the situation in their own terms, then ask questions that reveal how they were interpreting the system. You are trying to create the conditions for them to troubleshoot their own decision process the way they would troubleshoot code, analyze a business proposal, or inspect a financial sheet.

**Follow connected context; table unrelated context.** If they raise a different issue, listen long enough to determine whether it is connected. It may be the hidden dependency that explains the visible failure. If it seems unconnected, ask them to explain the material connection. If they cannot, table it respectfully and commit to returning to the other topic at a later time. The goal is not to dismiss the issue; the goal is to keep this coaching loop coherent.

**Name the gap clearly.** Once their perspective is on the table, state the concern as specifically as possible: what happened, what outcome it caused, and why the outcome matters. Stay with behavior, evidence, and impact. Do not turn the moment into a personality assessment.

**Update the mental model.** Ask what they think would have made the situation successful. Identify the missing signal, incorrect read, stale assumption, or conflicting instruction. Then attach the correction to future cues: "when you see this pattern again, consider whether it is evidence of the relevant condition, and adjust this way."

**Close with mutual commitments.** The close must say what the employee will change and what the manager or organization will do. If the conversation reveals a broken process, management owes a real response: fix the system, design a durable workaround, or explain why nothing can currently be changed. The point is not only to improve the person; it is to create a feedback loop that uncovers inefficiencies and risks throughout the organization.

If formal documentation is required, it should come after the coaching loop has produced a shared path forward. A clean version sounds like: "I think we are positioned to move forward from this. I do need to document what happened and what we agreed to, so there is a written record if the issue repeats. If we are not talking about this again in the next review period, it will not be treated as an ongoing concern." Documentation is a record-control mechanism, not the coaching mechanism itself.

Never lie, stretch, or massage facts in a coaching conversation. If notes are being taken, say why. If notes may be used in an incident document, performance record, or other formal artifact, say so.

Facts and stories are both useful, but they are not the same kind of material. The fact may be that a handoff was missed, an incident update was late, or a stakeholder left the meeting with the wrong expectation. The story is the explanation attached to that fact: carelessness, overload, unclear ownership, weak judgment, hidden dependency, or conflicting instruction. Coaching becomes more accurate when the manager labels which parts were observed, which parts were inferred, and which parts still need testing.

### Manager Readiness Questions

Before a manager assigns meaningful stretch, the manager has a preparation duty. These questions are not optional reflection prompts. If the manager has not asked them, the manager has not done the job.

- Did I do enough to prepare this person for the challenge I am putting in front of them?
- Am I sure they are ready?
- What are the consequences if I am wrong about their readiness?
- If this fails, what part of the failure belongs to me, what part belongs to the employee, and what part belongs to the system around them?
- What would reasonable struggle look like?
- What would unacceptable risk look like?
- If things begin to fail, what intervention options do I have?

> For consequential work, the manager should begin from the assumption that a preventable employee failure is a management failure unless proven otherwise. The manager should not treat failure as evidence that the employee was unfit until the manager can show that the assignment was bounded, the expectations were clear, the person was prepared, the support model existed, the risks were understood, and intervention options were available.

This matters because employee accountability is not abstract. Performance consequences affect income, reputation, family stability, health, confidence, and future opportunity. Sometimes an employee truly owns the failure, and sometimes termination or role removal is the right outcome. But a manager should be able to sleep at night knowing they did not put an unprepared person into a situation where failure was predictable, then let the person absorb the consequences alone.

A boxing analogy is useful here only if it is kept in the right frame. The lesson is not toughness or punishment. The lesson is preparation, mechanics, trust, readiness, and intervention. A trainer does not send someone into sparring because struggle sounds developmental. A trainer asks whether the person has practiced enough mechanics to face that level of intensity without unacceptable harm.

Managers owe the same kind of thinking in business terms. Stretch work should be challenging enough to build capability, but bounded enough that failure becomes evidence and learning rather than avoidable damage.

---

## One-on-Ones

One-on-ones are the primary venue for proactive Talent Utilization Review.

They are where career alignment, preference signals, constraints, coaching needs, hidden work, stretch proposals, and support gaps should surface before they become review-cycle surprises.

The current source material establishes the minimum operating requirement:

- one-on-ones are not status meetings
- one meaningful one-on-one per month is the floor
- higher frequency may be appropriate during forced stretch, role changes, performance regression, ambiguous work, or major scope changes
- the conversation should maintain an active picture of utilization, career direction, support, and evidence

If a manager cannot describe what an employee wants to grow toward, what work drains them, what work energizes them, and what constraints are currently shaping their output, the manager does not have enough signal to manage the person's development well.

One-on-ones are also where self assessment and manager calibration should meet. Self-reflection matters, but it is incomplete by itself. Manager judgment matters, but it becomes dangerous when it arrives as a unilateral verdict. The useful signal is often the difference between the two reads.

The employee's self assessment reveals their mental model. The manager's assessment reveals the organization's expectation. The one-on-one should inspect the gap without turning it into a personality trial. A competency gap is not the coaching conversation. It is the opening evidence for one.

People records should also label evidence. An observed behavior, self report, manager interpretation, secondhand claim, outcome measure, and assumption are not the same kind of fact. Narrative context is necessary in people decisions, but the organization should know which parts of the story were observed, which parts were inferred, and which parts still need testing.

---

## Two Levels of Evidence

The Performance Evidence Ledger preserves individual context. It records what a person was asked to do, what conditions shaped the work, what was observed, what changed, and what decision followed.

A **Behavioral Scoreboard** works one level above the ledger. It aggregates a deliberately limited set of patterns so the organization can tell whether development behavior is real or merely documented. It should help answer:

- Who receives stretch opportunities, and who repeatedly does not?
- Which managers consistently develop people, and which managers have developed no one?
- Are developmental reps distributed equitably?
- Do coaching, reconciliation, and assignment changes occur, or do the artifacts merely exist?
- Which capability gaps recur across teams?
- Where does the evidence point to a role, structure, or management problem rather than an employee problem?

The scoreboard is not a fifth employee-facing form, and it should not reduce individual development to a composite score. The ledger preserves the case. The scoreboard reveals the pattern. Accountable leaders still have to interpret the pattern and decide what to do.

![Individual evidence ledgers preserve case context; a deliberately limited scoreboard reveals recurring patterns to accountable leaders without making the decision for them.](../assets/images/talent-development/evidence-levels.svg){#fig-tda-evidence-levels}

---

Evidence can diagnose capability honestly only when the organization also examines opportunity. A person cannot demonstrate an operating mode the system never permits them to practice.

<!-- Preview assembly source: Coaching-and-Calibration-Guide.md: Purpose through ladder relationship; Talent-Development-Architecture.md: coaching, One-on-Ones, and Two Levels of Evidence -->
