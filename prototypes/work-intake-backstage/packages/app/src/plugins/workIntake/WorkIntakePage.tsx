import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Paper, Typography } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { requestCurrentArtifact } from './artifactBridge';

type JiraHealth = {
  connected: boolean;
  account?: { displayName?: string };
  error?: string;
};

type PublicationResponse = {
  issues?: Array<{ issueKey: string }>;
  error?: string;
};

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

export function WorkIntakePage() {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const iframe = useRef<HTMLIFrameElement>(null);
  const [backendUrl, setBackendUrl] = useState('');
  const [health, setHealth] = useState<JiraHealth | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    discoveryApi
      .getBaseUrl('work-intake-jira')
      .then(baseUrl => {
        if (active) setBackendUrl(baseUrl);
        return fetchApi.fetch(`${baseUrl}/health`);
      })
      .then(responseJson<JiraHealth>)
      .then(value => {
        if (active) setHealth(value);
      })
      .catch(cause => {
        if (active) {
          setHealth({
            connected: false,
            error: cause instanceof Error ? cause.message : String(cause),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [discoveryApi, fetchApi]);

  async function publish() {
    if (!iframe.current) return;
    setPublishing(true);
    setResult('');
    setError('');
    try {
      const artifact = await requestCurrentArtifact(iframe.current);
      if (!backendUrl) throw new Error('Jira publisher is not ready');
      const response = await fetchApi.fetch(`${backendUrl}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifact),
      });
      const publication = await responseJson<PublicationResponse>(response);
      const issueKeys = publication.issues?.map(issue => issue.issueKey) ?? [];
      setResult(
        issueKeys.length
          ? `Published ${issueKeys.join(', ')}`
          : 'Publication completed without delivery records.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPublishing(false);
    }
  }

  const connected = health?.connected === true;
  let connectionText = 'Checking Jira connection…';
  if (connected) {
    connectionText = `Jira connected as ${
      health.account?.displayName ?? 'configured account'
    }`;
  } else if (health) {
    connectionText = `Jira unavailable: ${health.error ?? 'connection failed'}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Paper
        square
        elevation={2}
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: 16,
          padding: '12px 20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ flex: 1 }}>
          <Typography variant="subtitle1">Jira publication boundary</Typography>
          <Typography
            color={connected ? 'textSecondary' : 'error'}
            variant="body2"
          >
            {connectionText}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            Publication re-derives dependencies, owners, and ordered reviews
            from the Backstage catalog.
          </Typography>
          {result ? <Typography variant="body2">{result}</Typography> : null}
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </div>
        <button
          disabled={!connected || !backendUrl || publishing}
          onClick={publish}
          style={{
            background: connected ? '#00695c' : '#9e9e9e',
            border: 0,
            borderRadius: 4,
            color: 'white',
            cursor: connected ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 700,
            padding: '10px 18px',
          }}
          type="button"
        >
          {publishing ? 'Publishing…' : 'Publish to Jira'}
        </button>
      </Paper>
      <iframe
        ref={iframe}
        title="Northstar Work Intake"
        src="work-intake-assets/index.html"
        style={{
          border: 0,
          display: 'block',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      />
    </div>
  );
}
