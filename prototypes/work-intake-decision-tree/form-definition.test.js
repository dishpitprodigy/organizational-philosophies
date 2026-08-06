const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const {
  collectAnswers,
  compileAnswers,
  evaluateCondition,
  fieldsIn,
  selectFormDefinition,
  validateAnswers,
  validateFormDefinition,
} = require("./form-definition.js");

const definition = JSON.parse(
  readFileSync(
    join(__dirname, "forms", "definitions", "technical-work-proposal.v1.json"),
    "utf8"
  )
);

test("form selection chooses the versioned definition for technical work", () => {
  assert.equal(
    selectFormDefinition([definition], { intakeContext: "technical-work" }),
    definition
  );
  assert.equal(
    selectFormDefinition([definition], { intakeContext: "facilities-work" }),
    undefined
  );
});

test("conditional fields use the bounded declarative grammar", () => {
  const answers = {
    "proposal.known-uncertainty": true,
    "proposal.intent": "Discovery",
    "proposal.affected-user-count": 6400,
  };

  assert.equal(
    evaluateCondition(
      {
        all: [
          { equals: ["proposal.known-uncertainty", true] },
          { includes: [["Discovery", "Redesign"], "proposal.intent"] },
          { greaterThan: ["proposal.affected-user-count", 5000] },
          { present: "proposal.intent" },
          { not: { equals: ["proposal.intent", "Migration"] } },
        ],
      },
      answers
    ),
    true
  );
  assert.equal(
    evaluateCondition(
      {
        any: [
          { lessThanOrEqual: ["proposal.affected-user-count", 100] },
          { equals: ["proposal.intent", "Discovery"] },
        ],
      },
      answers
    ),
    true
  );
  assert.throws(
    () => evaluateCondition({ execute: "someJavaScript()" }, answers),
    /Unsupported condition operator/
  );
});

test("answer compilation preserves stable field identifiers and output paths", () => {
  const answers = {
    "proposal.current-state.baseline-mode": "reference",
    "proposal.current-state.baseline-reference":
      "OBS-ARCH-004 rev 7, accepted May 18, 2026 by SRE",
    "proposal.current-state.delta":
      "Storage nodes changed; topology and retention behavior did not.",
    "proposal.requirements": [
      {
        id: "SHALL-001",
        modality: "shall",
        condition: "The candidate shall sustain the accepted workload.",
        verification: "Replay OBS-WORKLOAD-2026-05 and reconcile every sample.",
      },
    ],
  };

  assert.deepEqual(compileAnswers(definition, answers), {
    currentState: {
      baseline: {
        mode: "reference",
        reference: "OBS-ARCH-004 rev 7, accepted May 18, 2026 by SRE",
        delta:
          "Storage nodes changed; topology and retention behavior did not.",
      },
    },
    requirements: [
      {
        id: "SHALL-001",
        modality: "shall",
        condition: "The candidate shall sustain the accepted workload.",
        verification: "Replay OBS-WORKLOAD-2026-05 and reconcile every sample.",
      },
    ],
  });
});

test("guided state is collected under the same stable identifiers the form renders", () => {
  const guided = {
    currentState: {
      baselineMode: "reference",
      baselineReference: "OBS-ARCH-004 rev 7",
      delta: "No material topology change.",
    },
    requirements: [
      {
        id: "SHALL-001",
        modality: "shall",
        condition: "The result is testable.",
        verification: "Run the accepted test.",
      },
    ],
  };

  const answers = collectAnswers(definition, guided);

  assert.equal(
    answers["proposal.current-state.baseline-reference"],
    "OBS-ARCH-004 rev 7"
  );
  assert.deepEqual(answers["proposal.requirements"], guided.requirements);
});

test("the versioned definition has unique, complete stable fields", () => {
  assert.doesNotThrow(() => validateFormDefinition(definition));

  const duplicate = structuredClone(definition);
  duplicate.sections[0].fields.push(
    structuredClone(duplicate.sections[0].fields[0])
  );
  assert.throws(
    () => validateFormDefinition(duplicate),
    /Duplicate form field identifier/
  );
});

test("answer validation follows required and conditional rules from the definition", () => {
  const minimal = {
    "intake.catalog-path": "change",
    "submission.requester": "A. Requester",
  };

  const missingForChange = validateAnswers(definition, minimal);
  assert.ok(missingForChange.some((entry) => entry.id === "proposal.title"));
  assert.ok(
    !missingForChange.some((entry) => entry.id === "intake.inquiry-hours")
  );

  const inquiry = {
    ...minimal,
    "intake.catalog-path": "inquiry",
  };
  const missingForInquiry = validateAnswers(definition, inquiry);
  assert.ok(
    missingForInquiry.some((entry) => entry.id === "intake.inquiry-hours")
  );
  assert.ok(
    missingForInquiry.some((entry) => entry.id === "intake.requires-change")
  );

  const populated = Object.fromEntries(
    fieldsIn(definition).map((field) => [
      field.id,
      field.type === "repeater"
        ? [
            Object.fromEntries(
              field.columns.map((column) => [column.key, "present"])
            ),
          ]
        : field.type === "boolean"
        ? false
        : field.type === "number"
        ? 0
        : "present",
    ])
  );
  populated["intake.catalog-path"] = "change";
  populated["proposal.current-state.baseline-mode"] = "define";
  populated["proposal.known-uncertainty"] = false;
  populated["proposal.outcome-shape"] = "single";
  assert.deepEqual(validateAnswers(definition, populated), []);

  populated["proposal.requirements"] = [
    { force: "shall", id: "001", condition: "A condition", verification: "" },
  ];
  assert.ok(
    validateAnswers(definition, populated).some(
      (entry) => entry.id === "proposal.requirements[0].verification"
    )
  );
});
