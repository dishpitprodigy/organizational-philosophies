# Canonical Loop Diagram Prototypes

These figures test the book's organizational method before that method is rewritten into reader-facing prose.

They are deliberately separate from the generated book assets. Acceptance of the model comes before integration into Chapter 1, the Hiring Guide, or the book build.

## Prototype 1: Canonical Organizational Method

[canonical-organizational-method.svg](canonical-organizational-method.svg) shows the outer inquiry loop:

> observation → question → background research → hypothesis → adaptive business implementation → results → examination and reconciliation → communication and routing → changed knowledge, system, or decision

The diagram preserves two asymmetric rules:

- An observation may remain background context and produce no action.
- A result produced by an intentional intervention must be examined in a functioning loop.

The business method follows the scientific method through hypothesis, expands the experiment into outcome-directed adaptive implementation, then rejoins the scientific method at examination and communication of results.

## Prototype 2: Organizational Method Domain Crosswalk

[organizational-method-domain-crosswalk.svg](organizational-method-domain-crosswalk.svg) maps six domains onto the same method:

- Hiring
- Work intake
- Vendor acquisition
- Talent development
- Defect correction
- Managed runoff

The crosswalk is modeled after protocol-stack mappings: different domain records and activities may occupy the same canonical stage without becoming separate methodologies.

## Editorial status

These are structural prototypes, not finished publication figures. Review should focus on:

- whether the stages and return paths are correct;
- whether business implementation is decomposed at the right altitude;
- whether examination, reconciliation, communication, and the next decision have been separated correctly;
- whether every domain mapping preserves its actual authorities and obligations; and
- whether the crosswalk makes the common method clearer than the text tables it may eventually replace.

Color is never the only carrier of meaning. The stages are numbered and labeled so the figures remain legible in grayscale and accessible descriptions can reproduce their structure.

Run `python3 build.py` from this directory to regenerate both SVGs.
