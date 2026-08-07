export function bindSubmissionProvenance(
  body: Record<string, any>,
  authenticatedActor: string,
  submittedAt = new Date(),
) {
  if (body.schemaVersion !== 2) return body;
  return {
    ...body,
    submission: {
      ...(body.submission ?? {}),
      authenticatedActor,
      submittedAt: submittedAt.toISOString(),
    },
  };
}
