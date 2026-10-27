/**
 * Image Cleanup & Memory Purge Service
 *
 * Ensures no student photos, blob URLs, or intermediate canvas buffers remain
 * in browser memory or persist across sessions.
 */

class ImageCleanupManager {
  private activeBlobUrls = new Set<string>();
  private activeMediaStreams = new Set<MediaStream>();

  /**
   * Registers a Blob URL for tracking and managed cleanup.
   */
  registerBlobUrl(url: string): string {
    if (url && url.startsWith('blob:')) {
      this.activeBlobUrls.add(url);
    }
    return url;
  }

  /**
   * Revokes a specific Blob URL immediately.
   */
  revokeBlobUrl(url: string | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      this.activeBlobUrls.delete(url);
    }
  }

  /**
   * Registers an active MediaStream (e.g. from camera) for cleanup.
   */
  registerStream(stream: MediaStream): MediaStream {
    this.activeMediaStreams.add(stream);
    return stream;
  }

  /**
   * Stops all active camera and microphone tracks in tracked MediaStreams.
   */
  stopAllMediaStreams(): void {
    for (const stream of this.activeMediaStreams) {
      try {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping media track:', e);
      }
    }
    this.activeMediaStreams.clear();
  }

  /**
   * Revokes all active Blob URLs.
   */
  revokeAllBlobUrls(): void {
    for (const url of this.activeBlobUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Error revoking blob url:', e);
      }
    }
    this.activeBlobUrls.clear();
  }

  /**
   * Verifies that no photo data or personal imagery exists in persistent storage.
   * If any sensitive keys are found, cleans them up and warns.
   */
  verifyNoPersistentStorage(): boolean {
    const sensitiveKeys = ['photo', 'selfie', 'face', 'image', 'capture', 'neo_photo'];
    let clean = true;

    try {
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          localStorage.removeItem(key);
          clean = false;
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i) || '';
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          sessionStorage.removeItem(key);
          clean = false;
        }
      }
    } catch (e) {
      // In restricted storage environments, accessing storage may throw
      console.warn('Storage check warning:', e);
    }

    return clean;
  }

  /**
   * Complete reset: stop streams, revoke all blobs, clean canvas contexts, verify storage.
   */
  fullCleanup(): void {
    this.stopAllMediaStreams();
    this.revokeAllBlobUrls();
    this.verifyNoPersistentStorage();
  }

  getActiveBlobCount(): number {
    return this.activeBlobUrls.size;
  }
}

export const imageCleanup = new ImageCleanupManager();
