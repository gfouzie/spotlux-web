'use client';

import { useState } from 'react';
import { NavArrowLeft, MediaImage, Xmark } from 'iconoir-react';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { lifestyleApi, type LifestylePrompt, type LifestylePostMinimal } from '@/api/lifestyle';

interface LifestylePostCreateProps {
  prompt: LifestylePrompt;
  onBack: () => void;
  onPostCreated: (post: LifestylePostMinimal) => void;
}

const LifestylePostCreate = ({ prompt, onBack, onPostCreated }: LifestylePostCreateProps) => {
  const [textContent, setTextContent] = useState('');
  const [timeContent, setTimeContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'friends_only' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current time for default value
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageFile(null);
  };

  // Validate content based on prompt type
  const isValid = () => {
    if (prompt.promptType === 'time') {
      return timeContent.trim() !== '';
    }
    if (prompt.promptType === 'text') {
      return textContent.trim() !== '';
    }
    // text_image: need either text or image
    return textContent.trim() !== '' || imageFile !== null;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isValid()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get browser timezone offset
      const timezoneOffset = new Date().getTimezoneOffset();

      // TODO: If imageFile exists, upload to S3 first and get URL
      // For now, we'll skip image upload and just send the post data
      let uploadedImageUrl: string | undefined;
      if (imageFile) {
        // Placeholder - implement image upload later
        // uploadedImageUrl = await uploadLifestyleImage(imageFile);
        console.log('Image upload not yet implemented');
      }

      // Create the post
      const post = await lifestyleApi.createPost({
        promptId: prompt.id,
        textContent: textContent.trim() || undefined,
        timeContent: prompt.promptType === 'time' ? `${timeContent}:00` : undefined,
        imageUrl: uploadedImageUrl,
        visibility,
        timezoneOffset,
      });

      onPostCreated(post);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to add to day. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-col/50 transition-colors"
          aria-label="Back"
        >
          <NavArrowLeft className="w-5 h-5 text-text-muted-col" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{prompt.emoji || '📝'}</span>
          <h3 className="text-lg font-medium text-text-col">{prompt.name}</h3>
        </div>
      </div>

      {/* Visibility Selector */}
      <div>
        <Select
          label="Who can see this?"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as 'public' | 'friends_only' | 'private')}
          options={[
            { value: 'public', label: 'Public' },
            { value: 'friends_only', label: 'Friends Only' },
            { value: 'private', label: 'Private' },
          ]}
        />
      </div>

      {/* Content input based on prompt type */}
      <div className="space-y-4">
        {/* Time input */}
        {prompt.promptType === 'time' && (
          <div>
            <label className="block text-sm font-medium text-text-col mb-2">
              What time?
            </label>
            <input
              type="time"
              value={timeContent || getCurrentTimeString()}
              onChange={(e) => setTimeContent(e.target.value)}
              className="w-full px-4 py-3 bg-bg-col border border-border-col rounded-lg text-text-col text-lg focus:outline-none focus:ring-2 focus:ring-accent-col focus:border-transparent"
            />
          </div>
        )}

        {/* Text input */}
        {(prompt.promptType === 'text' || prompt.promptType === 'text_image') && (
          <div>
            <label className="block text-sm font-medium text-text-col mb-2">
              {prompt.description || 'Share your thoughts'}
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write something..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-bg-col border border-border-col rounded-lg text-text-col placeholder:text-text-muted-col resize-none focus:outline-none focus:ring-2 focus:ring-accent-col focus:border-transparent"
            />
            <div className="text-right text-xs text-text-muted-col mt-1">
              {textContent.length}/500
            </div>
          </div>
        )}

        {/* Image input */}
        {prompt.promptType === 'text_image' && (
          <div>
            {!imageUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-col rounded-lg cursor-pointer hover:border-accent-col/50 transition-colors">
                <MediaImage className="w-8 h-8 text-text-muted-col mb-2" />
                <span className="text-sm text-text-muted-col">
                  Add a photo (optional)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Selected"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Remove image"
                >
                  <Xmark className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={!isValid() || isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        Add to Day
      </Button>
    </div>
  );
};

export default LifestylePostCreate;
