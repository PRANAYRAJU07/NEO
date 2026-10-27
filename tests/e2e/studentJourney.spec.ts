import { test, expect } from '@playwright/test';

test.describe('NEO: Student Prevention Journeys', () => {
  test('Complete journey via Continue Without Photo / Demo Avatar', async ({ page }) => {
    // 1. Welcome screen
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /NEO – Face the Future/i })).toBeVisible();
    await expect(page.getByText('ICE — NOT EVEN ONCE').first()).toBeVisible();
    await expect(page.getByText('CHOOSE LIFE SO THAT YOU MAY LIVE').first()).toBeVisible();

    // 2. Click Start -> Consent
    await page.getByRole('button', { name: 'Start Prevention Experience' }).click();
    await expect(page).toHaveURL(/.*consent/);
    await expect(page.getByText('Privacy Notice & Informed Choice')).toBeVisible();

    // 3. Continue Without Photo
    await page.getByRole('button', { name: 'Continue Without Photo' }).click();
    await expect(page).toHaveURL(/.*selfie/);

    // 4. Select Demo Avatar
    await page.getByRole('button', { name: /Alex/i }).click();
    await expect(page.getByText('Photo Ready for Local Exploration')).toBeVisible();

    // 5. Explore "My Future with Ice"
    await page.getByRole('button', { name: /Explore.*My Future with Ice/i }).click();
    await expect(page).toHaveURL(/.*future-ice/);
    await expect(page.getByText('My Future with Ice (Simulated)')).toBeVisible();

    // Switch to Stage 2
    await page.getByRole('button', { name: /Stage 2/i }).click();
    await expect(page.getByText('Vascular Strain & Facial Hollows')).toBeVisible();

    // 6. Compare Before & After
    await page.getByRole('button', { name: 'Compare Before & After' }).click();
    await expect(page).toHaveURL(/.*compare/);
    await expect(page.getByRole('slider', { name: 'Before and after comparison slider' })).toBeVisible();

    // 7. Switch to Healthy Future
    await page.getByRole('button', { name: 'My Healthy Future' }).click();
    await expect(page.getByText('My Healthy Future (Vitality)', { exact: true })).toBeVisible();

    // 8. Visit Get Help Today
    await page.getByRole('link', { name: 'Get Help Today' }).first().click();
    await expect(page).toHaveURL(/.*help/);
    await expect(page.getByRole('link', { name: /Call 1300 424 238/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Call 1800 250 015/i })).toBeVisible();

    // 9. Reset Experience
    await page.getByRole('button', { name: 'Reset' }).first().click();
    await page.getByRole('button', { name: 'Yes, Reset & Clear' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('Select, preview, and remove avatar / photo reset flow', async ({ page }) => {
    await page.goto('/selfie?mode=sample');
    await page.getByRole('button', { name: /Sam/i }).click();
    await expect(page.getByText('Photo Ready for Local Exploration')).toBeVisible();

    // Remove photo
    await page.getByRole('button', { name: 'Remove photo' }).click();
    await expect(page.getByText('Select or Capture Your Photo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload Photo' })).toBeVisible();
  });

  test('Camera capture modal opens and cancels gracefully', async ({ page }) => {
    await page.goto('/selfie');
    await page.getByRole('button', { name: 'Take Selfie' }).click();

    // Verify modal is displayed
    await expect(page.getByRole('heading', { name: 'Take Selfie' })).toBeVisible();

    // Cancel modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Take Selfie' })).not.toBeVisible();
  });

  test('Consent screen enforces validation before photo selection', async ({ page }) => {
    await page.goto('/consent');
    const proceedBtn = page.getByRole('button', { name: 'Proceed to Photo Selection' });
    await expect(proceedBtn).toBeDisabled();

    // Check all three boxes
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.nth(0).click();
    await expect(proceedBtn).toBeDisabled();
    await checkboxes.nth(1).click();
    await expect(proceedBtn).toBeDisabled();
    await checkboxes.nth(2).click();

    await expect(proceedBtn).toBeEnabled();
    await proceedBtn.click();
    await expect(page).toHaveURL(/.*selfie/);
  });
});
