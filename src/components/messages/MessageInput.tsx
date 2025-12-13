'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import Image from 'next/image';
import { uploadApi } from '@/api/upload';
import {
  compressImage,
  validateImageFile,
} from '@/lib/compression/imageCompression';
import Button from '@/components/common/Button';
import { Send, MediaImage, Xmark } from 'iconoir-react';

interface MessageInputProps {
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput = ({
  onSendMessage,
  onTypingChange,
  disabled = false,
}: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle typing indicator
  const handleTypingChange = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTypingChange(typing);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Start typing indicator
    if (value.trim() && !isTyping) {
      handleTypingChange(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of no typing
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingChange(false);
      }, 2000);
    } else {
      handleTypingChange(false);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Invalid image file');
      return;
    }

    try {
      // Compress image
      setIsUploading(true);
      const result = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        quality: 0.85,
      });

      setSelectedImage(result.compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(result.compressedFile);
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedContent = content.trim();
    if ((!trimmedContent && !selectedImage) || disabled || isUploading) return;

    try {
      setIsUploading(true);
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        const uploadResult = await uploadApi.uploadMessageImage(selectedImage);
        imageUrl = uploadResult.fileUrl;
      }

      // Send message with optional image URL
      onSendMessage(trimmedContent || ' ', imageUrl);

      // Reset state
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      handleTypingChange(false);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-text-col/10 flex-shrink-0">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <div className="relative max-h-32 rounded-lg border border-text-col/10 overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              width={200}
              height={128}
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <Xmark width={16} height={16} />
          </button>
        </div>
      )}

      <div className="flex gap-3 items-center">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Image button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || !!selectedImage}
          className="h-12 w-12 cursor-pointer flex items-center justify-center rounded-lg hover:bg-bg-col/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Attach image"
          type="button"
        >
          <MediaImage width={20} height={20} />
        </button>

        {/* Text input */}
        <div className="flex-grow relative flex items-center">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isUploading}
            rows={1}
            className="w-full px-4 py-3 bg-bg-col rounded-lg resize-none max-h-32 min-h-12 leading-6 focus:outline-none focus:ring-2 focus:ring-accent-col disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 bottom-3 text-xs text-text-col/40">
            {content.length > 0 && `${content.length}/1000`}
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || isUploading}
          variant="secondary"
          size="md"
          className="h-12 w-12 flex-shrink-0"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send width={20} height={20} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
