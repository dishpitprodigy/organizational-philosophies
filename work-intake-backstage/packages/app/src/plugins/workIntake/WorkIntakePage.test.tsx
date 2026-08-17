import { fireEvent, render, screen } from '@testing-library/react';

const mockFetch = jest.fn();
const mockRequestCurrentArtifact = jest.fn();
const mockRequestCurrentIntakeRecord = jest.fn();
const mockApplyProposalIdentity = jest.fn();
const mockFetchApi = { fetch: mockFetch };
const mockDiscoveryApi = {
  getBaseUrl: jest
    .fn()
    .mockResolvedValue('http://localhost:7007/api/work-intake-publication'),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: (apiRef: unknown) => {
    const actual = jest.requireActual('@backstage/core-plugin-api');
    return apiRef === actual.discoveryApiRef ? mockDiscoveryApi : mockFetchApi;
  },
}));
jest.mock('./artifactBridge', () => ({
  applyProposalIdentity: (...args: unknown[]) =>
    mockApplyProposalIdentity(...args),
  requestCurrentArtifact: (...args: unknown[]) =>
    mockRequestCurrentArtifact(...args),
  requestCurrentIntakeRecord: (...args: unknown[]) =>
    mockRequestCurrentIntakeRecord(...args),
}));

import { WorkIntakePage } from './WorkIntakePage';

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('WorkIntakePage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockRequestCurrentArtifact.mockReset();
    mockRequestCurrentIntakeRecord.mockReset();
    mockApplyProposalIdentity.mockReset();
    mockRequestCurrentArtifact.mockResolvedValue({
      schemaVersion: 1,
      proposal: { id: 'WP-2026-0042' },
    });
    mockRequestCurrentIntakeRecord.mockResolvedValue({
      artifact: { title: 'Metrics lifecycle' },
      missingEvidence: [
        { id: 'desired-outcome', label: 'Desired operating outcome' },
      ],
      changeReason: 'Initial demand capture',
    });
    mockFetch.mockImplementation((url: string) => {
      if (url.endsWith('/profiles')) {
        return jsonResponse([
          {
            id: 'jira-work-management',
            displayName: 'Jira Work Management',
            available: true,
          },
          {
            id: 'atlassian-discovery',
            displayName: 'Atlassian Discovery',
            available: false,
            unavailableReason: 'Publication target is unavailable.',
          },
        ]);
      }
      if (url.endsWith('/proposals')) {
        return jsonResponse({
          proposalId: 'WP-2026-0045',
          revision: 0,
          intakeRoute: 'assisted-intake',
          missingEvidence: [
            { id: 'desired-outcome', label: 'Desired operating outcome' },
          ],
        });
      }
      return jsonResponse({
        profileId: 'jira-work-management',
        proposal: { id: 'WP-2026-0042', revision: 4 },
        artifact: {
          sha256: '0'.repeat(64),
          locator: 'publication:WP-2026-0042',
          filename: 'artifact.json',
        },
        results: [
          {
            placementId: 'proposal',
            adapterId: 'destination-a',
            targetId: 'target-a',
            localId: 'proposal',
            externalId: 'record-1',
            url: 'https://example.test/record-1',
            action: 'created',
            canonicalArtifactSha256: '0'.repeat(64),
          },
        ],
        relations: [],
        notes: [],
        partial: false,
        retryable: false,
      });
    });
  });

  it('embeds the existing work-intake prototype and loads publication profiles', async () => {
    render(<WorkIntakePage />);

    expect(screen.getByTitle('Northstar Work Intake')).toHaveAttribute(
      'src',
      'work-intake-assets/index.html',
    );
    expect(await screen.findByText('Jira Work Management')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Atlassian Discovery (unavailable)' }),
    ).toBeDisabled();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/work-intake-publication/profiles',
    );
  });

  it('publishes the iframe artifact through the selected available profile and renders receipt links', async () => {
    render(<WorkIntakePage />);
    await screen.findByText('Jira Work Management');

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(
      await screen.findByText('Publication completed.'),
    ).toBeInTheDocument();
    expect(mockRequestCurrentArtifact).toHaveBeenCalledWith(
      screen.getByTitle('Northstar Work Intake'),
    );
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://localhost:7007/api/work-intake-publication/publish',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"profileId":"jira-work-management"'),
      }),
    );
    expect(screen.getByRole('link', { name: 'record-1' })).toHaveAttribute(
      'href',
      'https://example.test/record-1',
    );
  });

  it('saves incomplete intake, reports Assisted Intake, and returns the durable identity to the form', async () => {
    render(<WorkIntakePage />);
    await screen.findByText('Jira Work Management');

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(
        'WP-2026-0045 rev 0 saved and routed to Assisted Intake.',
      ),
    ).toBeInTheDocument();
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://localhost:7007/api/work-intake-publication/proposals',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Initial demand capture'),
      }),
    );
    expect(mockApplyProposalIdentity).toHaveBeenCalledWith(
      screen.getByTitle('Northstar Work Intake'),
      'WP-2026-0045',
      0,
    );
  });
});
