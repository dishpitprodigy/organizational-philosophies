# Personal Decision Framework

Use this framework before discussing solutions for a complex project. The goal is to put the work into a stable planning scaffold before debating implementation details.

## The Rule

- Do not decide details first.
- Decide what kind of thinking the work requires.

## The 5-Box Scaffold

When a new project appears, answer only these questions in writing.

#### 1. What kind of problem is this?

Pick one:

- Discovery
- Migration
- Redesign
- Enablement
- Optimization

If this is misclassified, the work usually becomes harder to scope, sequence, and explain later.

#### 2. What must be true before work starts?

List constraints, not solutions:

- Is security sign-off required?
- Are organizational boundaries fixed?
- Are timelines immovable?

This prevents fantasy planning.

#### 3. What is explicitly not being solved?

Write the non-goals early. If they remain implicit, they will be reintroduced later as assumed scope.

#### 4. What reusable artifact must exist at the end?

Examples:

- Taxonomy
- Decision record
- Capability list
- Trust model
- Reference pattern

If the answer is only "running code," this framework is probably no longer enough on its own. You may already be in execution planning.

#### 5. What downstream work should never need to ask "why" again?

That is the success metric for the framing work.

## Planning Concepts

### Project Phases

This framework is compatible with PMI-style phase thinking: initiation, planning, execution, monitoring and controlling, and closing.

In practice, Agile and Scrum usually change how execution and feedback loops operate. They do not eliminate the need for initiation, planning, or scope control.

Source:
[PMI Process Groups Overview](https://projectbliss.net/pmi-process-groups/)

### Tasks vs Discovery Packages

This document uses **discovery package** as an adapted term for ambiguous, early-phase technical work.

It is intentionally not strict PMBOK terminology:

- In PMBOK/WBS language, a **work package** is the lowest level of a work breakdown structure.
- In discovery-heavy technical work, teams often need a planning unit that is still outcome-oriented but not yet decomposed into execution steps.
- A **discovery package** fills that role.

You can think of the relationship this way:

- PMBOK work package: formal planning unit inside a WBS
- Discovery package: pre-execution planning unit for complex or uncertain work
- Story/task: execution unit once the ambiguity has been reduced

| Tasks | Discovery Packages |
| --- | --- |
| Describe actions | Describe outcomes |
| Ordered and prescriptive | Loosely ordered or parallel |
| Fragile when assumptions change | Stable when assumptions change |
| Easy to micromanage | Easy to delegate |
| Good for execution | Good for discovery and alignment |

If the team does not yet know the right steps, it is usually in discovery-package territory, not task territory.

### Discovery Package Usage

Group discovery packages into stable categories.

#### Operational Impact

- What happens when this system is unavailable?
- What is the tolerated duration of failure?
- Who is paged, and with what context?

#### Lifecycle and Change

- How often does this system change?
- What other systems' changes invalidate work here?
- What must be retested when this changes?

#### Coupling and Dependencies

- What other systems assume this "just works"?
- What hidden contracts exist around timing, identity, or naming?

#### Failure and Recovery

- How do we recover from partial failure?
- What is the slowest acceptable recovery path?
- What breaks if recovery exceeds that window?

#### Ownership and Authority

- Who decides when change is allowed?
- Who can pause rollout?
- Who owns risk acceptance?

## Formal Concepts

These concepts inform the framework and help connect it to more formal delivery models.

### Agile vs Scrum

Scrum is an opinionated implementation of Agile. It applies Agile principles through a defined set of roles, events, and artifacts rather than leaving each team to design its own operating model.

Agile is the broader philosophy centered on iterative delivery, customer collaboration, and adaptability.

Reference:
[Scrum Alliance](https://www.scrumalliance.org/)

### Agile and Traditional Project Management

Agile is not a replacement for project structure. It shortens feedback loops and brings learning into execution earlier, but it does not eliminate the need to define goals, constraints, scope boundaries, and decision rights.

One useful way to think about it:

- Traditional planning tries to reduce uncertainty before execution.
- Agile accepts that some uncertainty can only be reduced during execution.
- Scrum changes the cadence of planning, review, and adaptation.
- None of that removes the need for framing the work correctly up front.

For novel technical work, customers and stakeholders often refine their understanding only after interacting with an early version of the solution. That is why iterative delivery matters. The plan still matters too; it simply needs to tolerate learning.

#### Example

Imagine building an automatic screwdriver for a customer. The initial requirement is simple: reduce the manual effort required to drive screws into wood.

If the design is created without learning more, the first version may work only for small softwood boards. Later the customer reveals that the real use case involves hardwood, larger lumber, reverse operation for removing screws, and safety controls to prevent accidental activation.

The point is not that the original planning was useless. The point is that the initial framing was incomplete. Agile methods help teams discover and respond to that gap sooner, but they do not remove the need for requirements, constraints, and explicit non-goals.

### PMBOK / WBS

In formal PMI terminology, a **work package** is the lowest level of a WBS and should be outcome-oriented and estimable.

References:
[WBS Basic Principles](https://www.pmi.org/learning/library/work-breakdown-structure-basic-principles-4883)
[Work Package Sizing and Definition](https://www.pmi.org/learning/library/effective-sizing-content-definition-work-packages-5387)

This document borrows from that concept, but uses **discovery package** to distinguish ambiguous planning work from formally decomposed execution work.

### Cynefin Framework

Cynefin classifies problems as:

- Clear / Obvious -> best practices
- Complicated -> expert analysis
- Complex -> probe, sense, respond
- Chaotic -> act to stabilize

Tasks work well in clear and complicated domains.

Discovery packages are more appropriate in complex domains, where teams need to reduce uncertainty before they can prescribe exact steps.

### Lean and Theory of Constraints

Another useful framing:

- Discovery -> reduce uncertainty
- Migration -> move state A to state B
- Redesign -> change structure
- Enablement -> remove blockers for others
- Optimization -> improve efficiency or flow

These are not formal PMI categories. They are intent categories.

## Discovery Package Template

**Name:**  
Short, outcome-oriented noun phrase

**Intent:**  
Discovery / Enablement / Migration / Redesign / Optimization

**Objective:**  
What question this work answers

**Non-Goals:**  
What it explicitly does not decide

**Inputs Required:**  
Who must be involved and what information must exist

**Output Artifact:**  
The thing that proves it is done

**Downstream Enabled:**  
What work can now proceed without rework

## Early Classification Heuristics

Use these when the work feels ambiguous and the team is tempted to jump straight into design or execution.

### Safe-First Classification Rule

When unsure, default to **Discovery** first.

Why:

- Discovery packages do not lock in assumptions.
- They are politically safer than premature design commitments.
- They produce reusable artifacts.
- They justify later redesign without treating earlier learning as failure.

### Simple Decision Tree

Ask one question at a time:

1. Do I already know what "done" looks like?
   - Yes -> probably not Discovery
   - No -> Discovery

2. Will doing this work constrain future options?
   - Yes -> Redesign or Migration
   - No -> Discovery or Enablement

3. Is the primary value learning, moving state, unblocking others, or improving flow?
   - Learning -> Discovery
   - Moving -> Migration
   - Unblocking -> Enablement
   - Improving -> Optimization

If you are torn between two categories, choose the one that produces an artifact rather than a system change.

## Refactoring Vague Discovery Epics

Backlog epics filled with "determine X" or "research Y" are usually a sign that task-based thinking has been applied to discovery work.

Those items feel weak because:

- They are vague.
- They do not feel like visible progress.
- They do not tell reviewers what artifact will exist at the end.

### Instead of this

- Determine IAM requirements
- Research AWS authentication options
- Figure out directory structure

### Do this

**Epic: Platform Identity Discovery**

Discovery packages under it:

- **Identity Surface Inventory**
  Output: documented list of identity consumers

- **Authorization Verbs Definition**
  Output: capability list of verbs rather than group names

- **Trust Boundary Definition**
  Output: written trust model and escalation paths

Each package:

- Has a finish line
- Creates a reviewable artifact
- Can be marked done without debate

This makes the backlog more useful because:

- Progress becomes visible
- Discovery work stops pretending to be execution
- Stakeholders can review outcomes rather than activity
