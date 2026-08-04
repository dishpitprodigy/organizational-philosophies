const assert = require("node:assert/strict");
const test = require("node:test");

const {
  COMPANY,
  SCENARIOS,
  blankState,
  evaluate,
  publicationArtifact,
} = require("./model.js");

test("Work Proposal identity is structural rather than parsed from display text", () => {
  const result = evaluate(structuredClone(SCENARIOS["Metrics selection"]));
  assert.deepEqual(
    {
      id: result.proposalRecord.id,
      revision: result.proposalRecord.revision,
      label: result.proposalRecord.label,
    },
    { id: "WP-2026-0042", revision: 2, label: "WP-2026-0042 rev 2" }
  );
});

test("publication artifact preserves intake authority boundaries", () => {
  const artifact = publicationArtifact(
    structuredClone(SCENARIOS["Metrics selection"])
  );

  assert.deepEqual(
    {
      schemaVersion: artifact.schemaVersion,
      id: artifact.proposal.id,
      revision: artifact.proposal.revision,
      state: artifact.proposal.state,
      authorized: artifact.candidateDelivery.authorized,
    },
    {
      schemaVersion: 1,
      id: "WP-2026-0042",
      revision: 2,
      state: "Work Proposal — Ready for Ordered Review",
      authorized: false,
    }
  );
  assert.match(
    artifact.proposal.authority,
    /ordered review|bounded discovery/i
  );
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

test("draft demand cannot be published as a Work Proposal", () => {
  assert.throws(
    () => publicationArtifact(blankState()),
    /requires a Work Proposal that is ready for ordered review/
  );
});
