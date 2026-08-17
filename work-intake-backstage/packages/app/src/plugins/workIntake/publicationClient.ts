export type PublicationProfile = {
  id: string;
  displayName: string;
  available: boolean;
  unavailableReason?: string;
};

export type PublicationReceipt = {
  profileId: string;
  results: Array<{
    externalId: string;
    externalKey?: string;
    url?: string;
  }>;
  partial: boolean;
  retryable: boolean;
};

export type SavedProposalChange = {
  proposalId: string;
  revision: number;
  intakeRoute: 'assisted-intake' | 'proposal-development';
  missingEvidence: Array<{ id: string; label: string }>;
};

type Fetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

async function responseJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(
      body.error ?? `Request failed with status ${response.status}`,
    );
  }
  return body;
}

export class PublicationClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetch: Fetch,
  ) {}

  profiles(): Promise<PublicationProfile[]> {
    return this.fetch(`${this.baseUrl}/profiles`).then(response =>
      responseJson<PublicationProfile[]>(response),
    );
  }

  publish(profileId: string, artifact: unknown): Promise<PublicationReceipt> {
    return this.fetch(`${this.baseUrl}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, artifact }),
    }).then(response => responseJson<PublicationReceipt>(response));
  }

  saveProposal(record: {
    proposalId?: string;
    artifact: Record<string, unknown>;
    reviewableArtifact?: Record<string, unknown>;
    missingEvidence: Array<{ id: string; label: string }>;
    changeReason: string;
  }): Promise<SavedProposalChange> {
    return this.fetch(`${this.baseUrl}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).then(response => responseJson<SavedProposalChange>(response));
  }
}
