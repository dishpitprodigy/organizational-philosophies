import { requestCurrentArtifact } from './artifactBridge';

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
