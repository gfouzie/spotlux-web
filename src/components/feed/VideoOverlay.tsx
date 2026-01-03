import { HighlightCreator, PromptMinimal } from '@/api/highlights';

interface VideoOverlayProps {
  creator?: HighlightCreator;
  prompt?: PromptMinimal;
}

/**
 * Video overlay component for creator and prompt info
 *
 * Displays:
 * - Creator username (if provided)
 * - Prompt name (if provided)
 * - Positioned at bottom with gradient background
 */
export default function VideoOverlay({ creator, prompt }: VideoOverlayProps) {
  if (!creator && !prompt) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
      {/* Creator Info */}
      {creator?.username && (
        <div className="mb-3">
          <span className="text-white font-medium">@{creator.username}</span>
          {prompt?.name && (
            <span className="text-white font-medium"> - {prompt.name}</span>
          )}
        </div>
      )}
    </div>
  );
}
