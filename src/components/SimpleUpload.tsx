'use client';

import { useState, useRef } from 'react';
import Button from '@/components/common/Button';
import { uploadApi } from '@/api/upload';
import { ApiError } from '@/api/shared';

interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

const SimpleUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadApi.uploadProfilePicture(file);
      setUploadResult({
        success: true,
        fileUrl: result.profileImageUrl,
      });
    } catch (error) {
      console.error('Upload error:', error);

      if (error instanceof ApiError) {
        setUploadResult({ success: false, error: error.message });
      } else {
        setUploadResult({ success: false, error: 'Upload failed' });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-bg-col/50 backdrop-blur-sm rounded-xl border border-text-col/20 p-6 max-w-md mx-auto">
      <h3 className="mb-4">
        Simple S3 Upload
      </h3>

      <div className="space-y-4">
        <div className="bg-bg-col/30 p-3 rounded">
          <p className="text-sm text-text-col">
            <strong>Upload Type:</strong> Profile Picture
          </p>
          <p className="text-xs text-text-col/60 mt-1">
            This demo only supports profile picture uploads. Other upload types
            require additional context (reel IDs, etc.)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Select File'}
        </Button>

        {uploadResult && (
          <div className="mt-4 p-4 bg-bg-col/30 rounded-lg">
            {!uploadResult.success ? (
              <p className="text-red-400">Error: {uploadResult.error}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-green-400">✅ Upload successful!</p>
                <p className="text-sm text-text-col/70">
                  <strong>Type:</strong> profile_picture
                </p>
                {uploadResult.fileUrl && (
                  <>
                    <p className="text-sm text-text-col/70 break-all">
                      <strong>URL:</strong> {uploadResult.fileUrl}
                    </p>
                    <a
                      href={uploadResult.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-col hover:underline text-sm inline-block"
                    >
                      View File →
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleUpload;
