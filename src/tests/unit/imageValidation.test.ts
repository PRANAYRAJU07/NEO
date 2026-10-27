import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../../services/imageValidation';

describe('Image Validation Service', () => {
  it('rejects empty or 0-byte files', async () => {
    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = await validateImageFile(emptyFile);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('EMPTY_FILE');
  });

  it('rejects unsupported file formats', async () => {
    const textFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const result = await validateImageFile(textFile);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('INVALID_TYPE');
  });

  it('rejects files exceeding the 10MB limit', async () => {
    // 11MB file
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' });
    const result = await validateImageFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
  });

  it('accepts valid JPEG within size limits', async () => {
    const validBuffer = new Uint8Array(1024 * 100); // 100KB
    const validFile = new File([validBuffer], 'portrait.jpg', { type: 'image/jpeg' });
    const result = await validateImageFile(validFile);
    expect(result.valid).toBe(true);
    expect(result.dimensions).toBeDefined();
    expect(result.dimensions?.width).toBe(800);
  });

  it('accepts valid PNG and WebP files', async () => {
    const pngFile = new File([new Uint8Array(50000)], 'selfie.png', { type: 'image/png' });
    const pngResult = await validateImageFile(pngFile);
    expect(pngResult.valid).toBe(true);

    const webpFile = new File([new Uint8Array(50000)], 'selfie.webp', { type: 'image/webp' });
    const webpResult = await validateImageFile(webpFile);
    expect(webpResult.valid).toBe(true);
  });
});
