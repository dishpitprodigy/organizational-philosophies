# DevOps & SRE Coaching and Calibration Guide

*A companion to the Career Progression Guide. The ladder defines what each level is; this guide is about the practice of judging people against it fairly, developing them toward it, and fixing the structures that make that judgment unreliable.*

## Purpose

The Career Progression Guide is a measuring instrument. Like any instrument, it produces accurate readings only when used correctly, and most of the ways it is used incorrectly are not failures of the ladder — they are failures of feedback, of evidence, and of organizational design. This guide addresses those three.

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

## How this guide relates to the ladder

The Career Progression Guide tells you *what* the levels are. This guide is about the integrity of the *act of judging* against them:

- **Part 1** keeps the evidence clean — behavior, not character — so the judgment is fair and the development is possible.
- **Part 2** keeps the evidence complete — continuous, not reconstructed — so the judgment is accurate.
- **Part 3** keeps the evidence read by someone able to read it honestly — separated concerns — so the judgment is unconflicted.

Clean, complete, and honestly read. A rating that fails any one of the three is not a calibration; it is an impression with a number attached.
