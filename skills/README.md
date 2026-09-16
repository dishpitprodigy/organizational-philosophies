# Portable technical-planning skills

These skills translate two essays into instructions an AI assistant can apply to real work. They use Markdown with `name` and `description` frontmatter, relative reference links, and no required vendor tools, integrations, or other skills.

| Skill | Use it for | Source essay |
| --- | --- | --- |
| [frame-technical-work](frame-technical-work/SKILL.md) | Establishing the evidence, constraints, and design readiness of complex work. | [Framing Technical Work Before Design](../Framing-Technical-Work-Before-Design.md) |
| [write-work-items](write-work-items/SKILL.md) | Drafting, reviewing, and splitting work by verifiable completion conditions. | [Writing Work Items](../Writing%20Work%20Items%20-%20Epics,%20Stories,%20and%20Tasks.md) |

They are separate because either task can be useful on its own. Used together, the framing brief supplies the current-state basis, constraints, open discovery, and readiness evidence for work-item authoring. The second skill does not need to rerun framing when that evidence already exists.

## Use with an assistant

Copy the entire chosen skill directory, including its `references/` folder, into the skill location supported by your assistant. Discovery and invocation conventions vary by client; follow that client's instructions. The skills deliberately omit client-specific invocation settings and tool declarations.

For an assistant without skill loading, supply `SKILL.md` as task instructions and make its linked reference files available. If it cannot open files, paste the skill and the references called for by your task into the conversation. Neither the original essay nor the other skill is required at runtime.

Example requests:

- “Use frame-technical-work on this proposal. Produce a framing brief and identify the evidence missing before we commit to design.”
- “Use write-work-items to review these tickets. Correct their levels, split compound work, and show which items are ready.”
- “Use write-work-items to define a repeatable server-build request from this established procedure.”

Local standards, evidence, owners, and measurement targets are inputs, not bundled organizational policy. An assistant should expose gaps instead of inventing them. These skills produce drafts and assessments; publishing work items or changing systems depends on the user's authorization and available tools.

## Maintenance

The essays retain the extended rationale; the skill folders contain the operational instructions. When an essay changes, review its corresponding skill and references for semantic drift. Keep each skill folder self-contained so it can be distributed separately. No particular assistant's behavior or automatic discovery is guaranteed by this packaging.
