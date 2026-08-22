const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const { collectAnswers, compileAnswers, validateAnswers } = require("./form-definition.js");

const {
  COMPANY,
  PUBLICATION_ARTIFACT_SCHEMA_VERSION,
  SCENARIOS,
  beginNewRevision,
  blankState,
  evaluate,
  markProposalEdited,
  publicationArtifact,
} = require("./model.js");

const formDefinition = JSON.parse(
  readFileSync(
    join(__dirname, "forms", "definitions", "technical-work-proposal.v1.json"),
    "utf8"
  )
);

function compileState(state) {
  state.formAnswers = collectAnswers(formDefinition, { ...state, ...state.guided });
  state.compiledAnswers = compileAnswers(formDefinition, state.formAnswers);
  return state;
}

test("Work Proposal identity is structural rather than parsed from display text", () => {
  const result = evaluate(structuredClone(SCENARIOS["Metrics selection"]));
  assert.deepEqual(
    {
      id: result.proposalRecord.id,
      revision: result.proposalRecord.revision,
      label: result.proposalRecord.label,
    },
    { id: "WP-2026-0042", revision: 5, label: "WP-2026-0042 rev 5" }
  );
});

test("publishable fixture content and artifact schema are governed by proposal revision", () => {
  const contracts = [
    ["Metrics selection", 5, "47404dfe29502773c6fe5587bacdbe90f36657ba9263008df4363a7ca7811616"],
    ["SSO migration", 2, "7c219cd925409580fb67b1c2b9105315ce8e242b4c44fa4b0bfd13932c70ba30"],
    ["Identity platform redesign", 2, "c45652a2b8a9109dff4467d663330645915a71848ac5353430e506dcf3daa48f"],
  ];

  for (const [scenarioName, proposalRevision, fixtureSha256] of contracts) {
    const fixture = SCENARIOS[scenarioName];
    const fingerprint = createHash("sha256").update(JSON.stringify(fixture)).digest("hex");

    assert.deepEqual(
      {
        artifactSchemaVersion: PUBLICATION_ARTIFACT_SCHEMA_VERSION,
        proposalRevision: fixture.proposalRevision,
        fixtureSha256: fingerprint,
      },
      { artifactSchemaVersion: 2, proposalRevision, fixtureSha256 },
      `${scenarioName} changed without updating its publication contract`
    );
  }
});

test("a user explicitly creates the next Work Proposal revision", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);

  const revision = beginNewRevision(state);

  assert.equal(revision, 6);
  assert.equal(state.proposalRevision, 6);
  assert.equal(state.scenario, "Custom");
});

test("editing a Work Proposal does not silently consume a revision", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
  state.guided = { enforce: false };

  markProposalEdited(state);

  assert.equal(state.proposalRevision, 5);
  assert.equal(state.scenario, "Custom");
  assert.equal(state.guided.enforce, true);
});

test("publication artifact preserves intake authority boundaries", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
  state.form = { id: "technical-work-proposal", version: 1 };
  state.guided = {
    version: 1,
    enforce: false,
    problem: {
      statement:
        "The current metrics service cannot remain supported at the forecast workload.",
      benefit:
        "Closing the gap preserves reliable alerting and returns recurring operating capacity to SRE.",
    },
    currentState: {
      baselineMode: "reference",
      baselineReference: "OBS-ARCH-004 rev 7, accepted May 18, 2026 by SRE",
      delta: "Storage hardware changed; topology and retention behavior did not.",
      architecture: "Thirty-eight collectors feed three retention tiers.",
      measurements: "OBS-WORKLOAD-2026-05 records the measured production workload.",
      constraints: "Support ends March 31, 2027; recurring work is 56 hours per month.",
    },
    outcome: {
      scope: "Shared engineering metrics producers and consumers.",
      capability: "A supported, operable metrics capability is selected.",
      proof: "the accepted workload and failure corpus passes",
      horizon: "the five-year planning horizon",
    },
    difference: {
      preserve: "Prometheus interfaces and retention obligations",
      change: "Remove the support, capacity, and operating-effort gaps.",
      evidence: "the same retained workload and failure corpus for every option",
    },
    requirements: [{ id: "001", force: "shall", condition: "The candidate shall sustain the accepted workload.", verification: "Replay and reconcile OBS-WORKLOAD-2026-05." }],
    acceptance: [{ context: "equivalent proof work ends", evidence: "every SHALL has retained evidence", verification: "the requirement compliance matrix" }],
    nonGoals: [{ exclusion: "Do not migrate a producer.", reason: "Selection does not authorize delivery." }],
    dependencies: [{ dependency: "Versioned workload replay", owner: "SRE", contribution: "Freeze the replay before testing.", evidence: "Signed input manifest." }],
    preconditions: [{ condition: "The Current-State Baseline is accepted.", evidenceOwner: "SRE" }],
    artifact: { identifier: "SEL-OBS-007", contents: "Selection evidence and decision.", completionProof: "Every SHALL is reconciled." },
    discovery: { question: "Which option passes the common test basis?", phases: [] },
  };
  const artifact = publicationArtifact(compileState(state));

  assert.deepEqual(
    {
      schemaVersion: artifact.schemaVersion,
      id: artifact.proposal.id,
      revision: artifact.proposal.revision,
      state: artifact.proposal.state,
      authorized: artifact.candidateDelivery.authorized,
    },
    {
      schemaVersion: 2,
      id: "WP-2026-0042",
      revision: 5,
      state: "Draft Work Proposal — sponsor acceptance unverified",
      authorized: false,
    }
  );
  assert.deepEqual(artifact.form, { id: "technical-work-proposal", version: 1 });
  assert.deepEqual(artifact.proposal.problem, state.guided.problem);
  assert.deepEqual(artifact.proposal.requirements[0], {
    id: "SHALL-001",
    modality: "shall",
    condition: "The candidate shall sustain the accepted workload.",
    verification: "Replay and reconcile OBS-WORKLOAD-2026-05.",
  });
  assert.equal(artifact.proposal.currentState.baseline.reference, "OBS-ARCH-004 rev 7, accepted May 18, 2026 by SRE");
  assert.equal(artifact.proposal.acceptanceConditions[0].evidenceMethod, "the requirement compliance matrix");
  assert.equal(artifact.proposal.authority, "No authority granted");
  assert.equal(artifact.proposal.sponsor.accepted, false);
  assert.equal(artifact.proposal.sponsor.assertedAccepted, true);
  assert.ok(artifact.reviews.length > 1);
  assert.equal(
    artifact.candidateDelivery.records[0].ownerEntity,
    "group:default/sre"
  );
  assert.ok(
    artifact.candidateDelivery.records[0].affectedEntities.includes(
      "system:default/metrics-alerting-platform"
    )
  );
  assert.equal(
    Object.hasOwn(artifact.candidateDelivery.records[0], "projectKey"),
    false
  );
});

test("every fictional system has a stable Backstage catalog reference", () => {
  for (const system of Object.values(COMPANY.systems)) {
    assert.match(system.entityRef, /^system:default\/[a-z0-9-]+$/);
  }
});

test("publishable scenarios have distinct proposal identities", () => {
  const identities = Object.values(SCENARIOS)
    .filter((scenario) => scenario.proposalId)
    .map(
      (scenario) => `${scenario.proposalId}:rev-${scenario.proposalRevision}`
    );
  assert.equal(new Set(identities).size, identities.length);
});

test("SSO migration keeps discovery, dependency routing, and Initiative hierarchy distinct", () => {
  const result = evaluate(structuredClone(SCENARIOS["SSO migration"]));

  assert.equal(result.disposition.key, "proposal");
  assert.equal(result.workStructure.type, "Initiative candidate");
  assert.equal(result.workStructure.epics.length, 5);
  assert.equal(result.workStructure.discoveryPackage.type, "Discovery Work Package");
  assert.ok(result.graph.teamIds.includes("identity"));
  assert.ok(result.graph.teamIds.includes("neteng"));
  assert.ok(result.graph.teamIds.includes("platform"));
});

test("identity redesign routes the complete catalog dependency closure without inventing delivery authority", () => {
  const result = evaluate(
    structuredClone(SCENARIOS["Identity platform redesign"])
  );

  assert.equal(result.disposition.key, "proposal");
  assert.equal(result.workStructure.type, "Epic candidate");
  assert.equal(result.workStructure.discoveryPackage.type, "Discovery Work Package");
  assert.deepEqual(result.graph.teamIds, [
    "identity",
    "appeng",
    "platform",
    "dataeng",
    "syseng",
    "neteng",
    "sre",
    "dcops",
  ]);
  assert.equal(result.proposalRecord.authority, "No authority granted");
});

for (const [scenarioName, expectedRevision] of [
  ["SSO migration", 2],
  ["Identity platform redesign", 2],
]) {
  test(`${scenarioName} supplies complete structured evidence for publication`, () => {
    const state = structuredClone(SCENARIOS[scenarioName]);
    const answers = collectAnswers(formDefinition, { ...state, ...state.guided });

    assert.deepEqual(validateAnswers(formDefinition, answers), []);

    const artifact = publicationArtifact(compileState(state));
    assert.equal(artifact.proposal.revision, expectedRevision);
    assert.equal(artifact.proposal.problem.statement.length > 0, true);
    assert.equal(artifact.proposal.problem.benefit.length > 0, true);
    assert.equal(artifact.proposal.desiredOutcome.scope.length > 0, true);
    assert.equal(artifact.proposal.requirements.every((requirement) => requirement.verification.length > 0), true);
  });
}

test("draft demand cannot be published as a Work Proposal", () => {
  assert.throws(
    () => publicationArtifact(blankState()),
    /requires a complete Work Proposal draft/
  );
});

test("guided intake does not treat a legacy paragraph as complete atomic evidence", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
  state.problem = { statement: "", benefit: "" };
  state.guided = {
    enforce: true,
    currentState: {},
    outcome: {},
    difference: {},
    requirements: [{ id: "001", force: "shall", condition: "A result exists.", verification: "" }],
    acceptance: [],
    nonGoals: [],
    timing: {},
    dependencies: [],
    preconditions: [],
    artifact: {},
    downstream: {},
    discovery: { phases: [] },
  };

  const result = evaluate(state);

  assert.equal(result.disposition.key, "draft");
  assert.ok(result.proposalMissing.includes("Problem Statement"));
  assert.ok(
    result.proposalMissing.includes("Benefit of Solving the Problem")
  );
  assert.ok(result.proposalMissing.includes("Current State: architecture and operating path"));
  assert.ok(result.proposalMissing.includes("Requirement 1: verification method"));
  assert.ok(result.framingMissing.includes("reusable artifact: acceptance proof"));
});
