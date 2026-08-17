import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Paper, Typography } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import {
  applyProposalIdentity,
  requestCurrentArtifact,
  requestCurrentIntakeRecord,
} from './artifactBridge';
import {
  PublicationClient,
  PublicationProfile,
  PublicationReceipt,
} from './publicationClient';

const publicationPluginId = 'work-intake-publication';

export function WorkIntakePage() {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const iframe = useRef<HTMLIFrameElement>(null);
  const [profiles, setProfiles] = useState<PublicationProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [receipt, setReceipt] = useState<PublicationReceipt | null>(null);
  const [error, setError] = useState('');
  const selectedProfile = profiles.find(
    profile => profile.id === selectedProfileId,
  );

  useEffect(() => {
    let active = true;
    discoveryApi
      .getBaseUrl(publicationPluginId)
      .then(baseUrl =>
        new PublicationClient(baseUrl, fetchApi.fetch).profiles(),
      )
      .then(value => {
        if (!active) return;
        setProfiles(value);
        setSelectedProfileId(
          value.find(profile => profile.available)?.id ?? '',
        );
      })
      .catch(cause => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [discoveryApi, fetchApi]);

  async function publish() {
    if (!iframe.current || !selectedProfile?.available) return;
    setPublishing(true);
    setReceipt(null);
    setError('');
    try {
      const [baseUrl, artifact] = await Promise.all([
        discoveryApi.getBaseUrl(publicationPluginId),
        requestCurrentArtifact(iframe.current),
      ]);
      const result = await new PublicationClient(
        baseUrl,
        fetchApi.fetch,
      ).publish(selectedProfile.id, artifact);
      setReceipt(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPublishing(false);
    }
  }

  async function save() {
    if (!iframe.current) return;
    setSaving(true);
    setSaveMessage('');
    setError('');
    try {
      const [baseUrl, record] = await Promise.all([
        discoveryApi.getBaseUrl(publicationPluginId),
        requestCurrentIntakeRecord(iframe.current),
      ]);
      const saved = await new PublicationClient(
        baseUrl,
        fetchApi.fetch,
      ).saveProposal(record);
      applyProposalIdentity(iframe.current, saved.proposalId, saved.revision);
      setSaveMessage(
        `${saved.proposalId} rev ${saved.revision} saved${
          saved.intakeRoute === 'assisted-intake'
            ? ' and routed to Assisted Intake'
            : ''
        }.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
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
          <Typography variant="subtitle1">Publication</Typography>
          {loading ? (
            <Typography color="textSecondary" variant="body2">
              Loading publication profiles…
            </Typography>
          ) : null}
          {profiles.length ? (
            <label>
              <Typography component="span" variant="body2">
                Publication profile
              </Typography>
              <select
                aria-label="Publication profile"
                onChange={event => setSelectedProfileId(event.target.value)}
                value={selectedProfileId}
              >
                {profiles.map(profile => (
                  <option
                    disabled={!profile.available}
                    key={profile.id}
                    value={profile.id}
                  >
                    {profile.displayName}
                    {profile.available ? '' : ' (unavailable)'}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {selectedProfile && !selectedProfile.available ? (
            <Typography color="error" variant="body2">
              {selectedProfile.unavailableReason ??
                'This profile is unavailable.'}
            </Typography>
          ) : null}
          {receipt ? (
            <>
              <Typography variant="body2">Publication completed.</Typography>
              {receipt.results.map(result =>
                result.url ? (
                  <Typography
                    component="span"
                    key={`${result.externalId}-${result.url}`}
                    variant="body2"
                  >
                    <a href={result.url}>
                      {result.externalKey ?? result.externalId}
                    </a>{' '}
                  </Typography>
                ) : (
                  <Typography
                    component="span"
                    key={result.externalId}
                    variant="body2"
                  >
                    {result.externalKey ?? result.externalId}{' '}
                  </Typography>
                ),
              )}
            </>
          ) : null}
          {saveMessage ? (
            <Typography variant="body2">{saveMessage}</Typography>
          ) : null}
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </div>
        <button disabled={saving || publishing} onClick={save} type="button">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          disabled={!selectedProfile?.available || publishing || saving}
          onClick={publish}
          style={{
            background: selectedProfile?.available ? '#00695c' : '#9e9e9e',
            border: 0,
            borderRadius: 4,
            color: 'white',
            cursor: selectedProfile?.available ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 700,
            padding: '10px 18px',
          }}
          type="button"
        >
          {publishing ? 'Publishing…' : 'Publish'}
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
