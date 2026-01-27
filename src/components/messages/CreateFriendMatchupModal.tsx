'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';
import VideoCropStep from '@/components/common/VideoCropStep';
import {
  CreateFriendMatchupRequest,
  FriendMatchupVisibility,
  friendMatchupsApi,
} from '@/api/friendMatchups';
import { uploadApi } from '@/api/upload';
import { compressVideo, validateVideoFile } from '@/lib/compression';
import { Upload, Globe, Group } from 'iconoir-react';

interface CreateFriendMatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: number;
  responderId: number;
  responderUsername: string;
  onCreated: () => void;
}

type Step = 'settings' | 'select' | 'crop' | 'uploading';
type VotingDuration = 0 | 24 | 72 | 168;

/**
 * Modal for creating a new friend matchup challenge.
 * Allows setting custom prompt, visibility, duration, and uploading video.
 */
export default function CreateFriendMatchupModal({
  isOpen,
  onClose,
  conversationId,
  responderId,
  responderUsername,
  onCreated,
}: CreateFriendMatchupModalProps) {
  const [step, setStep] = useState<Step>('settings');
  const [customPrompt, setCustomPrompt] = useState('');
  const [visibility, setVisibility] =
    useState<FriendMatchupVisibility>('friends');
  const [votingDuration, setVotingDuration] = useState<VotingDuration>(72);
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
      const file = new File([croppedBlob], 'challenge.webm', {
        type: croppedBlob.type,
      });

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
        `challenge_${Date.now()}.mp4`,
        { type: compressedBlob.type || 'video/mp4' }
      );

      // Upload to S3
      setUploadProgress(60);
      const { fileUrl } =
        await uploadApi.uploadFriendMatchupVideo(compressedFile);

      setUploadProgress(80);

      // Create matchup
      setUploadProgress(90);
      const request: CreateFriendMatchupRequest = {
        conversationId,
        responderId,
        videoUrl: fileUrl,
        customPrompt: customPrompt.trim() || null,
        visibility,
        votingDurationHours: votingDuration,
      };
      await friendMatchupsApi.create(request);

      setUploadProgress(100);
      onCreated();
      handleClose();
    } catch (err) {
      console.error('Failed to create challenge:', err);
      setError('Failed to create challenge. Please try again.');
      setStep('settings');
    }
  };

  const handleCropCancel = () => {
    setSelectedFile(null);
    setStep('select');
  };

  const handleClose = () => {
    setStep('settings');
    setCustomPrompt('');
    setVisibility('friends');
    setVotingDuration(72);
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  const renderSettings = () => (
    <div className="p-4 space-y-6">
      {/* Intro text */}
      <p className="text-sm text-text-col/60">
        Challenge{' '}
        <span className="font-semibold text-text-col">{responderUsername}</span>{' '}
        to a 1v1 video battle!
      </p>

      {/* Custom prompt */}
      <div>
        <label className="block text-sm font-medium text-text-col mb-2">
          Challenge prompt (optional)
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g., Best crossover, Craziest dunk"
          maxLength={100}
          className="w-full px-4 py-3 bg-bg-col rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-col"
        />
        <p className="text-xs text-text-col/40 mt-1">
          {customPrompt.length}/100
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-text-col mb-2">
          Who can vote?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVisibility('friends')}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              visibility === 'friends'
                ? 'border-accent-col bg-accent-col/10'
                : 'border-text-col/10 hover:border-text-col/20'
            }`}
          >
            <Group className="w-5 h-5 mx-auto mb-1" />
            <p className="text-sm font-medium">Friends</p>
            <p className="text-xs text-text-col/60">Your friends & theirs</p>
          </button>
          <button
            onClick={() => setVisibility('public')}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              visibility === 'public'
                ? 'border-accent-col bg-accent-col/10'
                : 'border-text-col/10 hover:border-text-col/20'
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            <p className="text-sm font-medium">Public</p>
            <p className="text-xs text-text-col/60">Anyone can vote</p>
          </button>
        </div>
      </div>

      {/* Voting duration */}
      <div>
        <label className="block text-sm font-medium text-text-col mb-2">
          Voting duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setVotingDuration(0)}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              votingDuration === 0
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-orange-500/30 hover:border-orange-500/50'
            }`}
          >
            <p className="text-xs font-medium text-orange-500">1 min</p>
            <p className="text-[10px] text-orange-500/60">test</p>
          </button>
          <button
            onClick={() => setVotingDuration(24)}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              votingDuration === 24
                ? 'border-accent-col bg-accent-col/10'
                : 'border-text-col/10 hover:border-text-col/20'
            }`}
          >
            <p className="text-sm font-medium">1 Day</p>
          </button>
          <button
            onClick={() => setVotingDuration(72)}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              votingDuration === 72
                ? 'border-accent-col bg-accent-col/10'
                : 'border-text-col/10 hover:border-text-col/20'
            }`}
          >
            <p className="text-sm font-medium">3 Days</p>
          </button>
          <button
            onClick={() => setVotingDuration(168)}
            className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
              votingDuration === 168
                ? 'border-accent-col bg-accent-col/10'
                : 'border-text-col/10 hover:border-text-col/20'
            }`}
          >
            <p className="text-sm font-medium">1 Week</p>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Next button */}
      <button
        onClick={() => setStep('select')}
        className="w-full py-3 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/80 transition-colors cursor-pointer"
      >
        Select Your Video
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
        <p className="text-text-col/60 text-sm">
          MP4, MOV, or WebM up to 100MB
        </p>
      </div>

      <button
        onClick={() => setStep('settings')}
        className="w-full mt-4 py-2 text-text-col/60 hover:text-text-col transition-colors cursor-pointer"
      >
        Back to settings
      </button>
    </div>
  );

  const renderUploading = () => (
    <div className="p-8 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-accent-col border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-text-col font-medium mb-2">
        {uploadProgress < 50 ? 'Processing video...' : 'Sending challenge...'}
      </p>
      <div className="w-full max-w-xs bg-bg-col rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-accent-col transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-text-col/60 text-sm mt-2">
        {Math.round(uploadProgress)}%
      </p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'crop' ? 'Trim Your Video' : 'Create Challenge'}
      size={step === 'crop' ? 'lg' : 'md'}
    >
      {step === 'settings' && renderSettings()}
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
