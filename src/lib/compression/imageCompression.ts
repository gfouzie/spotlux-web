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
 * Convert HEIC/HEIF image to JPEG
 *
 * @param file - The HEIC/HEIF file to convert
 * @returns Promise with converted JPEG file
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Dynamic import to avoid SSR issues
    const heic2any = (await import('heic2any')).default;

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    // heic2any can return Blob or Blob[], handle both
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    // Create a new File from the Blob
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    );

    console.log(`HEIC converted to JPEG: ${file.name} → ${convertedFile.name}`);
    return convertedFile;
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error(
      `Failed to convert HEIC image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

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
    let fileToCompress = file;

    // Convert HEIC/HEIF to JPEG first
    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      console.log('Detected HEIC/HEIF image, converting to JPEG...');
      fileToCompress = await convertHeicToJpeg(file);
    }

    // Compress the image
    const compressedFile = await imageCompression(fileToCompress, {
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
  // Check if it's an image (including HEIC/HEIF by file extension or MIME type)
  const isHeicByExtension = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
  const isHeicByMime = file.type === 'image/heic' || file.type === 'image/heif';
  const isImage = file.type.startsWith('image/');

  if (!isImage && !isHeicByExtension && !isHeicByMime) {
    return {
      valid: false,
      error: 'File must be an image (JPEG, PNG, WebP, GIF, or HEIC)',
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
