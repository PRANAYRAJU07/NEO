import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageCleanup } from '../../services/imageCleanup';

describe('Image Cleanup & Memory Purge Service', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('tracks and revokes blob URLs correctly', () => {
    const blobUrl = 'blob:http://localhost/test-photo-1';
    imageCleanup.registerBlobUrl(blobUrl);
    expect(imageCleanup.getActiveBlobCount()).toBe(1);

    imageCleanup.revokeBlobUrl(blobUrl);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    expect(imageCleanup.getActiveBlobCount()).toBe(0);
  });

  it('stops all media tracks when camera stream is registered', () => {
    const mockTrack1 = { stop: vi.fn() } as unknown as MediaStreamTrack;
    const mockTrack2 = { stop: vi.fn() } as unknown as MediaStreamTrack;
    const mockStream = {
      getTracks: () => [mockTrack1, mockTrack2],
    } as unknown as MediaStream;

    imageCleanup.registerStream(mockStream);
    imageCleanup.stopAllMediaStreams();

    expect(mockTrack1.stop).toHaveBeenCalled();
    expect(mockTrack2.stop).toHaveBeenCalled();
  });

  it('detects and purges any accidental photo keys in localStorage and sessionStorage', () => {
    localStorage.setItem('user_photo_data', 'data:image/jpeg;base64,xxxx');
    localStorage.setItem('safe_theme_mode', 'dark');
    sessionStorage.setItem('temp_face_capture', 'data:image/jpeg;base64,yyyy');

    const clean = imageCleanup.verifyNoPersistentStorage();
    expect(clean).toBe(false);

    // Verify sensitive keys were removed
    expect(localStorage.getItem('user_photo_data')).toBeNull();
    expect(sessionStorage.getItem('temp_face_capture')).toBeNull();
    // Safe non-biometric key remains
    expect(localStorage.getItem('safe_theme_mode')).toBe('dark');
  });

  it('performs full cleanup (blobs, media streams, storage)', () => {
    const blob1 = 'blob:http://localhost/photo-1';
    const blob2 = 'blob:http://localhost/photo-2';
    imageCleanup.registerBlobUrl(blob1);
    imageCleanup.registerBlobUrl(blob2);

    const mockTrack = { stop: vi.fn() } as unknown as MediaStreamTrack;
    imageCleanup.registerStream({ getTracks: () => [mockTrack] } as unknown as MediaStream);

    imageCleanup.fullCleanup();

    expect(imageCleanup.getActiveBlobCount()).toBe(0);
    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
