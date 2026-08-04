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

test('publishes the Metrics selection proposal to Jira idempotently', async ({
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
  const publication = page.getByText(/^Published NWI-\d+(?:, NWI-\d+)+$/);
  await expect(publication).toBeVisible({ timeout: 90_000 });
  const firstIssueList = await publication.textContent();
  expect(firstIssueList?.match(/NWI-\d+/g)?.length).toBeGreaterThan(1);

  await page.getByRole('button', { name: 'Publish to Jira' }).click();
  await expect(page.getByRole('button', { name: 'Publishing…' })).toBeVisible();
  await expect(publication).toHaveText(firstIssueList ?? '', {
    timeout: 90_000,
  });
});
