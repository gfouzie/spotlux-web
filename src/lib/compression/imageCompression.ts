import imageCompression from 'browser-image-compression';

export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  useWebWorker?: boolean;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  quality: 0.85,
  useWebWorker: true,
};

/**
 * Compress an image file using browser-image-compression
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise with compression result
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const originalSize = file.size;

    // Compress the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB!,
      maxWidthOrHeight: opts.maxWidthOrHeight!,
      initialQuality: opts.quality,
      useWebWorker: opts.useWebWorker,
    });

    const compressedSize = compressedFile.size;
    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    console.log(
      `Image compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ` +
        `${(compressedSize / 1024 / 1024).toFixed(2)}MB ` +
        `(${compressionRatio.toFixed(1)}% reduction)`
    );

    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error(
      `Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate image file before compression
 *
 * @param file - The file to validate
 * @returns Object with validation result and optional error message
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'File must be an image (JPEG, PNG, WebP, or GIF)',
    };
  }

  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be less than 10MB',
    };
  }

  return { valid: true };
}
