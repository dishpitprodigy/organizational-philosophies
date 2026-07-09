# Closed-Loop Organization

This context defines the language for a family of organizational philosophy documents about making predictions, judgments, evidence, and outcomes durable enough to reconcile.

## Language

**Closed-Loop Organization**:
A provisional umbrella term for an organization that records predictions and judgments as they happen, then reconciles them against actual outcomes. The term names the document family's thesis rather than a specific implementation.
_Avoid_: Operating-System Docs, Organizational Operating System

**Talent Development Architecture**:
The organizational system for observing, coaching, placing, developing, and advancing people from evidence rather than impressions. It connects coaching, calibration, hiring, scope assignment, and development pipeline design.
_Avoid_: Coaching System

**Talent Utilization Review**:
A named step in Talent Development Architecture that examines whether a person's assignments, priorities, hidden work, constraints, support, and career-development goals match the reason they were hired or trusted with the work. It is used proactively before major assignments and reactively when performance regresses; its output is a decision about what to change in the person, the work, the priorities, or the system around them.
_Avoid_: Talent deployment diagnosis, diagnose talent utilization

**Preference Signal**:
An employee's stated interest, dislike, energy, or desired growth direction treated as operational evidence rather than as a perk. Preference is not veto power over necessary work, but it predicts quality, durability, learning rate, burnout risk, and the cost of forced stretch.
_Avoid_: Perk, comfort, preference as entitlement

**Internal Farm System**:
A Talent Development Architecture pattern where managers coordinate across teams to place employees into small, useful stretch assignments aligned with their interests. The assignment should create real value for the receiving team, give the employee meaningful reps in a desired skill or domain, and build succession pipeline for future roles.
_Avoid_: Shadow work, side quest

**Career-Pathing Theater**:
A development anti-pattern where the organization tells employees to own their career, or gives them a generic career tool, without exposing real roles, departments, skill needs, safe-reps paths, or manager-coordinated opportunities. It creates the appearance of mobility while leaving employees to invent the path themselves.
_Avoid_: Career ownership without architecture, generic career compass

**Stretch Proposal**:
An employee-initiated request for a bounded development opportunity that moves them toward a desired skill, responsibility, or domain. A good proposal clarifies the desired learning, the value to the team, the expected time box, the owner, the risk of making the situation worse, and what actions require explicit approval; cross-team proposals also require manager-to-manager coordination.
_Avoid_: Unbounded volunteer work, unsanctioned fix

**Succession Pipeline**:
The set of people being deliberately prepared to take on future responsibility before the organization needs them in that role. In Talent Development Architecture, the Internal Farm System is one way to create succession pipeline through real work rather than abstract training.
_Avoid_: Replacement list, bench

**Career Transition Gate**:
A hard experience jump where an employee must move from one operating mode to a more accountable one, such as seeing and reporting problems, fixing problems, then building or automating prevention. Talent Development Architecture should create bounded opportunities to cross these gates before promotion or transfer depends on already having crossed them.
_Avoid_: Promotion checklist, years of experience

**Safe-Reps Path**:
A bounded way for an employee to practice the next operating mode without putting the organization at unacceptable risk. Every Career Transition Gate should have a Safe-Reps Path, or the organization is relying on people to somehow gain experience without being allowed to do the work.
_Avoid_: Trial by fire, sink or swim

**Development Culture**:
The expectation that the organization and its employees are continuously trying to get better through coaching, practice, feedback, and bounded stretch. Development is part of how the company operates, not a special program reserved for promotion cycles.
_Avoid_: Training as perk, annual development plan

**Spot Bonus Signal**:
A discretionary recognition payment that serves two purposes at once: rewarding truly exceptional work and creating a negative signal to senior leadership about heroism the operating system required. A spot bonus should not only say "this person did something valuable." It should also ask why the organization needed exceptional effort, whether the work exposed an underfunded process, missing ownership, brittle tooling, unclear priority, or preventable emergency, and whether the heroic act should become durable prevention.
_Avoid_: Spot bonus as morale candy, rewarding heroism without learning from it

**Development Architecture Tooling**:
Technology that helps people navigate an existing development architecture by surfacing roles, skills, opportunities, evidence, and paths. It can augment good process, but it cannot create the management behavior, role clarity, safe-reps paths, or coaching discipline by itself.
_Avoid_: Tool as process substitute, AI as process fix

**Free-Agent Hiring**:
External hiring for senior capability the organization does not currently have in-house. The sports analogy becomes stronger higher on the seniority ladder; at early and mid career, the default expectation should be internal development, not replacing the development pipeline with external hiring.
_Avoid_: Hiring as pipeline substitute

**Career-Stage Development**:
The idea that Talent Development Architecture should apply different development expectations at different career stages while preserving one coherent ladder. Earlier and mid-career stages emphasize safe reps across transition gates; senior and Staff+ stages emphasize scope fit, leverage, succession, and whether the organization already has the needed capability.
_Avoid_: One-size-fits-all development

**Elastic Limit**:
The boundary between healthy forced stretch and damaging misalignment in a person's assignment or development plan. Required exposure to disliked work can be necessary for baseline competence; sustained assignment against durable strengths and preferences creates brittleness, burnout, reduced elasticity, or failure.
_Avoid_: Constant stretch, pressure test

**One-on-One**:
A recurring manager-employee conversation where career alignment, utilization, constraints, coaching, and support are surfaced before they become review-cycle surprises. One-on-ones are a primary venue for proactive Talent Utilization Review.
_Avoid_: Status meeting, O3

**Behavior Assessment**:
A judgment about observable behavior and its impact against an expectation. It is the only valid input for coaching and calibration in this document family.
_Avoid_: Personality Assessment, character assessment

**Personality Assessment**:
A judgment about a person's inferred traits, motives, disposition, or identity. It is not coaching-grade evidence because it is difficult to verify, dispute, or improve against.
_Avoid_: Character assessment

**Coaching Conversation**:
A diagnostic conversation that starts from a concrete performance or behavior gap, surfaces the person's mental model of the situation, updates how they read similar conditions, and produces an agreed next action. It is not a reprimand disguised as development.
_Avoid_: Difficult conversation, feedback sandwich

**Mental Model**:
The person's internal map of signals, constraints, likely outcomes, and appropriate actions in a situation. Coaching works by finding missing signals, incorrect reads, stale assumptions, or conflicting instructions in this model and attaching the correction to future cues.
_Avoid_: Success Model, right answer, manager's answer

**Evidence Marker**:
A specific observable signal that the agreed coaching plan is working. Evidence markers are agreed at the end of a coaching conversation and reviewed after a defined period.
_Avoid_: Vague improvement, attitude change

**Route Summarization**:
A metaphor for reducing unnecessary bloat in AI instruction files, process rules, or other guidance by replacing repeated special cases with a more general rule. Borrowed from network route aggregation, where several specific routes can be represented by one broader prefix when they share the same next hop.
_Avoid_: Hardening by accumulation, more rules by default

**Visual Format Directive**:
A line beginning with `#%` that records stylistic preferences for a more advanced visual format than Markdown. These directives should be removed from the Markdown prose and used to inform later conversion to HTML, ePub, PDF, LaTeX, or another richer presentation format.
_Avoid_: Prose comment, language preference, markdown content

**Commit Boundary**:
A coherent editing unit that should be saved as its own git commit so the document's evolution remains reviewable. Each round of substantive edits should preserve a clear Commit Boundary rather than blending unrelated changes together.
_Avoid_: Batch of unrelated edits, catch-all save

**Clean Working Tree Check**:
The pre-edit habit of confirming that the working tree has no staged or unstaged changes before starting a new round of edits. It protects Commit Boundaries by preventing forgotten work from being blended into the next change.
_Avoid_: Starting from an unknown git state, clean index check
