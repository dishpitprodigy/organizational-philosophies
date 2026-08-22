import { expect, test } from '@playwright/test';

test('Work Intake opens inside the Backstage shell', async ({ page }) => {
  await page.goto('/work-intake');

  const enterButton = page.getByRole('button', { name: 'Enter' });
  await expect(enterButton).toBeVisible();
  await enterButton.click();

  const nav = page.getByRole('navigation', { name: 'sidebar nav' });
  await expect(
    nav.getByRole('link', { name: 'Work Intake', exact: true }),
  ).toBeVisible();

  const intakeFrame = page.frameLocator(
    'iframe[title="Northstar Work Intake"]',
  );
  await expect(
    intakeFrame.getByText(
      'THROWAWAY PROTOTYPE · ONLY EXPLICIT BACKSTAGE PUBLICATION CREATES INTAKE RECORDS',
    ),
  ).toBeVisible();
  await expect(
    intakeFrame.getByRole('button', { name: 'Metrics selection' }),
  ).toBeVisible();
});

test('versioned form fields produce an atomic publication artifact', async ({
  page,
}) => {
  await page.goto('/work-intake');
  await page.getByRole('button', { name: 'Enter' }).click();

  const intakeFrame = page.frameLocator(
    'iframe[title="Northstar Work Intake"]',
  );
  await intakeFrame.getByRole('button', { name: 'Metrics selection' }).click();
  const formFrame = page
    .frames()
    .find(frame => frame.url().includes('/work-intake-assets/'));
  if (!formFrame) throw new Error('The Work Intake iframe is unavailable.');
  await formFrame.evaluate(() =>
    document.querySelector<HTMLButtonElement>('#next-variant')?.click(),
  );

  const baseline = intakeFrame.locator(
    '[data-form-field-id="proposal.current-state.baseline-reference"]',
  );
  await expect(baseline).toHaveValue(/OBS-ARCH-004 rev 7/);
  await expect(
    intakeFrame.locator('[data-form-field-id="proposal.problem.statement"]'),
  ).toHaveValue(/cannot remain supported at the forecast workload/);
  await expect(
    intakeFrame.locator('[data-form-field-id="proposal.problem.benefit"]'),
  ).toHaveValue(/preserves reliable dashboards and alerts/);
  await expect(
    intakeFrame.locator(
      '[data-form-field-id="proposal.feasibility-bases"][data-guided-key="evidence"]',
    ).first(),
  ).toHaveValue(/OBS-REPLAY-017/);

  const artifact = await page.evaluate(
    () =>
      new Promise<Record<string, any>>((resolve, reject) => {
        const requestId = 'e2e-atomic-artifact';
        const timeout = window.setTimeout(
          () => reject(new Error('The form did not return an artifact.')),
          5_000,
        );
        window.addEventListener(
          'message',
          event => {
            if (
              event.data?.type !== 'northstar:work-intake:artifact-response' ||
              event.data?.requestId !== requestId
            ) {
              return;
            }
            window.clearTimeout(timeout);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve(event.data.artifact);
          },
          { once: true },
        );
        const iframe = document.querySelector<HTMLIFrameElement>(
          'iframe[title="Northstar Work Intake"]',
        );
        if (!iframe?.contentWindow) {
          reject(new Error('The Work Intake iframe is unavailable.'));
          return;
        }
        iframe.contentWindow.postMessage(
          { type: 'northstar:work-intake:artifact-request', requestId },
          window.location.origin,
        );
      }),
  );

  expect(artifact.schemaVersion).toBe(2);
  expect(artifact.form).toEqual({
    id: 'technical-work-proposal',
    version: 1,
  });
  expect(artifact.answers['proposal.current-state.baseline-reference']).toMatch(
    /OBS-ARCH-004 rev 7/,
  );
  expect(artifact.proposal.problem).toEqual({
    statement: expect.stringContaining(
      'cannot remain supported at the forecast workload',
    ),
    benefit: expect.stringContaining('preserves reliable dashboards and alerts'),
  });
  expect(artifact.proposal.feasibilityBasis.assessments[0]).toEqual(
    expect.objectContaining({
      finding: 'unproven',
      hardLimits: expect.stringContaining('nonzero time'),
      evidence: expect.stringContaining('OBS-REPLAY-017'),
    }),
  );
  expect(artifact.proposal.requirements[0]).toEqual(
    expect.objectContaining({
      id: 'WILL-01',
      modality: 'will',
      verification: expect.any(String),
    }),
  );
});

test('publishes the unverified Metrics draft index to Jira idempotently', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/work-intake');
  await page.getByRole('button', { name: 'Enter' }).click();

  await expect(
    page.getByText('Jira connected as Jon Wroblewski'),
  ).toBeVisible();

  const intakeFrame = page.frameLocator(
    'iframe[title="Northstar Work Intake"]',
  );
  await intakeFrame.getByRole('button', { name: 'Metrics selection' }).click();

  await page.getByRole('button', { name: 'Publish to Jira' }).click();
  const publication = page.getByText(/^Published NWI-\d+$/);
  await expect(publication).toBeVisible({ timeout: 90_000 });
  const firstIssueList = await publication.textContent();
  expect(firstIssueList?.match(/NWI-\d+/g)?.length).toBe(1);

  await page.getByRole('button', { name: 'Publish to Jira' }).click();
  await expect(page.getByRole('button', { name: 'Publishing…' })).toBeVisible();
  await expect(publication).toHaveText(firstIssueList ?? '', {
    timeout: 90_000,
  });
});
