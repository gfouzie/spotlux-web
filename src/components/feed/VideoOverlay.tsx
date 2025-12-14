import { User } from 'iconoir-react';
import { HighlightCreator, PromptMinimal } from '@/api/highlights';

interface VideoOverlayProps {
  creator?: HighlightCreator;
  prompt?: PromptMinimal;
}

/**
 * Video overlay component for creator and prompt info
 *
 * Displays:
 * - Creator username with icon (if provided)
 * - Prompt name (if provided)
 * - Positioned at bottom with gradient background
 */
export default function VideoOverlay({ creator, prompt }: VideoOverlayProps) {
  if (!creator && !prompt) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
      {/* Creator Info */}
      {creator?.username && (
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-white" />
          <span className="text-white font-medium">@{creator.username}</span>
        </div>
      )}

      {/* Prompt */}
      {prompt?.name && (
        <div>
          <p className="text-sm text-white/60 mb-1">Prompt</p>
          <p className="text-lg text-white font-medium">{prompt.name}</p>
        </div>
      )}
    </div>
  );
}
