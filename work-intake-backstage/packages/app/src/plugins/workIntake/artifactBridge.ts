export function requestCurrentArtifact(
  iframe: HTMLIFrameElement,
): Promise<unknown> {
  const requestId = `publish-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', receiveArtifact);
      reject(new Error('The work-intake form did not return an artifact.'));
    }, 5_000);

    function receiveArtifact(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      if (event.data?.type !== 'northstar:work-intake:artifact-response')
        return;
      if (event.data.requestId !== requestId) return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', receiveArtifact);
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.artifact);
    }

    window.addEventListener('message', receiveArtifact);
    iframe.contentWindow?.postMessage(
      {
        type: 'northstar:work-intake:artifact-request',
        requestId,
        advanceSavedRevision: true,
      },
      window.location.origin,
    );
  });
}

export type IntakeRecord = {
  proposalId?: string;
  artifact: Record<string, unknown>;
  reviewableArtifact?: Record<string, unknown>;
  missingEvidence: Array<{ id: string; label: string }>;
  changeReason: string;
};

export function requestCurrentIntakeRecord(
  iframe: HTMLIFrameElement,
): Promise<IntakeRecord> {
  const requestId = `save-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', receiveRecord);
      reject(new Error('The work-intake form did not return its record.'));
    }, 5_000);

    function receiveRecord(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      if (event.data?.type !== 'northstar:work-intake:record-response') return;
      if (event.data.requestId !== requestId) return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', receiveRecord);
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.record);
    }

    window.addEventListener('message', receiveRecord);
    iframe.contentWindow?.postMessage(
      { type: 'northstar:work-intake:record-request', requestId },
      window.location.origin,
    );
  });
}

export function applyProposalIdentity(
  iframe: HTMLIFrameElement,
  proposalId: string,
  revision: number,
) {
  iframe.contentWindow?.postMessage(
    {
      type: 'northstar:work-intake:proposal-identity',
      proposalId,
      revision,
    },
    window.location.origin,
  );
}
