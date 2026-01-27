import { uploadApi } from '@/api/upload';
import { highlightsApi, Highlight } from '@/api/highlights';
import { compressVideo } from '@/lib/compression';

export interface UploadHighlightParams {
  reelId: number;
  videoFile: File;
  promptId?: number;
  isPrivateToUser?: boolean; // Default: false (visible based on user's profile visibility)
  onCompressionProgress?: (progress: number) => void;
  onStatusChange?: (status: 'compressing' | 'uploading' | 'creating') => void;
}

export interface UploadHighlightResult {
  highlight: Highlight;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress and upload a highlight video, then create the highlight record
 *
 * This standardized helper ensures consistent video upload behavior across the app:
 * 1. Compresses video using FFmpeg.wasm
 * 2. Uploads compressed video to S3
 * 3. Creates highlight database record
 *
 * @param params - Upload parameters
 * @returns Promise with created highlight and compression stats
 */
export async function compressAndUploadHighlight(
  params: UploadHighlightParams
): Promise<UploadHighlightResult> {
  const {
    reelId,
    videoFile,
    promptId,
    isPrivateToUser = false,
    onCompressionProgress,
    onStatusChange,
  } = params;

  try {
    // Step 1: Compress the video
    onStatusChange?.('compressing');
    const { compressedBlob, originalSize, compressedSize, compressionRatio } =
      await compressVideo(
        videoFile,
        {}, // Use default compression settings (CRF 28, 1920p max, medium preset)
        onCompressionProgress
      );

    // Convert blob to file
    const compressedFile = new File([compressedBlob], videoFile.name, {
      type: 'video/mp4',
    });

    // Step 2: Upload compressed video to S3
    onStatusChange?.('uploading');
    const { fileUrl } = await uploadApi.uploadHighlightVideo(
      reelId,
      compressedFile
    );

    // Step 3: Create highlight record
    onStatusChange?.('creating');
    const highlight = await highlightsApi.createHighlight({
      highlightReelId: reelId,
      videoUrl: fileUrl,
      promptId: promptId || undefined,
      isPrivateToUser,
    });

    return {
      highlight,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Failed to compress and upload highlight:', error);
    throw error;
  }
}
