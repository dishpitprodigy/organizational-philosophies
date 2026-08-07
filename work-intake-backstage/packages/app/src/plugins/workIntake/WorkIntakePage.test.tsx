import { fireEvent, render, screen } from '@testing-library/react';

const mockFetch = jest.fn();
const mockRequestCurrentArtifact = jest.fn();
const mockFetchApi = { fetch: mockFetch };
const mockDiscoveryApi = {
  getBaseUrl: jest
    .fn()
    .mockResolvedValue('http://localhost:7007/api/work-intake-jira'),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: (apiRef: unknown) => {
    const actual = jest.requireActual('@backstage/core-plugin-api');
    return apiRef === actual.discoveryApiRef ? mockDiscoveryApi : mockFetchApi;
  },
}));
jest.mock('./artifactBridge', () => ({
  requestCurrentArtifact: (...args: unknown[]) =>
    mockRequestCurrentArtifact(...args),
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
    mockRequestCurrentArtifact.mockResolvedValue({
      schemaVersion: 1,
      proposal: { id: 'WP-2026-0042' },
      routingRequest: {
        affectedEntities: ['system:default/metrics-alerting-platform'],
      },
    });
    mockFetch.mockImplementation((url: string) => {
      if (url.endsWith('/health')) {
        return jsonResponse({
          connected: true,
          account: { displayName: 'Jon Wroblewski' },
          siteUrl: 'https://northstar.atlassian.net',
          projectKeys: ['NWI'],
        });
      }
      return jsonResponse({
        applied: true,
        issues: [{ localId: 'proposal', issueKey: 'NWI-1', action: 'reused' }],
      });
    });
  });

  it('embeds the existing work-intake prototype and reports Jira health', async () => {
    render(<WorkIntakePage />);

    expect(screen.getByTitle('Northstar Work Intake')).toHaveAttribute(
      'src',
      'work-intake-assets/index.html',
    );
    expect(
      await screen.findByText('Jira connected as Jon Wroblewski'),
    ).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/work-intake-jira/health',
    );
  });

  it('requests the current iframe artifact and publishes it through Backstage', async () => {
    render(<WorkIntakePage />);
    await screen.findByText('Jira connected as Jon Wroblewski');

    fireEvent.click(screen.getByRole('button', { name: 'Publish to Jira' }));

    expect(await screen.findByText('Published NWI-1')).toBeInTheDocument();
    expect(mockRequestCurrentArtifact).toHaveBeenCalledWith(
      screen.getByTitle('Northstar Work Intake'),
    );
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://localhost:7007/api/work-intake-jira/publish',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
