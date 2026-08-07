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
      { type: 'northstar:work-intake:artifact-request', requestId },
      window.location.origin,
    );
  });
}
