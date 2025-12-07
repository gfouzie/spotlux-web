'use client';

import { HighlightReel } from '@/api/highlightReels';
import HighlightReelCard from './HighlightReelCard';
import { Plus } from 'iconoir-react';
import { cn } from '@/lib/utils';

interface HighlightReelGridProps {
  reels: HighlightReel[];
  onReelClick: (reel: HighlightReel) => void;
  onCreateReel?: () => void;
  onEditReel?: (reel: HighlightReel) => void;
  isOwner?: boolean;
  className?: string;
}

export default function HighlightReelGrid({
  reels,
  onReelClick,
  onCreateReel,
  onEditReel,
  isOwner = false,
  className,
}: HighlightReelGridProps) {
  if (reels?.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pt-3 pb-2 px-1">
        {/* Create New Reel Button (only for owner) */}
        {isOwner && onCreateReel && (
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={onCreateReel}
              className="cursor-pointer w-20 h-20 rounded-full border-2 border-dashed border-text-col/30 hover:border-accent-col hover:bg-accent-col/10 transition-colors flex items-center justify-center group"
            >
              <Plus className="w-8 h-8 text-text-col/40 group-hover:text-accent-col transition-colors" />
            </button>
            <p className="text-xs text-text-col/60 font-medium">New Reel</p>
          </div>
        )}

        {/* Highlight Reels */}
        {reels?.map((reel) => (
          <HighlightReelCard
            key={reel.id}
            reel={reel}
            onClick={() => onReelClick(reel)}
            onEdit={onEditReel ? () => onEditReel(reel) : undefined}
            isOwner={isOwner}
            className="flex-shrink-0"
          />
        ))}

        {/* Empty State for Owner */}
        {reels?.length === 0 && isOwner && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-text-col/60">
              Create your first highlight reel to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
