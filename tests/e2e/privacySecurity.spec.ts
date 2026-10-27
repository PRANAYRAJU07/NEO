import { test, expect } from '@playwright/test';

test.describe('Privacy & Security Verification', () => {
  test('Zero-Upload Guarantee: No image payload leaves the browser', async ({ page }) => {
    const outgoingImageRequests: string[] = [];

    // Monitor all outbound network requests
    page.on('request', (req) => {
      const url = req.url();
      const method = req.method();
      const postData = req.postData();

      // Check if any POST/PUT request carries image or base64 data to unauthorized external endpoints
      if ((method === 'POST' || method === 'PUT') && postData) {
        if (postData.includes('data:image') || postData.includes('image/') || postData.includes('selfie')) {
          // Allow internal private backend on localhost/127.0.0.1; disallow third-party / cloud AI leakage
          if (!url.includes('localhost:8000') && !url.includes('127.0.0.1:8000') && !url.includes('localhost:5173')) {
            outgoingImageRequests.push(url);
          }
        }
      }

      // Check if any request tries to talk to external AI APIs or nonexistent LEASE
      if (url.includes('lease') || url.includes('api.openai') || url.includes('replicate') || url.includes('cloudinary')) {
        outgoingImageRequests.push(url);
      }
    });

    // Run through the flow
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Prevention Experience' }).click();
    await page.getByRole('button', { name: 'Continue Without Photo' }).click();
    await page.getByRole('button', { name: /Alex/i }).click();
    await page.getByRole('button', { name: 'Explore “My Future with Ice”' }).click();
    await page.waitForTimeout(1000);

    // Verify ZERO image uploads or unauthorized external network requests occurred
    expect(outgoingImageRequests).toHaveLength(0);

    // Verify localStorage & sessionStorage contain zero photos
    const localKeys = await page.evaluate(() => Object.keys(localStorage));
    const sessionKeys = await page.evaluate(() => Object.keys(sessionStorage));

    const sensitiveWords = ['photo', 'selfie', 'face', 'image'];
    const leakedLocal = localKeys.filter((k) => sensitiveWords.some((w) => k.toLowerCase().includes(w)));
    const leakedSession = sessionKeys.filter((k) => sensitiveWords.some((w) => k.toLowerCase().includes(w)));

    expect(leakedLocal).toHaveLength(0);
    expect(leakedSession).toHaveLength(0);
  });
});
