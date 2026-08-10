export const publicationErrorKinds = [
  'InvalidArtifact',
  'CatalogRoutingFailure',
  'AuthorityViolation',
  'CapacityNotAccepted',
  'ProfileNotAllowed',
  'TargetConfigurationError',
  'TargetAuthenticationError',
  'TargetUnavailable',
  'RevisionRequired',
  'ConcurrentPublication',
  'IndeterminatePublication',
  'PartialPublication',
] as const;

export type PublicationErrorKind = (typeof publicationErrorKinds)[number];

export class PublicationError extends Error {
  constructor(
    readonly kind: PublicationErrorKind,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = 'PublicationError';
  }
}

export function publicationError(
  kind: PublicationErrorKind,
  message: string,
  details?: Readonly<Record<string, unknown>>,
) {
  return new PublicationError(kind, message, details);
}
