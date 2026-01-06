'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import Alert from '@/components/common/Alert';
import VideoCropStep from '@/components/common/VideoCropStep';
import { Upload, Xmark } from 'iconoir-react';
import { promptsApi, Prompt } from '@/api/prompts';
import { cn } from '@/lib/utils';
import { validateVideoFile } from '@/lib/compression';
import { compressAndUploadHighlight } from '@/lib/highlights/uploadHelper';

interface HighlightUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reelId?: number;
  reels: Array<{ id: number; name: string }>;
  sport: string;
}

export default function HighlightUploadModal({
  isOpen,
  onClose,
  onSuccess,
  reelId,
  reels,
  sport,
}: HighlightUploadModalProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [originalVideoFile, setOriginalVideoFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedReelId, setSelectedReelId] = useState<number | undefined>(
    reelId
  );
  const [selectedPromptId, setSelectedPromptId] = useState<number | undefined>(
    undefined
  );
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'compressing' | 'uploading' | 'success' | 'error'
  >('idle');
  const [compressedVideoSize, setCompressedVideoSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load prompts for the sport
  const loadPrompts = useCallback(async () => {
    setIsLoadingPrompts(true);
    try {
      const prompts = await promptsApi.getPrompts({ sport, limit: 100 });
      setPrompts(prompts);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [sport]);

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
      // Set default reel if not provided
      if (!selectedReelId && reels?.length > 0) {
        setSelectedReelId(reels?.[0]?.id);
      }
    }
  }, [isOpen, loadPrompts, reels, selectedReelId]);

  // Update selectedReelId when reelId prop changes
  useEffect(() => {
    if (reelId) {
      setSelectedReelId(reelId);
    }
  }, [reelId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate using the shared validation function
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid video file');
      return;
    }

    setOriginalVideoFile(file);
    setIsCropping(true);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
    setError(null);

    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], originalVideoFile?.name || 'cropped-video.webm', {
      type: 'video/webm',
    });

    setVideoFile(croppedFile);
    setIsCropping(false);
  };

  const handleCropCancel = () => {
    setOriginalVideoFile(null);
    setIsCropping(false);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    if (!selectedReelId) {
      setError('Please select a reel');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { compressedSize } = await compressAndUploadHighlight({
        reelId: selectedReelId,
        videoFile,
        promptId: selectedPromptId,
        onCompressionProgress: (progress) => {
          setCompressionProgress(progress);
        },
        onStatusChange: (status) => {
          if (status === 'compressing') setUploadStatus('compressing');
          else if (status === 'uploading') setUploadStatus('uploading');
          else if (status === 'creating') setUploadStatus('uploading');
        },
      });

      setCompressedVideoSize(compressedSize);
      setUploadStatus('success');

      // Call success callback and close modal
      onSuccess();
      handleClose();
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setVideoFile(null);
    setOriginalVideoFile(null);
    setIsCropping(false);
    setSelectedReelId(reelId);
    setSelectedPromptId(undefined);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isCropping ? 'Crop & Trim Video' : 'Upload Highlight Clip'}
      size="lg"
      showFooter={!isCropping}
      confirmText={
        uploadStatus === 'compressing'
          ? `Compressing ${compressionProgress}%`
          : uploadStatus === 'uploading'
            ? 'Uploading...'
            : 'Upload'
      }
      cancelText="Cancel"
      onConfirm={handleUpload}
      onCancel={handleClose}
      confirmLoading={isUploading}
      confirmDisabled={!videoFile || uploadStatus === 'success'}
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Video Crop Step */}
        {isCropping && originalVideoFile ? (
          <VideoCropStep
            videoFile={originalVideoFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={9 / 16}
            maxDuration={15}
          />
        ) : (
          <>
            {/* Reel Selection */}
            <Select
          label="Highlight Reel"
          value={selectedReelId?.toString() || ''}
          onChange={(e) =>
            setSelectedReelId(
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          options={reels?.map((reel) => ({
            value: reel.id.toString(),
            label: reel.name,
          }))}
          required
        />

        {/* Prompt Selection */}
        <Select
          label="Prompt (optional)"
          value={selectedPromptId?.toString() || ''}
          onChange={(e) =>
            setSelectedPromptId(
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          options={
            isLoadingPrompts
              ? [{ value: '', label: 'Loading prompts...' }]
              : [
                  { value: '', label: 'No prompt' },
                  ...prompts?.map((prompt) => ({
                    value: prompt.id.toString(),
                    label: prompt.promptCategoryName
                      ? `${prompt.name} (${prompt.promptCategoryName})`
                      : prompt.name,
                  })),
                ]
          }
        />

        {/* Video Upload */}
        {videoFile ? (
          <div className="space-y-3">
            {/* File Info */}
            <div className="p-3 bg-bg-col/30 rounded border border-bg-col">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-col font-medium truncate">
                    {videoFile.name}
                  </p>
                  <p className="text-xs text-text-col/60">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {compressedVideoSize > 0 && (
                    <p className="text-xs text-text-col">
                      Compressed:{' '}
                      {(compressedVideoSize / (1024 * 1024)).toFixed(2)} MB (
                      {(
                        ((videoFile.size - compressedVideoSize) /
                          videoFile.size) *
                        100
                      ).toFixed(1)}
                      % reduction)
                    </p>
                  )}
                </div>
                {!isUploading && uploadStatus !== 'success' && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="cursor-pointer p-2 hover:bg-bg-col/50 rounded transition-colors flex-shrink-0"
                  >
                    <Xmark className="w-4 h-4 text-text-col/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {uploadStatus === 'compressing' && (
              <p className="text-xs text-text-col">
                Compressing... {compressionProgress}%
              </p>
            )}
            {uploadStatus === 'uploading' && (
              <p className="text-xs text-text-col">Uploading to S3...</p>
            )}
            {uploadStatus === 'success' && (
              <p className="text-xs text-green-600">✓ Upload successful!</p>
            )}
            {uploadStatus === 'error' && (
              <p className="text-xs text-red-600">Upload failed</p>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-text-col/30 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="video-upload"
              className={cn(
                'cursor-pointer flex flex-col items-center gap-2',
                isUploading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Upload className="w-12 h-12 text-text-col/40" />
              <p className="text-text-col font-medium">
                Click to upload video clip
              </p>
              <p className="text-sm text-text-col/60">
                MP4, MOV, WEBM up to 100MB
              </p>
            </label>
          </div>
        )}
          </>
        )}
      </div>
    </Modal>
  );
}
