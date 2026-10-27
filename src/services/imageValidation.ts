import { APP_CONFIG } from '../config/appConfig';
import { ImageValidationResult } from '../types';

/**
 * Validates an uploaded or captured image file for safety, type, size, dimensions, and decodability.
 * Runs 100% locally in the browser.
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // 1. Check for empty file
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'The selected file is empty. Please choose a valid photograph.',
      },
    };
  }

  // 2. MIME type check
  const allowedTypes = APP_CONFIG.imageLimits.allowedMimeTypes;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_TYPE',
        message: `Unsupported file format (${file.type || 'unknown'}). Please select a JPEG, PNG, or WebP photo.`,
        details: `Allowed types: ${allowedTypes.join(', ')}`,
      },
    };
  }

  // 3. File size check (prevent browser memory exhaustion)
  const maxBytes = APP_CONFIG.imageLimits.maxFileSizeBytes;
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `The photo size (${sizeMb} MB) exceeds the maximum limit of ${maxMb} MB. Please select a smaller photo.`,
      },
    };
  }

  // 4. Image decoding & dimension checks
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width < APP_CONFIG.imageLimits.minDimension || dimensions.height < APP_CONFIG.imageLimits.minDimension) {
      return {
        valid: false,
        error: {
          code: 'DIMENSIONS_TOO_SMALL',
          message: `The image is too small (${dimensions.width}×${dimensions.height}px). Minimum required is ${APP_CONFIG.imageLimits.minDimension}×${APP_CONFIG.imageLimits.minDimension}px for clear processing.`,
        },
        dimensions,
      };
    }

    if (dimensions.width > APP_CONFIG.imageLimits.maxDimension || dimensions.height > APP_CONFIG.imageLimits.maxDimension) {
      return {
        valid: false,
        error: {
          code: 'DIMENSIONS_TOO_LARGE',
          message: `The image resolution (${dimensions.width}×${dimensions.height}px) is too large. Maximum supported is ${APP_CONFIG.imageLimits.maxDimension}×${APP_CONFIG.imageLimits.maxDimension}px.`,
        },
        dimensions,
      };
    }

    return {
      valid: true,
      dimensions,
    };
  } catch (err) {
    return {
      valid: false,
      error: {
        code: 'DECODE_FAILED',
        message: 'Could not decode the selected image file. The file may be corrupted or unreadable.',
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

/**
 * Helper to safely extract image dimensions using an offscreen HTMLImageElement.
 * Revokes object URL immediately after load or error.
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image decode error'));
    };

    img.src = objectUrl;
  });
}
