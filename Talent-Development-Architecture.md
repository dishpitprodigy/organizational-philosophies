# Talent Development Architecture

*A companion to the Career Progression Guide and the Coaching and Calibration Guide. The ladder defines what growth looks like; coaching and calibration define how to judge it fairly; Talent Development Architecture defines how the organization creates the conditions for people to grow into it.*

## Purpose

Most organizations talk about talent development as if it were a manager trait: good managers coach, good employees grow, and good hiring fills the remaining gaps. That framing is too narrow. Development is not only a conversation skill or an HR process. It is an organizational design problem.

Talent Development Architecture, or TDA, is the system for observing, coaching, placing, developing, and advancing people from evidence rather than impressions. It connects coaching, calibration, hiring, scope assignment, succession planning, and day-to-day work allocation into one operating model.

The thesis is simple: **talent gets better when the organization deliberately creates the right reps, the right feedback, the right assignments, and the right evidence.**

Without that architecture, development depends on luck: who happens to get observed, who happens to find a mentor, who happens to volunteer for stretch work, who happens to be trusted before they can prove they deserve trust, and who happens to arrive with the needed experience already.

TDA exists to make that work visible and intentional.

---

## Why Baseball Is the Analogy

Baseball is the cleanest sports analogy for Talent Development Architecture because its development pipeline is unusually explicit. Players move through structured levels of competition: Minor League A, AA, AAA, then Major League Baseball. Each tier exists to give players level-appropriate reps, expose skill gaps, generate evidence, and determine who is ready for the next level. The major-league roster is not the whole talent system; it is the visible tip of a much larger development architecture.

Baseball is also the closest sports analogue to the business world's measurement fantasy. The Moneyball story is not just "sports with statistics." It is the endgame of every efficiency benchmark: turn scattered observation into structured evidence, use that evidence to find undervalued capability, and make better allocation decisions than competitors who are still relying on impressions.

The ideal is that the organization can tell when someone is ready for the next level from accumulated evidence. Baseball gets unusually close to that ideal. A team looking at a player in AAA is usually not asking whether that player can bring leadership to a struggling major-league roster. It is asking whether the player has demonstrated enough level-appropriate capability to face the next level of competition. The progression model is clean, and the evidence system is mature.

The difference is that baseball outcomes are unusually explicit. A pitch is a ball or a strike. A runner is safe or out. A plate appearance produces a countable result. Business outcomes are more ambiguous and more contextual. Frameworks like DORA work well in their intended domain because they isolate a meaningful slice of engineering performance, but they do not transfer cleanly to every function. TDA should borrow baseball's structured development pipeline and measurement ambition without pretending business outcomes are as clean as box scores.

---

## How This Guide Uses Sports Analogies

The main argument should stand without sports knowledge. Sports analogies are useful only when they reveal an organizational pattern more clearly than ordinary business language.

The point is not sports. The point is cross-domain pattern recognition. A reader should be able to say, "I do not care about baseball or football, but I understand the organizational pattern this is trying to expose."

In this guide, the sports language does three jobs:

1. **Baseball explains progression.** A real development system gives people level-appropriate reps, observes performance, and decides readiness from evidence.
2. **Team captains explain tactical authority.** Senior ICs can translate intent into live execution without becoming managers.
3. **Training analogies explain preparation.** Managers are responsible for asking whether a person has been prepared for the challenge being placed in front of them.

### Recommended Language Pattern

Use this distinction when the guide needs to separate tactical IC leadership from compressed management roles:

> Team captain model: good. Player-coach management model: usually bad.

A **team captain model** means:

- senior ICs have tactical authority
- people closest to the work help translate intent into execution
- leadership trusts qualified people to make live adjustments
- feedback from the field changes the plan

A **player-coach management model** means:

- one person is expected to manage people and carry normal IC output
- management work is underfunded
- execution work is underfunded
- role conflict is disguised as empowerment
- failure is blamed on individual prioritization instead of incoherent design

This distinction should be explainable without sports: tactical authority is not management authority. A senior IC may lead execution from the field, but that is not the same thing as owning staffing, coaching, development, performance management, priority negotiation, and long-term organizational health.

### Levels of Field Authority

"Team captain" is a category, not a single career level. Different IC levels imply different amounts of field authority.

- A **senior IC** may lead execution inside a bounded scope. They help the team read the situation, make local tradeoffs, and keep work moving.
- A **staff-level IC** creates leverage across a broader field. They may not own the whole operating concept, but their judgment changes how multiple people coordinate, sequence work, and respond under pressure.
- A **principal-level IC** may have unusual authority to shape the operating concept itself. They are rare because the organization is trusting them not only to execute inside the system, but to help decide what the system should become.

This is why "captain" language has to stay attached to decision rights. Some players are trusted to make adjustments within the called play. A much smaller number are trusted to change the play, reshape the plan, or challenge the operating concept. Organizations create confusion when they hand out the language of leadership without clarifying which decisions the person is actually allowed to make.

---

## The Core Model

Talent development has five connected loops:

1. **Career alignment** - understand what the person is good at, what they enjoy, what they want to grow toward, and what the organization needs.
2. **Talent utilization review** - inspect whether assignments, priorities, hidden work, constraints, support, and development goals match the reason the person was hired or trusted with the work.
3. **Safe reps** - create bounded opportunities for the person to practice the next operating mode without unacceptable organizational risk.
4. **Coaching** - use concrete performance or behavior gaps to understand the person's mental model and improve how they read the system.
5. **Evidence** - record what happened, what changed, what was learned, and what level of work the person actually demonstrated.

These loops should not live only in annual review paperwork. They should show up in one-on-ones, planning, assignment decisions, stretch proposals, calibration packets, succession planning, and hiring strategy.

---

## Principle 1: Preference Is Evidence, Not a Perk

Employee preference is operational signal.

What work energizes this person? What work drains them? What do they seek out without being asked? What do they avoid even when they are competent at it? What kind of problem causes their curiosity to turn on?

Those answers matter because preference predicts:

- quality of output
- durability of motivation
- learning rate
- burnout risk
- cost of forced stretch
- likely long-term fit
- where the organization can get disproportionate return from the person

Preference is not veto power. Sometimes the work is the work. A person on a team that owns both on-prem systems and cloud may need to support Terraform competently even if they hate writing it. Baseline competence matters, and nobody gets a role made entirely out of favorite tasks.

But sustained misalignment is waste. If the same person is happiest and strongest writing Ansible, Python, Bash, or working on-prem, a wise manager should bias their long-term assignment mix toward that fit when the business allows it. The goal is not indulgence. The goal is better output from the talent the organization already has. Some necessary work will still be unpleasant; preference is signal, not exemption.

Employees should be encouraged to discuss these preferences openly with their managers. Managers should treat the information as planning input, not as complaining.

Managers should also use disliked work as a learning opportunity when the exposure is genuinely necessary. If an engineer strongly prefers one tool or operating model over another, the coaching question is not only "can you do the required work?" It is also "can you explain why reasonable people prefer the alternative?" The point is not to force false enthusiasm. The point is to build the ability to operate from another perspective when the business context requires it.

A person who dislikes Terraform may still need to understand what Terraform users value: provider breadth, declarative workflow, common hiring market, ecosystem support, and familiar patterns across cloud teams. That same person may still prefer Ansible, Pulumi, Python, or another model after doing the work. That is fine. The development value is in learning to understand the opposing case well enough to apply the right tool in the narrow context where it is strongest, not in pretending every preference is equally aligned with every situation.

### Small Wins and Enjoyment Are Signal

Trying to have fun with the work is not childish, unserious, or separate from performance. Enjoyment is one way people stay connected to the work long enough to improve at it.

Managers should notice whether people still celebrate each other's wins. A resolved incident, a removed source of toil, a clean handoff, a useful runbook, a fast recovery, a better test, or a small automation improvement may not look like a major business milestone. But small wins compound into large outcomes, and celebration reinforces the behaviors that create them.

Lack of celebration is also signal. It may mean the team is exhausted, afraid to show enthusiasm, disconnected from the outcome, too siloed to notice each other's contributions, or operating in a culture where visible enjoyment is treated as unprofessional. That is a management problem. The goal is not performative cheerleading. The goal is a team that recognizes progress, learns from it, and wants to keep playing well together.


---

## Principle 2: Forced Stretch Has an Elastic Limit

Stretch work is necessary. Forced stretch work is sometimes necessary. But stretch is not free.

There is an elastic limit: the boundary between healthy forced stretch and damaging misalignment. Inside that boundary, the person can recover, learn, and become more capable. Beyond it, the organization creates brittleness, burnout, reduced elasticity, or failure.

The important distinction is not "liked work" versus "disliked work." The distinction is short-term exposure for baseline competence versus sustained assignment against durable strengths and preferences.

A useful test:

**Is this assignment helping the person become more capable, or is it consuming their capability faster than it builds it?**

If the answer is not clear, the manager needs more context before calling the assignment development.

---

## Principle 3: Diagnose Utilization Before Judging Performance

When performance regresses, do not start with the assumption that the person changed. Start like a systems engineer investigating degradation.

Did this used to work? What changed? Did load increase? Did priority conflict increase? Did a hidden workstream appear? Did another leader create side-channel work? Did the person lose support? Did the system around the person change while the visible assignment stayed nominally the same?

That diagnostic step is the **Talent Utilization Review**.

Use it proactively before major assignments and reactively when output drops below expectation.

The loop:

1. Map current assignments.
2. Expose hidden work.
3. Compare stated priorities.
4. Inspect constraints and dependencies.
5. Gather the person's context.
6. Reassess the visible performance signal.
7. Decide what changes: the person, the work, the priorities, the support, or the system around them.

In team-sport terms, the organization should ask whether it is putting the player in a position to succeed. Too many disparate assignments of equal priority will invariably lead to delayed outputs, reduced quality, or both. 

The sports-franchise mentality is to create conditions where talent can produce, not to conclude that the talent failed while the organization was asking it to win from an impossible position.

---

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

That is to say that it is not every player's objective to score on every play. It is every player's objective to be in the optimal position for the team to score on every play. That subtle change of phrasing is what separates excellent teams from mediocre ones. Successful teams have a singular vision from the top down, and everyone understands the role they need to play for the team to achieve its goals.
\# Callout box on the last sentence for emphasis in the HTML.

The business equivalent is teaching the person how to read systems: what signals reveal a resource constraint, dependency pressure, capacity issue, priority inversion, customer impact, or failure mode.

### A Coaching Conversation Shape

The exact language can vary by person, manager, culture, and severity. The conversation should have phases rather than a rigid script:

**Open with purpose and perspective.** Mentally begin from the reason the person was hired or trusted with the work. Assume there is a valid strength to preserve. Be plain about the concern, but establish immediately that their interpretation is integral to the outcome: "I want to talk about X because it caused Y. Before I go further, what is your read on what happened?"

**Listen and orient.** Coaching requires more listening than talking. Let the person describe the situation in their own terms, then ask questions that reveal how they were interpreting the system. You are trying to create the conditions for them to troubleshoot their own decision process the way they would troubleshoot code, analyze a business proposal, or inspect a financial sheet.

**Follow connected context; table unrelated context.** If they raise a different issue, listen long enough to determine whether it is connected. It may be the hidden dependency that explains the visible failure. If it seems unconnected, ask them to explain the material connection. If they can't, table it respectfully and commit to returning to the other topic at a later time. The goal is not to dismiss the issue; the goal is to keep this coaching loop coherent. 

**Name the gap clearly.** Once their perspective is on the table, state the concern as specifically as possible: what happened, what outcome it caused, and why the outcome matters. Stay with behavior, evidence, and impact. Do not turn the moment into a personality assessment.

**Update the mental model.** Ask what they think would have made the situation successful. Identify the missing signal, incorrect read, stale assumption, or conflicting instruction. Then attach the correction to future cues: "when you see this pattern again, consider whether it is evidence of such-and-such condition, and adjust this way."

**Close with mutual commitments.** The close must say what the employee will change and what the manager or organization will do. If the conversation reveals a broken process, management owes a real response: fix the system, design a durable workaround, or explain why nothing can currently be changed. The point is not only to improve the person; it is to create a feedback loop that uncovers inefficiencies and risks throughout the organization.

If formal documentation is required, it should come after the coaching loop has produced a shared path forward. A clean version sounds like: "I think we are positioned to move forward from this. I do need to document what happened and what we agreed to, so there is a written record if the issue repeats. If we are not talking about this again in the next review period, it will not be treated as an ongoing concern." Documentation is a record-control mechanism, not the coaching mechanism itself.

Never lie, stretch, or massage facts in a coaching conversation. If notes are being taken, say why. If notes may be used in an incident document, performance record, or other formal artifact, say so. Distinguish facts from stories.
\# add something to 'dishpitprodigy/organizational-philosophies/0.Organizational-Excellence-Book-Gaps.md' about facts vs stories. Maybe it belongs here, but idk. Either way, it deserves more than a single sentence.

### Manager Readiness Questions

Before a manager assigns meaningful stretch, the manager has a preparation duty. These questions are not optional reflection prompts. If the manager has not asked them, the manager has not done the job.

- Did I do enough to prepare this person for the challenge I am putting in front of them?
- Am I sure they are ready?
- What are the consequences if I am wrong about their readiness?
- If this fails, what part of the failure belongs to me, what part belongs to the employee, and what part belongs to the system around them?
- What would reasonable struggle look like?
- What would unacceptable risk look like?
- If things begin going badly, what intervention options do I have?

For consequential work, the manager should begin from the assumption that a preventable employee failure is a management failure unless proven otherwise. The manager does not get to treat failure as evidence that the employee was unfit until the manager can show that the assignment was bounded, the expectations were clear, the person was prepared, the support model existed, the risks were understood, and intervention options were available.

\# If this fails ... call out in the HTML.

This matters because employee accountability is not abstract. Performance consequences affect income, reputation, family stability, health, confidence, and future opportunity. Sometimes an employee truly owns the failure, and sometimes termination or role removal is the right outcome. But a manager should be able to sleep at night knowing they did not put an unprepared person into a situation where failure was predictable, then let the person absorb the consequences alone.

A boxing analogy is useful here only if it is kept in the right frame. The lesson is not toughness or punishment. The lesson is preparation, mechanics, trust, readiness, and intervention. A trainer does not send someone into sparring because struggle sounds developmental. A trainer asks whether the person has practiced enough mechanics to face that level of intensity without unacceptable harm.

Managers owe the same kind of thinking in business terms. Stretch work should be challenging enough to build capability, but bounded enough that failure becomes evidence and learning rather than avoidable damage.

---

## Principle 5: Every Career Transition Gate Needs a Safe-Reps Path

The hardest jumps in a technical career are often not knowledge jumps. They are operating-mode jumps.

Common gates:

| From | To |
|---|---|
| Seeing a problem | Reporting it clearly |
| Reporting a problem | Helping fix it |
| Fixing a problem | Preventing its recurrence |
| Preventing one recurrence | Building reusable automation or standard work |
| Owning a task | Owning an outcome |
| Owning one outcome | Creating leverage for others |

If the organization requires experience before granting opportunity, it must also provide bounded ways to gain that experience. Otherwise early and mid-career development depends on luck, off-book initiative, or unusually generous coworkers.

A **Safe-Reps Path** is a bounded way to practice the next operating mode without unacceptable risk.

Examples:

- A helpdesk employee spends four hours a week migrating low-risk scripts from Python 2 to Python 3.
- A junior operator shadows incident remediation, then owns a read-only diagnostic step, then owns a reversible fix under supervision.
- A systems administrator refactors repetitive conditional logic into a data structure with tests and review.
- A cloud-curious on-prem engineer contributes to a Terraform 0.x to 1.x migration in a constrained module.
- A strong implementer writes the runbook, then the checklist, then the automation for a recurring issue.

The point is not the specific technology. The point is legitimate reps across the gate.

---

## Stretch Proposals

A **Stretch Proposal** is an employee-initiated request for a bounded development opportunity that moves them toward a desired skill, responsibility, or domain.

It should be normal career-development language, not an exception or a favor.

A good Stretch Proposal answers:

- What do I want to learn or practice?
- What real problem would this help solve?
- Who owns the work?
- How much time am I asking for?
- What is the expected value?
- What is explicitly out of scope?
- What can I do read-only?
- What actions require approval before I make changes?
- What is the risk if I make the situation worse?
- What evidence will show whether this was useful?

For cross-team proposals, manager-to-manager coordination is required. The employee's manager, the receiving team's manager, and the work owner should agree on time box, priority impact, supervision, risk boundaries, and success criteria.

This matters because self-directed stretch work is often how people become capable of the next thing. But unmanaged stretch work can become hidden risk. The formal version should preserve initiative while making the work visible, bounded, and legitimate.

---

## The Internal Farm System

The sports-franchise analogy is strongest here. Strong franchises do not merely acquire talent. They scout, draft or sign, assign level-appropriate reps, coach specific skills, observe performance, move people through levels of competition, and build succession pipeline before a role becomes urgent. In the MLB, this is called a team's "farm system," and players develop through Minor League A to AA to AAA, and the best of the best get called up to the MLB (the corporate equivalent is IC9 - Fellow; almost no one gets that far).

Businesses need the same pattern.

An **Internal Farm System** is the practice of coordinating small, useful stretch assignments across teams so people can develop toward real organizational needs.

It creates three kinds of value at once:

1. The employee gets meaningful reps in a desired skill or domain.
2. The receiving team gets real work done.
3. The organization builds succession pipeline before it is forced to need it.

This should not depend on a heroic employee finding after-hours work and hoping someone says yes. Employees should be encouraged to talk to people on other teams, compare patterns, and notice where one team's approach might apply to another team's problem. But when the work becomes real, it should move onto the books.

Four hours a week can matter. It can be enough to give someone a path from support into systems work, from systems work into automation, from implementation into design, or from team-local work into cross-team influence.

---

## Career Pathing Needs Architecture

"Own your career" is useful advice only when the organization exposes enough map for the employee to navigate. Without guidance on actual departments, roles, skill sets, decision rights, and available development paths, career ownership becomes guesswork.

A generic career tool does not solve that. If a "career compass" produces abstract advice, points toward roles that do not exist, or suggests paths the organization has not actually made available, it is not a development system. It is career-pathing theater: the organization appears to offer mobility while leaving employees to invent the path themselves.

That creates several risks:

- employees leave to get the experience the organization could have helped them build
- employees form shadow development networks to discover work the official system does not surface
- stretch work happens through side channels instead of visible coordination
- people try unsafe tooling shortcuts to create opportunities for themselves
- managers lose sight of where capability and interest already exist inside the company

The Internal Farm System is the formal answer. Employees should absolutely talk to people on other teams, compare patterns, and notice where their interests might create value. But the organization has to turn that curiosity into visible, bounded, legitimate work. A competent development system does not merely tell people to pave their own career. It shows them the roads that exist, the roads the company needs built, and the safe-reps paths for helping build them.

---

## Career-Stage Development

TDA should reuse the Career Progression Guide's existing tiers rather than inventing a second leveling model.

### Earlier and Mid-Career

The development focus is safe reps across transition gates.

The organization should ask:

- What next operating mode is this person trying to learn?
- What bounded work would let them practice it?
- What support or supervision keeps the risk acceptable?
- What evidence would show readiness for more responsibility?

This is where development culture matters most. Coaching, practice, feedback, and bounded stretch should be normal expectations of the company, not special events. Continuing the sports analogy, people in this stage of their career are the team's most recent draft class. Successful sports teams have staff dedicated to developing draft picks. Many companies will not staff this as a dedicated role, so it must be an explicit portion of any people manager's time.

### Senior

The development focus is scope fit, durable ownership, and leverage.

The organization should ask:

- Is this person assigned work that matches their durable strengths?
- Are they owning outcomes rather than only tasks?
- Are they building systems, standards, runbooks, automation, or practices that outlast their direct effort?
- Are they being given scope that can demonstrate the next level if the organization needs that level?

Senior development is not just harder tickets. It is better placement against outcomes.

### Staff+

The development focus is cross-team capability, succession, strategic placement, and organizational leverage.

The organization should ask:

- What capability is missing across teams?
- Who can create it?
- Who can be developed behind them?
- What work creates leverage through other engineers?
- Is the missing capability developable internally, or does the organization need free-agent hiring?

External hiring becomes more like sports free-agency as you move higher up the ladder, especially when the company lacks principal or Staff+ capability in-house. That is not a failure by itself. It is a different tool. The failure is pretending external hiring is a substitute for a development culture at every level.

---

## One-on-Ones

One-on-ones are the primary venue for proactive Talent Utilization Review.

They are where career alignment, preference signals, constraints, coaching needs, hidden work, stretch proposals, and support gaps should surface before they become review-cycle surprises.

The full practice of running one-on-ones well deserves its own, dedicated, piece. TDA only provides the operating requirement:

- one-on-ones are not status meetings
- one meaningful one-on-one per month is the floor
- higher frequency may be appropriate during forced stretch, role changes, performance regression, ambiguous work, or major scope changes
- the conversation should maintain an active picture of utilization, career direction, support, and evidence

If a manager cannot describe what an employee wants to grow toward, what work drains them, what work energizes them, and what constraints are currently shaping their output, the manager does not have enough signal to manage the person's development well.

---

## Technology Cannot Substitute for Development Architecture

Organizations often try to use technology to compensate for missing development architecture: career tools, skills platforms, workflow systems, dashboards, AI assistants, and intake portals. Those tools can augment well-designed behavior. They can make information easier to find, reduce administrative friction, and make patterns visible. They cannot create the underlying management behavior by themselves.

Technology can support a process, but it cannot make a broken process healthy. A tool that routes work through a bad operating model mostly makes the bad operating model faster, more expensive, or harder to see. AI does not change that. Using LLMs to push through bad process may feel productive locally, but the cost can become invisible to the person authorizing the usage and difficult for the company to distinguish from legitimate work.

This matters for TDA because career development is not solved by a portal that emits generic recommendations. The system still needs actual roles, actual skill needs, actual managers coordinating work, actual safe-reps paths, actual coaching, and actual evidence. The tool can help people navigate the architecture. It cannot replace the architecture.

---

## Hiring and Free Agency

TDA does not mean every capability must be grown internally, nor does it mean perfect employee retention.

At all levels, external hiring can be the right move. If the organization does not have principal-level technical leadership, or lacks a specific senior capability, hiring externally may be the fastest honest path. This is the business equivalent of free agency.

But the higher-level free-agency model should not erase the internal development expectation for earlier and mid-career employees. A company cannot be great if it is not trying to get better every day, and that includes building people. Fundamentally, all economies are human economies: the organization that has the highest capability for growing and developing good people will have the best outcomes in the long run.

Hiring, development, and succession should answer different questions:

- **Hiring:** what capability do we need that we do not have, or cannot grow in time?
- **Development:** what capability can we create through coaching, reps, and placement?
- **Succession:** what future responsibility should someone be preparing to take before we urgently need them to take it?

---

## What TDA Changes

Without TDA, managers tend to ask:

- Did this person perform?
- Are they ready?
- Do they have experience?
- Can we hire someone who already does?

With TDA, managers ask better questions:

- What was this person hired or trusted to do well?
- Is their current assignment mix using that strength?
- What changed around them?
- What does the person think would have made the situation successful?
- What defect exists in their mental model?
- What support or priority change does the organization owe?
- What transition gate are they trying to cross?
- What safe reps can we create?
- What evidence will show growth?
- What succession pipeline are we building?

That is the difference between treating people like machines that need exact instructions and treating talent as something the organization is responsible for developing, placing, and coaching.

The goal is not to make management softer. The goal is to make it more accurate.
