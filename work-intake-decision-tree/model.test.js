const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");

const { collectAnswers, compileAnswers } = require("./form-definition.js");

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
    { id: "WP-2026-0042", revision: 4, label: "WP-2026-0042 rev 4" }
  );
});

test("the Metrics fixture content and artifact schema are governed by revision 4", () => {
  const fixture = SCENARIOS["Metrics selection"];
  const fingerprint = createHash("sha256").update(JSON.stringify(fixture)).digest("hex");

  assert.deepEqual(
    {
      artifactSchemaVersion: PUBLICATION_ARTIFACT_SCHEMA_VERSION,
      proposalRevision: fixture.proposalRevision,
      fixtureSha256: fingerprint,
    },
    {
      artifactSchemaVersion: 2,
      proposalRevision: 4,
      fixtureSha256: "a477bb4a57646aed3817205f6829a09e2647b1c807ae44df3e325efd89937450",
    }
  );
});

test("a user explicitly creates the next Work Proposal revision", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);

  const revision = beginNewRevision(state);

  assert.equal(revision, 5);
  assert.equal(state.proposalRevision, 5);
  assert.equal(state.scenario, "Custom");
});

test("editing a Work Proposal does not silently consume a revision", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
  state.guided = { enforce: false };

  markProposalEdited(state);

  assert.equal(state.proposalRevision, 4);
  assert.equal(state.scenario, "Custom");
  assert.equal(state.guided.enforce, true);
});

test("publication artifact preserves intake authority boundaries", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
  state.form = { id: "technical-work-proposal", version: 1 };
  state.guided = {
    version: 1,
    enforce: false,
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
      revision: 4,
      state: "Draft Work Proposal — sponsor acceptance unverified",
      authorized: false,
    }
  );
  assert.deepEqual(artifact.form, { id: "technical-work-proposal", version: 1 });
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

test("draft demand cannot be published as a Work Proposal", () => {
  assert.throws(
    () => publicationArtifact(blankState()),
    /requires a complete Work Proposal draft/
  );
});

test("guided intake does not treat a legacy paragraph as complete atomic evidence", () => {
  const state = structuredClone(SCENARIOS["Metrics selection"]);
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
  assert.ok(result.proposalMissing.includes("Current State: architecture and operating path"));
  assert.ok(result.proposalMissing.includes("Requirement 1: verification method"));
  assert.ok(result.framingMissing.includes("reusable artifact: acceptance proof"));
});
