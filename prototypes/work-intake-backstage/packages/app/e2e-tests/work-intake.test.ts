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
    intakeFrame.getByText('THROWAWAY PROTOTYPE · NO TICKETS ARE CREATED'),
  ).toBeVisible();
  await expect(
    intakeFrame.getByRole('button', { name: 'Metrics selection' }),
  ).toBeVisible();
});
