'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';
import VideoCropStep from '@/components/common/VideoCropStep';
import { FriendMatchup, friendMatchupsApi } from '@/api/friendMatchups';
import { uploadApi } from '@/api/upload';
import { compressVideo, validateVideoFile } from '@/lib/compression';
import { Upload } from 'iconoir-react';

interface RespondToMatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchup: FriendMatchup;
  onResponded: () => void;
}

type Step = 'preview' | 'select' | 'crop' | 'uploading';

/**
 * Modal for responding to a friend matchup challenge.
 * Shows the challenger's video and allows uploading a response.
 */
export default function RespondToMatchupModal({
  isOpen,
  onClose,
  matchup,
  onResponded,
}: RespondToMatchupModalProps) {
  const [step, setStep] = useState<Step>('preview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid video file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setStep('crop');
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setStep('uploading');
    setError(null);

    try {
      // Convert blob to file for compression
      const file = new File([croppedBlob], 'response.webm', { type: croppedBlob.type });

      // Compress video
      setUploadProgress(10);
      const compressionResult = await compressVideo(file, {}, (progress) => {
        setUploadProgress(10 + progress * 0.4); // 10-50%
      });
      const compressedBlob = compressionResult.compressedBlob;

      // Convert blob to file for upload
      setUploadProgress(55);
      const compressedFile = new File(
        [compressedBlob],
        `response_${Date.now()}.mp4`,
        { type: compressedBlob.type || 'video/mp4' }
      );

      // Upload to S3
      setUploadProgress(60);
      const { fileUrl } = await uploadApi.uploadFriendMatchupVideo(compressedFile);

      setUploadProgress(80);

      // Respond to matchup
      setUploadProgress(90);
      await friendMatchupsApi.respond(matchup.id, { videoUrl: fileUrl });

      setUploadProgress(100);
      onResponded();
      handleClose();
    } catch (err) {
      console.error('Failed to upload response:', err);
      setError('Failed to upload video. Please try again.');
      setStep('select');
    }
  };

  const handleCropCancel = () => {
    setSelectedFile(null);
    setStep('select');
  };

  const handleClose = () => {
    setStep('preview');
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  const renderPreview = () => (
    <div className="p-4">
      {/* Challenger's video preview */}
      <div className="mb-4">
        <p className="text-sm text-text-col/60 mb-2">
          {matchup.initiator.username}&apos;s challenge:
        </p>
        {matchup.customPrompt && (
          <p className="text-sm font-medium text-text-col mb-3">
            &quot;{matchup.customPrompt}&quot;
          </p>
        )}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video
            src={matchup.initiatorVideoUrl}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        </div>
      </div>

      {/* Duration info */}
      <p className="text-xs text-text-col/60 mb-4">
        {matchup.votingDurationHours === 24 && 'Voting will last 1 day'}
        {matchup.votingDurationHours === 72 && 'Voting will last 3 days'}
        {matchup.votingDurationHours === 168 && 'Voting will last 1 week'}
        {' after you respond.'}
      </p>

      {/* Action button */}
      <button
        onClick={() => setStep('select')}
        className="w-full py-3 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/80 transition-colors cursor-pointer"
      >
        Record Your Response
      </button>
    </div>
  );

  const renderSelect = () => (
    <div className="p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-text-col/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-col/50 transition-colors"
      >
        <Upload className="w-12 h-12 text-text-col/40 mb-3" />
        <p className="text-text-col font-medium mb-1">Select your video</p>
        <p className="text-text-col/60 text-sm">MP4, MOV, or WebM up to 100MB</p>
      </div>

      <button
        onClick={() => setStep('preview')}
        className="w-full mt-4 py-2 text-text-col/60 hover:text-text-col transition-colors cursor-pointer"
      >
        Back to challenge
      </button>
    </div>
  );

  const renderUploading = () => (
    <div className="p-8 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-accent-col border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-text-col font-medium mb-2">
        {uploadProgress < 50 ? 'Processing video...' : 'Uploading response...'}
      </p>
      <div className="w-full max-w-xs bg-bg-col rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-accent-col transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-text-col/60 text-sm mt-2">{Math.round(uploadProgress)}%</p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'crop' ? 'Trim Your Response' : 'Accept Challenge'}
      size={step === 'crop' ? 'lg' : 'md'}
    >
      {step === 'preview' && renderPreview()}
      {step === 'select' && renderSelect()}
      {step === 'crop' && selectedFile && (
        <div className="h-full">
          <VideoCropStep
            videoFile={selectedFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspectRatio={9 / 16}
            maxDuration={15}
          />
        </div>
      )}
      {step === 'uploading' && renderUploading()}
    </Modal>
  );
}
