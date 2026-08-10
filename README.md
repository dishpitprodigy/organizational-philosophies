# Organizational Systems and Technical Operations

This repository contains working prototypes and long-form writing about how
organizations define, authorize, deliver, operate, and learn from technical
work.



https://github.com/user-attachments/assets/c55a8cd1-6740-4198-9b32-808ddf5a6bf1



## Work Intake in Backstage

The [Work Intake Backstage prototype](work-intake-backstage/) demonstrates an
enterprise intake system that begins with structured evidence instead of an
unbounded ticket description. It uses the Backstage catalog to derive ownership
and technical dependencies, preserves the full proposal as an atomic artifact,
and keeps review, authorization, and delivery-capacity decisions distinct.

The prototype includes:

- a guided, versioned Work Proposal form;
- catalog-derived system, team, and dependency mapping;
- explicit sponsor, review, and delivery-authority boundaries;
- deterministic Jira projections without treating Jira hierarchy as the domain
  model; and
- a fictional enterprise with infrastructure, platform, SRE, identity,
  application, data, network, systems, and data-center functions.

The [standalone decision-tree prototype](work-intake-decision-tree/) exposes the
intake model without the Backstage shell. The implementation is independent and
uses fictional company data; it demonstrates the same class of controls used to
govern very large technical portfolios without reproducing a proprietary system.

For installation, architecture, and demonstration instructions, begin with the
[Backstage prototype README](work-intake-backstage/README.md) and
[How It Works](work-intake-backstage/HOW-IT-WORKS.md).

## Related writing

- [Work Intake Is an Organizational System](Work-Intake-Is-an-Organizational-System.md)
- [Framing Technical Work Before Design](Framing-Technical-Work-Before-Design.md)
- [Writing Work Items: Epics, Stories, and Tasks](Writing%20Work%20Items%20-%20Epics,%20Stories,%20and%20Tasks.md)
- [RFPs and Vendor Selection as Evidence Systems](RFPs-and-Vendor-Selection-as-Evidence-Systems.md)
