import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL and revokeObjectURL
let blobCounter = 0;
const blobUrlMap = new Map<string, Blob>();

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn((blob: Blob) => {
    const url = `blob:http://localhost/mock-blob-${++blobCounter}`;
    blobUrlMap.set(url, blob);
    return url;
  });
}

if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn((url: string) => {
    blobUrlMap.delete(url);
  });
}

// Mock HTMLCanvasElement and 2D Context if not fully supported in jsdom
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      drawImage: vi.fn(),
      getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4).fill(128),
        width: w,
        height: h,
        colorSpace: 'srgb',
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn((w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
        colorSpace: 'srgb',
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      globalCompositeOperation: 'source-over',
      fillStyle: '#000',
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toBlob = vi.fn((callback: BlobCallback, type = 'image/jpeg') => {
  const mockBlob = new Blob(['mock-image-data'], { type });
  setTimeout(() => callback(mockBlob), 0);
});

// Mock Image loading
class MockImage {
  src = '';
  naturalWidth = 800;
  naturalHeight = 800;
  width = 800;
  height = 800;
  crossOrigin = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
}
window.Image = MockImage as unknown as typeof Image;

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: vi.fn(),
          kind: 'video',
          enabled: true,
        },
      ],
    }),
  },
  configurable: true,
  writable: true,
});
