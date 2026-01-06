'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import VideoCropStep from '@/components/common/VideoCropStep';
import { Xmark, Upload, VideoCamera, Menu, Trash } from 'iconoir-react';
import { HighlightReel, highlightReelsApi } from '@/api/highlightReels';
import { Highlight, highlightsApi } from '@/api/highlights';
import { uploadApi } from '@/api/upload';
import { Prompt, promptsApi } from '@/api/prompts';
import { validateVideoFile } from '@/lib/compression';
import { compressAndUploadHighlight } from '@/lib/highlights/uploadHelper';
import { cn } from '@/lib/utils';

interface EditReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reel: HighlightReel;
}

export default function EditReelModal({
  isOpen,
  onClose,
  onSuccess,
  reel,
}: EditReelModalProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [shouldRemoveThumbnail, setShouldRemoveThumbnail] = useState(false);
  const [visibility, setVisibility] = useState<
    'private' | 'public' | 'friends_only'
  >('private');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reorderedClips, setReorderedClips] = useState<Set<number>>(new Set());
  const [deletingHighlightId, setDeletingHighlightId] = useState<number | null>(
    null
  );

  // New video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [originalVideoFile, setOriginalVideoFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'compressing' | 'uploading' | 'success' | 'error'
  >('idle');
  const [compressedVideoSize, setCompressedVideoSize] = useState<number>(0);

  // Load highlights for this reel
  const loadHighlights = useCallback(async () => {
    setIsLoadingHighlights(true);
    try {
      const highlights = await highlightsApi.getHighlightsByReel(reel.id);
      const sorted = highlights?.sort((a, b) => a.orderIndex - b.orderIndex);
      setHighlights(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load highlights'
      );
    } finally {
      setIsLoadingHighlights(false);
    }
  }, [reel.id]);

  // Load prompts for this sport
  const loadPrompts = useCallback(async () => {
    try {
      const promptsData = await promptsApi.getPrompts({
        sport: reel.sport,
        limit: 100,
      });
      setPrompts(promptsData);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  }, [reel.sport]);

  useEffect(() => {
    if (isOpen) {
      loadHighlights();
      loadPrompts();
      setThumbnailPreview(reel.thumbnailUrl || null);
      setVisibility(reel.visibility);
      setShouldRemoveThumbnail(false);
    }
  }, [isOpen, loadHighlights, loadPrompts, reel.thumbnailUrl, reel.visibility]);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset remove flag when selecting a new thumbnail
    setShouldRemoveThumbnail(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShouldRemoveThumbnail(true);
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate using the shared validation function
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid video file');
      return;
    }

    // Show crop step instead of auto-uploading
    setOriginalVideoFile(file);
    setIsCropping(true);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
    setError(null);

    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], originalVideoFile?.name || 'cropped-video.webm', {
      type: 'video/webm',
    });

    setVideoFile(croppedFile);
    setIsCropping(false);

    // Auto-upload the cropped video
    await handleUploadVideo(croppedFile);
  };

  const handleCropCancel = () => {
    setOriginalVideoFile(null);
    setIsCropping(false);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setSelectedPromptId(null);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
  };

  const handleUploadVideo = async (fileToUpload?: File) => {
    const file = fileToUpload || videoFile;
    if (!file) return;

    setIsUploadingVideo(true);
    setError(null);

    try {
      const { compressedSize } = await compressAndUploadHighlight({
        reelId: reel.id,
        videoFile: file,
        promptId: selectedPromptId || undefined,
        onCompressionProgress: (progress) => {
          setCompressionProgress(progress);
        },
        onStatusChange: (status) => {
          if (status === 'compressing') setUploadStatus('compressing');
          else if (status === 'uploading') setUploadStatus('uploading');
          else if (status === 'creating') setUploadStatus('uploading'); // Keep showing "uploading" during creation
        },
      });

      setCompressedVideoSize(compressedSize);

      // Reload highlights and show success
      setUploadStatus('success');
      await loadHighlights();

      // Refresh parent component to get updated reel data (including auto-generated thumbnail)
      onSuccess();

      // Clear upload form after a brief success display
      setTimeout(() => {
        handleRemoveVideo();
      }, 1500);
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newHighlights = [...highlights];
    const [draggedItem] = newHighlights.splice(draggedIndex, 1);
    newHighlights.splice(dropIndex, 0, draggedItem);

    setHighlights(newHighlights);

    // Mark affected clips as reordered
    const affected = new Set(reorderedClips);
    for (
      let i = Math.min(draggedIndex, dropIndex);
      i <= Math.max(draggedIndex, dropIndex);
      i++
    ) {
      affected.add(newHighlights[i].id);
    }
    setReorderedClips(affected);

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDeleteHighlight = async (highlightId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this clip? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingHighlightId(highlightId);
    setError(null);

    try {
      await highlightsApi.deleteHighlight(highlightId);

      // Remove from local state
      const updatedHighlights = highlights.filter((h) => h.id !== highlightId);
      setHighlights(updatedHighlights);

      // Remove from reordered clips set if present
      const updatedReorderedClips = new Set(reorderedClips);
      updatedReorderedClips.delete(highlightId);
      setReorderedClips(updatedReorderedClips);

      // Reload highlights to get fresh data with updated order indices
      await loadHighlights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete clip');
    } finally {
      setDeletingHighlightId(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Update clip order if any clips were reordered
      if (reorderedClips.size > 0) {
        await highlightsApi.bulkReorderHighlights({
          highlightReelId: reel.id,
          reorders: highlights.map((highlight, index) => ({
            highlightId: highlight.id,
            orderIndex: index + 1,
          })),
        });
      }

      // Upload new thumbnail if one was selected
      // The upload API will automatically update the reel's thumbnail_url
      if (thumbnailFile) {
        await uploadApi.uploadHighlightReelThumbnail(reel.id, thumbnailFile);
      }

      // Prepare update data for other fields
      const updateData: {
        thumbnailUrl?: string | null;
        visibility?: 'private' | 'public' | 'friends_only';
      } = {};

      // Handle thumbnail removal (set to null)
      if (shouldRemoveThumbnail) {
        updateData.thumbnailUrl = null;
      }

      if (visibility !== reel.visibility) {
        updateData.visibility = visibility;
      }

      if (Object.keys(updateData)?.length > 0) {
        await highlightReelsApi.updateHighlightReel(reel.id, updateData);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShouldRemoveThumbnail(false);
    setVideoFile(null);
    setOriginalVideoFile(null);
    setIsCropping(false);
    setSelectedPromptId(null);
    setUploadStatus('idle');
    setCompressionProgress(0);
    setCompressedVideoSize(0);
    setVisibility(reel.visibility);
    setError(null);
    setReorderedClips(new Set());
    setDraggedIndex(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Highlight Reel"
      size="lg"
      showFooter
      confirmText="Save Changes"
      cancelText="Cancel"
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isSubmitting || isUploadingVideo}
      confirmDisabled={isUploadingVideo}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Reel Info */}
        <div className="bg-bg-col/30 p-3 rounded">
          <p className="text-sm text-text-col/60">
            <strong>Reel:</strong> {reel.name}
          </p>
          <p className="text-sm text-text-col/60">
            <strong>Sport:</strong>{' '}
            {reel.sport.charAt(0).toUpperCase() + reel.sport.slice(1)}
          </p>
        </div>

        {/* Visibility Setting */}
        <Select
          label="Visibility"
          value={visibility}
          onChange={(e) =>
            setVisibility(
              e.target.value as 'private' | 'public' | 'friends_only'
            )
          }
          options={[
            { value: 'private', label: 'Private - Only you can see' },
            {
              value: 'friends_only',
              label: 'Friends Only - Only friends can see',
            },
            { value: 'public', label: 'Public - Everyone can see' },
          ]}
          required
        />

        {/* Thumbnail Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-col">
            Reel Thumbnail
          </label>
          <p className="text-xs text-text-col/60 mb-2">
            Upload a custom thumbnail or leave blank to use the first video
          </p>

          {thumbnailPreview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-bg-col">
              {thumbnailPreview.endsWith('.mp4') ||
              thumbnailPreview.endsWith('.mov') ||
              thumbnailPreview.endsWith('.webm') ? (
                <video
                  src={thumbnailPreview}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : thumbnailPreview.startsWith('blob:') ? (
                // Use regular img for blob URLs (locally selected files)
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                // Use Next.js Image for remote URLs (S3, etc.)
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={handleRemoveThumbnail}
                className="cursor-pointer absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded"
              >
                <Xmark className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-text-col/30 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
                id="thumbnail-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="thumbnail-upload"
                className={cn(
                  'cursor-pointer flex flex-col items-center gap-2',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload className="w-8 h-8 text-text-col/40" />
                <p className="text-sm text-text-col/80">
                  Click to upload thumbnail
                </p>
                <p className="text-xs text-text-col/60">
                  JPG, PNG, WEBP up to 5MB
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Video Crop Step */}
        {isCropping && originalVideoFile ? (
          <div className="border-t border-bg-col pt-6">
            <VideoCropStep
              videoFile={originalVideoFile}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
              aspectRatio={9 / 16}
              maxDuration={15}
            />
          </div>
        ) : (
          <>
            {/* Add New Video Section */}
            <div className="space-y-3 border-t border-bg-col pt-6">
              <label className="block text-sm font-medium text-text-col">
                Add New Clip
              </label>
              <p className="text-xs text-text-col/60">
                {videoFile && uploadStatus !== 'success'
                  ? 'Uploading your video clip...'
                  : 'Select a video file to upload (uploads automatically)'}
              </p>

              {/* Prompt Selection (shown before file upload) */}
              {prompts.length > 0 && !videoFile && (
            <Select
              label="Prompt (Optional)"
              value={selectedPromptId?.toString() || ''}
              onChange={(e) =>
                setSelectedPromptId(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              options={[
                { value: '', label: 'No prompt' },
                ...prompts.map((prompt) => ({
                  value: prompt.id.toString(),
                  label: prompt.name,
                })),
              ]}
            />
          )}

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
                  {!isUploadingVideo && uploadStatus !== 'success' && (
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
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
                disabled={isUploadingVideo}
              />
              <label
                htmlFor="video-upload"
                className={cn(
                  'cursor-pointer flex flex-col items-center gap-2',
                  isUploadingVideo && 'opacity-50 cursor-not-allowed'
                )}
              >
                <VideoCamera className="w-8 h-8 text-text-col/40" />
                <p className="text-sm text-text-col/80">
                  Click to upload video clip
                </p>
                <p className="text-xs text-text-col/60">
                  MP4, MOV, WEBM up to 100MB
                </p>
              </label>
            </div>
          )}
            </div>
          </>
        )}

        {/* Clip Reordering Section */}
        <div className="space-y-2 border-t border-bg-col pt-6">
          <label className="block text-sm font-medium text-text-col">
            Reorder Clips ({highlights?.length})
          </label>
          {highlights?.length > 0 && (
            <p className="text-xs text-text-col/60">
              Drag and drop clips to reorder them
            </p>
          )}

          {isLoadingHighlights ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-col/60">Loading clips...</p>
            </div>
          ) : highlights?.length === 0 ? (
            <div className="text-center py-8 bg-bg-col/30 rounded-lg border border-bg-col">
              <VideoCamera className="w-12 h-12 text-text-col/20 mx-auto mb-2" />
              <p className="text-sm text-text-col/60">
                No clips in this reel yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {highlights?.map((highlight, index) => (
                <div
                  key={highlight.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded border transition-all cursor-move',
                    draggedIndex === index
                      ? 'opacity-50 bg-bg-col/50 border-accent-col'
                      : 'bg-bg-col/30 border-bg-col hover:border-accent-col/50'
                  )}
                >
                  {/* Drag Handle */}
                  <Menu className="w-5 h-5 text-text-col/40 flex-shrink-0" />

                  {/* Video Preview */}
                  <video
                    src={highlight.videoUrl}
                    className="w-16 h-24 object-cover rounded"
                    preload="metadata"
                  />

                  {/* Clip Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-col font-medium">
                      Clip #{index + 1}
                    </p>
                    {highlight?.promptName && (
                      <p className="text-xs text-text-col/60 truncate">
                        {highlight.promptName}
                      </p>
                    )}
                  </div>

                  {/* Reordered indicator */}
                  {reorderedClips.has(highlight?.id) && (
                    <div className="text-xs text-text-col font-medium">
                      Modified
                    </div>
                  )}

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHighlight(highlight.id);
                    }}
                    isLoading={deletingHighlightId === highlight.id}
                    disabled={deletingHighlightId !== null}
                    className="flex-shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
