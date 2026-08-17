import {
  applyProposalIdentity,
  requestCurrentArtifact,
  requestCurrentIntakeRecord,
} from './artifactBridge';

describe('work-intake artifact bridge', () => {
  it('requests and resolves the matching iframe artifact', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const contentWindow = { postMessage: jest.fn() };
    const iframe = { contentWindow } as unknown as HTMLIFrameElement;

    const result = requestCurrentArtifact(iframe);
    expect(contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: 'northstar:work-intake:artifact-request',
        requestId: 'publish-123-8',
        advanceSavedRevision: true,
      },
      window.location.origin,
    );

    const response = new MessageEvent('message', {
      data: {
        type: 'northstar:work-intake:artifact-response',
        requestId: 'publish-123-8',
        artifact: { schemaVersion: 1 },
      },
    });
    Object.defineProperty(response, 'source', { value: contentWindow });
    window.dispatchEvent(response);

    await expect(result).resolves.toEqual({ schemaVersion: 1 });
  });

  it('requests an incomplete intake record and applies its durable identity', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(456);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const contentWindow = { postMessage: jest.fn() };
    const iframe = { contentWindow } as unknown as HTMLIFrameElement;
    const result = requestCurrentIntakeRecord(iframe);
    const record = {
      artifact: { title: 'Metrics lifecycle' },
      missingEvidence: [{ id: 'outcome', label: 'Desired outcome' }],
      changeReason: 'Initial demand capture',
    };
    const response = new MessageEvent('message', {
      data: {
        type: 'northstar:work-intake:record-response',
        requestId: 'save-456-8',
        record,
      },
    });
    Object.defineProperty(response, 'source', { value: contentWindow });
    window.dispatchEvent(response);

    await expect(result).resolves.toEqual(record);
    applyProposalIdentity(iframe, 'WP-2026-0045', 0);
    expect(contentWindow.postMessage).toHaveBeenLastCalledWith(
      {
        type: 'northstar:work-intake:proposal-identity',
        proposalId: 'WP-2026-0045',
        revision: 0,
      },
      window.location.origin,
    );
  });

  it('returns a framing error from the iframe', async () => {
    const contentWindow = { postMessage: jest.fn() };
    const iframe = { contentWindow } as unknown as HTMLIFrameElement;
    const result = requestCurrentArtifact(iframe);
    const request = contentWindow.postMessage.mock.calls[0][0];
    const response = new MessageEvent('message', {
      data: {
        type: 'northstar:work-intake:artifact-response',
        requestId: request.requestId,
        error: 'Work Proposal is incomplete.',
      },
    });
    Object.defineProperty(response, 'source', { value: contentWindow });
    window.dispatchEvent(response);

    await expect(result).rejects.toThrow('Work Proposal is incomplete.');
  });
});
