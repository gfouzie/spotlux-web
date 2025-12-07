'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import Alert from '@/components/common/Alert';
import { Upload, Xmark, Check } from 'iconoir-react';
import { highlightsApi, HighlightCreateRequest } from '@/api/highlights';
import { uploadApi } from '@/api/upload';
import { promptsApi, Prompt } from '@/api/prompts';
import { cn } from '@/lib/utils';
import { compressVideo, validateVideoFile } from '@/lib/compression';

interface HighlightUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reelId?: number;
  reels: Array<{ id: number; name: string }>;
  sport: string;
}

interface FileWithPreview {
  file: File;
  compressedFile?: File;
  preview: string;
  uploadProgress: number;
  compressionProgress: number;
  uploadStatus: 'pending' | 'compressing' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  originalSize?: number;
  compressedSize?: number;
}

export default function HighlightUploadModal({
  isOpen,
  onClose,
  onSuccess,
  reelId,
  reels,
  sport,
}: HighlightUploadModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedReelId, setSelectedReelId] = useState<number | undefined>(
    reelId
  );
  const [selectedPromptId, setSelectedPromptId] = useState<number | undefined>(
    undefined
  );
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file types and sizes
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0,
        compressionProgress: 0,
        uploadStatus: 'pending',
        originalSize: file.size,
      });
    });

    if (errors?.length > 0) {
      setError(errors.join(', '));
    }

    setFiles((prev) => [...prev, ...validFiles]);

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files?.length === 0) return;
    if (!selectedReelId) {
      setError('Please select a reel');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Track upload results
      let failureCount = 0;

      // Upload each file
      for (let i = 0; i < files?.length; i++) {
        const fileWithPreview = files[i];

        try {
          // Step 1: Compress the video
          setFiles((prev) => {
            const updated = [...prev];
            updated[i].uploadStatus = 'compressing';
            return updated;
          });

          const { compressedBlob, compressedSize } = await compressVideo(
            fileWithPreview.file,
            {}, // Use default compression settings
            (progress) => {
              // Update compression progress
              setFiles((prev) => {
                const updated = [...prev];
                updated[i].compressionProgress = progress;
                return updated;
              });
            }
          );

          // Convert blob to file
          const compressedFile = new File(
            [compressedBlob],
            fileWithPreview.file.name,
            {
              type: 'video/mp4',
            }
          );

          // Update with compressed file info
          setFiles((prev) => {
            const updated = [...prev];
            updated[i].compressedFile = compressedFile;
            updated[i].compressedSize = compressedSize;
            return updated;
          });

          // Step 2: Upload compressed video to S3
          setFiles((prev) => {
            const updated = [...prev];
            updated[i].uploadStatus = 'uploading';
            return updated;
          });

          const { fileUrl } = await uploadApi.uploadHighlightVideo(
            selectedReelId,
            compressedFile
          );

          // Create highlight record
          const createRequest: HighlightCreateRequest = {
            highlightReelId: selectedReelId,
            videoUrl: fileUrl,
            promptId: selectedPromptId,
          };

          await highlightsApi.createHighlight(createRequest);

          // Update status to success
          setFiles((prev) => {
            const updated = [...prev];
            updated[i].uploadStatus = 'success';
            updated[i].uploadProgress = 100;
            return updated;
          });
        } catch (err) {
          // Update status to error
          setFiles((prev) => {
            const updated = [...prev];
            updated[i].uploadStatus = 'error';
            updated[i].errorMessage =
              err instanceof Error ? err.message : 'Upload failed';
            return updated;
          });

          failureCount++;
        }
      }

      // Check if all uploads succeeded
      if (failureCount === 0) {
        onSuccess();
        handleClose();
      } else {
        setError('Some uploads failed. Please retry the failed uploads.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up previews
    files?.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setSelectedReelId(reelId);
    setSelectedPromptId(undefined);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Highlight Clips"
      size="lg"
      showFooter
      confirmText={`Upload${files?.length ? ` (${files?.length})` : ''}`}
      cancelText="Cancel"
      onConfirm={handleUpload}
      onCancel={handleClose}
      confirmLoading={isUploading}
      confirmDisabled={files?.length === 0}
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-text-col/30 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="video/*"
            multiple
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
              Click to upload video clips
            </p>
            <p className="text-sm text-text-col/60">
              MP4, MOV, WEBM up to 100MB each
            </p>
          </label>
        </div>

        {/* File List */}
        {files?.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files?.map((fileWithPreview, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-bg-col/30 rounded border border-bg-col"
              >
                {/* Video Preview */}
                <video
                  src={fileWithPreview.preview}
                  className="w-16 h-16 object-cover rounded"
                />

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-col truncate">
                    {fileWithPreview.file.name}
                  </p>
                  <p className="text-xs text-text-col/60">
                    {(fileWithPreview.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {/* Status */}
                  {fileWithPreview.uploadStatus === 'compressing' && (
                    <p className="text-xs text-accent-col">
                      Compressing... {fileWithPreview.compressionProgress}%
                    </p>
                  )}
                  {fileWithPreview.uploadStatus === 'uploading' && (
                    <p className="text-xs text-accent-col">Uploading...</p>
                  )}
                  {fileWithPreview.uploadStatus === 'success' && (
                    <p className="text-xs text-green-600">Uploaded</p>
                  )}
                  {fileWithPreview.uploadStatus === 'error' && (
                    <p className="text-xs text-red-600">
                      {fileWithPreview.errorMessage || 'Failed'}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                {fileWithPreview.uploadStatus === 'pending' && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="cursor-pointer p-2 hover:bg-bg-col/50 rounded transition-colors"
                  >
                    <Xmark className="w-4 h-4 text-text-col/60" />
                  </button>
                )}

                {/* Status Icon */}
                {fileWithPreview.uploadStatus === 'success' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {fileWithPreview.uploadStatus === 'error' && (
                  <Xmark className="w-5 h-5 text-red-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
