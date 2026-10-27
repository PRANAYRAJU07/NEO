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

HTMLCanvasElement.prototype.toDataURL = vi.fn((_type = 'image/jpeg') => {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
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

// Mock fetch for fast unit testing
const originalFetch = global.fetch;
global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();

  // If testing offline host
  if (url.includes('nonexistent-host')) {
    throw new Error('Failed to fetch');
  }

  if (url.includes('/api/v1/health')) {
    return new Response(JSON.stringify({ status: 'healthy', service: 'NEO-AI' }), { status: 200 });
  }

  if (url.includes('/api/v1/model-status')) {
    return new Response(JSON.stringify({
      status: 'cpu_fallback',
      model_name: 'stabilityai/stable-diffusion-xl-base-1.0',
      device: 'cpu',
      cuda_available: false,
      supported_stages: [1, 2, 3],
      supported_pathways: ['ice', 'healthy'],
    }), { status: 200 });
  }

  if (url.includes('/api/v1/transform')) {
    return new Response(JSON.stringify({
      success: true,
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      pathway: 'ice',
      stage: 1,
      intensity: 0.85,
      effective_strength: 0.33,
      seed: 42,
      prompt_used: 'documentary portrait',
      negative_prompt_used: 'horror, gore',
      execution_time_ms: 85,
      is_live_gpu_inference: false,
    }), { status: 200 });
  }

  if (originalFetch) {
    return originalFetch(input, init);
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
}) as unknown as typeof fetch;
