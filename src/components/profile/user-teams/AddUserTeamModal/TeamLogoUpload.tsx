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
      <div className="flex flex-col items-center gap-4">
        {/* Preview */}
        <div className="flex-shrink-0 relative">
          {displayPreview ? (
            <>
              <label
                htmlFor="team-logo-upload"
                className="cursor-pointer block w-24 h-24 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              >
                <Image
                  src={displayPreview}
                  alt="Team logo preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover border-2 border-accent-col rounded-full"
                />
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="cursor-pointer absolute -top-0 -right-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                aria-label="Remove logo"
              >
                <span className="text-lg font-light leading-none">−</span>
              </button>
            </>
          ) : (
            <label
              htmlFor="team-logo-upload"
              className="cursor-pointer w-20 h-20 rounded-full bg-bg-col border border-text-col/20 flex items-center justify-center text-text-col/40 hover:bg-bg-col/50 hover:border-accent-col transition-colors"
            >
              <span className="text-4xl font-light">+</span>
            </label>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="team-logo-upload"
          />

          <label
            htmlFor="team-logo-upload"
            className="cursor-pointer text-accent-col text-sm font-bold"
          >
            {displayPreview ? 'Change Team Logo' : 'Add Team Logo'}
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default TeamLogoUpload;
