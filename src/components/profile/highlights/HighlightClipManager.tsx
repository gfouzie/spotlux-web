'use client';

import { useState, useCallback } from 'react';
import { Highlight, highlightsApi } from '@/api/highlights';
import { HighlightReel } from '@/api/highlightReels';
import Button from '@/components/common/Button';
import { Plus, VideoCamera, Trash } from 'iconoir-react';
import Alert from '@/components/common/Alert';

interface HighlightClipManagerProps {
  reel: HighlightReel;
  onUploadClick: () => void;
  onReload: () => void;
}

export default function HighlightClipManager({
  reel,
  onUploadClick,
  onReload,
}: HighlightClipManagerProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadHighlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const highlights = await highlightsApi.getHighlightsByReel(reel.id);
      // Sort by order_index
      const sorted = highlights?.sort((a, b) => a.orderIndex - b.orderIndex);
      setHighlights(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load highlights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [reel.id]);

  const handleDelete = async (highlightId: number) => {
    if (!confirm('Are you sure you want to delete this clip?')) return;

    setDeletingId(highlightId);
    try {
      await highlightsApi.deleteHighlight(highlightId);
      await loadHighlights();
      onReload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete highlight'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-col/60">Loading clips...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-col">
          Manage Clips ({highlights?.length})
        </h3>
        <Button onClick={onUploadClick} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Clips
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {highlights?.length === 0 ? (
        <div className="text-center py-12 bg-bg-col/30 rounded-lg border border-bg-col">
          <VideoCamera className="w-16 h-16 text-text-col/20 mx-auto mb-4" />
          <p className="text-text-col/60 mb-4">No clips yet</p>
          <Button onClick={onUploadClick}>
            <Plus className="w-4 h-4 mr-2" />
            Upload First Clip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {highlights?.map((highlight, index) => (
            <div
              key={highlight.id}
              className="relative group bg-bg-col/30 rounded-lg overflow-hidden border border-bg-col hover:border-accent-col/50 transition-colors"
            >
              {/* Video Thumbnail */}
              <div className="aspect-[9/16] bg-black relative">
                <video
                  src={highlight.videoUrl}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(highlight.id)}
                    isLoading={deletingId === highlight.id}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {/* Clip number badge */}
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium">
                  #{index + 1}
                </div>
              </div>

              {/* Prompt Info */}
              {highlight?.promptName && (
                <div className="p-2 bg-card-col">
                  <p className="text-xs text-text-col/80 truncate">
                    {highlight?.promptName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
