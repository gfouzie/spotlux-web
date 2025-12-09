'use client';

import React, { useRef, useState } from 'react';
import { validateImageFile } from '@/lib/compression';
import Image from 'next/image';

interface TeamLogoUploadProps {
  onLogoChange: (file: File | null) => void;
  previewUrl?: string | null;
  error?: string;
}

const TeamLogoUpload: React.FC<TeamLogoUploadProps> = ({
  onLogoChange,
  previewUrl,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        onLogoChange(null);
        setLocalPreview(null);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      onLogoChange(file);
    }
  };

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPreview = localPreview || previewUrl;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-col mb-2">
        Team Logo
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          {displayPreview ? (
            <Image
              src={displayPreview}
              alt="Team logo preview"
              width={80}
              height={80}
              className="rounded-lg object-cover border border-text-col/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-bg-col border border-text-col/20 flex items-center justify-center text-text-col/40">
              <span className="text-2xl">🏆</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="team-logo-upload"
          />

          <div className="flex gap-2">
            <label
              htmlFor="team-logo-upload"
              className="cursor-pointer px-4 py-2 bg-accent-col text-text-col rounded-lg hover:opacity-80 transition-opacity text-sm font-medium"
            >
              {displayPreview ? 'Change Logo' : 'Upload Logo'}
            </label>

            {displayPreview && (
              <button
                type="button"
                onClick={handleRemove}
                className="cursor-pointer px-4 py-2 bg-bg-col text-text-col/70 rounded-lg hover:bg-bg-col/50 transition-colors text-sm font-medium"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-text-col/50 mt-2">
            JPEG, PNG, GIF, or WebP • Max 10MB
          </p>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default TeamLogoUpload;
