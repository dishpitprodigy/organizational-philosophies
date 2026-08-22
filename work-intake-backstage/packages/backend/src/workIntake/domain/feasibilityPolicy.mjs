const FINDINGS = new Set([
  'demonstrated',
  'supported',
  'unproven',
  'contradicted',
]);

export function feasibilityPolicyIssues(proposal, routingFacts = {}) {
  const assessments = proposal?.feasibilityBasis?.assessments ?? [];
  const issues = [];
  const assessmentIds = assessments.map(assessment => assessment.id);
  if (new Set(assessmentIds).size !== assessmentIds.length) {
    issues.push('Feasibility Basis identifiers must be unique.');
  }

  const findings = assessments.map(assessment => assessment.finding);
  const unsupportedFinding = findings.find(finding => !FINDINGS.has(finding));
  if (unsupportedFinding) {
    issues.push(
      `Unsupported Feasibility Assessment finding: ${unsupportedFinding}.`,
    );
  }
  if (findings.includes('contradicted')) {
    issues.push(
      'A target contradicted by a hard limit cannot become reviewable.',
    );
  }
  if (
    findings.includes('unproven') &&
    !(
      routingFacts.intent === 'Discovery' &&
      proposal?.knownUncertainty?.present &&
      String(proposal.knownUncertainty.question || '').trim() &&
      String(proposal.knownUncertainty.discoveryTimebox || '').trim()
    )
  ) {
    issues.push('An unproven delivery target requires bounded Discovery.');
  }

  const requirements = proposal?.requirements ?? [];
  const acceptanceConditions = proposal?.acceptanceConditions ?? [];
  const resultIds = [
    ...requirements.map(requirement => requirement.id),
    ...acceptanceConditions.map(condition => condition.id),
  ];
  if (new Set(resultIds).size !== resultIds.length) {
    issues.push(
      'Requirement and Acceptance Condition identifiers must be unique across the Feasibility Basis coverage namespace.',
    );
  }

  const covered = new Set(
    assessments.flatMap(assessment => assessment.covers ?? []),
  );
  const requiredCoverage = [
    ...requirements
      .filter(requirement => requirement.modality !== 'will')
      .map(requirement => requirement.id),
    ...acceptanceConditions.map(condition => condition.id),
  ];
  const missingCoverage = requiredCoverage.filter(id => !covered.has(id));
  if (missingCoverage.length) {
    issues.push(
      `Feasibility Basis coverage is missing for: ${missingCoverage.join(', ')}.`,
    );
  }

  const knownCoverage = new Set(resultIds);
  const unknownCoverage = [...covered].filter(id => !knownCoverage.has(id));
  if (unknownCoverage.length) {
    issues.push(
      `Feasibility Basis references unknown evidence IDs: ${unknownCoverage.join(
        ', ',
      )}.`,
    );
  }
  return issues;
}
