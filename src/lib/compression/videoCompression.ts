import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface VideoCompressionOptions {
  crf?: number; // Constant Rate Factor (18-32, lower = better quality)
  maxResolution?: number; // Max width or height in pixels
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow'; // Compression speed vs quality
}

export interface VideoCompressionResult {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface ProgressCallback {
  (progress: number): void; // 0-100
}

const DEFAULT_OPTIONS: Required<VideoCompressionOptions> = {
  crf: 28, // Good balance of quality and size
  maxResolution: 1920, // 1080p max
  preset: 'fast', // Faster = less memory usage (was 'medium')
};

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * Load ffmpeg.wasm library (lazy-loaded, cached after first load)
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (isLoading) {
    // Wait for the current loading to complete
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (ffmpegInstance) {
      return ffmpegInstance;
    }
  }

  isLoading = true;

  try {
    const ffmpeg = new FFmpeg();

    // Load ffmpeg core from CDN (single-threaded version - works without special headers)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });

    console.log('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load video compression library');
  } finally {
    isLoading = false;
  }
}

/**
 * Compress a video file using ffmpeg.wasm
 *
 * @param file - The video file to compress
 * @param options - Compression options
 * @param onProgress - Optional callback for compression progress (0-100)
 * @returns Promise with compression result
 */
export async function compressVideo(
  file: File,
  options: VideoCompressionOptions = {},
  onProgress?: ProgressCallback
): Promise<VideoCompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load FFmpeg (lazy-loaded, cached after first load)
    const ffmpeg = await loadFFmpeg();

    // Listen to progress and log events for debugging
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]:', message);
    });

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        // FFmpeg progress is 0-1, convert to 0-100
        onProgress(Math.round(progress * 100));
      });
    }

    const originalSize = file.size;
    // Use unique filenames to avoid conflicts from previous compressions
    const timestamp = Date.now();
    const inputName = `input_${timestamp}.mp4`;
    const outputName = `output_${timestamp}.mp4`;

    // Write input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

    // Build FFmpeg command
    const ffmpegArgs = [
      '-i',
      inputName,
      '-c:v',
      'libx264', // H.264 codec (widely supported)
      '-preset',
      opts.preset,
      '-crf',
      opts.crf.toString(),
      '-vf',
      // Scale down if needed, ensuring dimensions are divisible by 2 (required for H.264)
      // -2 means "maintain aspect ratio and make divisible by 2"
      `scale='min(${opts.maxResolution},iw)':'min(${opts.maxResolution},ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
      '-c:a',
      'aac', // AAC audio codec
      '-b:a',
      '128k', // Audio bitrate
      outputName,
    ];

    console.log('Compressing video with FFmpeg:', ffmpegArgs.join(' '));

    // Run FFmpeg compression with fallback for memory errors
    try {
      await ffmpeg.exec(ffmpegArgs);
    } catch (execError) {
      // If memory error, try again with ultrafast preset (uses less memory)
      if (execError instanceof Error && (execError.message.includes('memory') || execError.message.includes('out of bounds'))) {
        console.warn('Memory error detected, retrying with ultrafast preset...');
        await ffmpeg.deleteFile(inputName).catch(() => {});
        await ffmpeg.deleteFile(outputName).catch(() => {});

        // Use same unique filename for retry
        await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

        // Simpler compression with less memory
        const fallbackArgs = [
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'ultrafast', // Fastest, least memory
          '-crf', '32', // Higher CRF = more compression = smaller file
          '-vf', `scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`, // 720p max, even dimensions
          '-c:a', 'aac',
          '-b:a', '96k', // Lower audio bitrate
          outputName,
        ];

        console.log('Fallback compression:', fallbackArgs.join(' '));
        await ffmpeg.exec(fallbackArgs);
      } else {
        throw execError;
      }
    }

    // Read the compressed file
    const data = await ffmpeg.readFile(outputName);

    // Validate output file
    if (!data || data.length === 0) {
      throw new Error('FFmpeg produced an empty output file. Check video format compatibility.');
    }

    // @ts-expect-error - ffmpeg returns Uint8Array but TypeScript has issues with the generic type
    const compressedBlob = new Blob([data], { type: 'video/mp4' });
    const compressedSize = compressedBlob.size;

    // Sanity check: compressed file should not be 0 bytes
    if (compressedSize === 0) {
      throw new Error('Compression produced a 0-byte file. Original video may be corrupted or incompatible.');
    }

    // Sanity check: compressed should be smaller than original (or close)
    if (compressedSize > originalSize * 1.5) {
      console.warn('Compressed file is larger than original - using original instead');
      return {
        compressedBlob: file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
      };
    }

    const compressionRatio =
      ((originalSize - compressedSize) / originalSize) * 100;

    console.log(
      `Video compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ` +
        `${(compressedSize / 1024 / 1024).toFixed(2)}MB ` +
        `(${compressionRatio.toFixed(1)}% reduction)`
    );

    // Clean up
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return {
      compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Video compression failed:', error);
    throw new Error(
      `Failed to compress video: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate video file before compression
 *
 * @param file - The file to validate
 * @returns Object with validation result and optional error message
 */
export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check if it's a video
  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'File must be a video (MP4, MOV, WebM, or AVI)',
    };
  }

  // Check file size (max 100MB before compression)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video must be less than 100MB',
    };
  }

  return { valid: true };
}

/**
 * Get video duration in seconds
 *
 * @param file - The video file
 * @returns Promise with duration in seconds
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
}
