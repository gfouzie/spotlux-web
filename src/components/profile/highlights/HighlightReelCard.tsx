'use client';

import Image from 'next/image';
import { HighlightReel } from '@/api/highlightReels';
import { cn } from '@/lib/utils';
import { VideoCamera, Settings } from 'iconoir-react';

interface HighlightReelCardProps {
  reel: HighlightReel;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  isOwner?: boolean;
  className?: string;
}

export default function HighlightReelCard({
  reel,
  onClick,
  onEdit,
  isOwner = false,
  className,
}: HighlightReelCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 cursor-pointer group',
        className
      )}
    >
      {/* Thumbnail Circle */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-accent-col relative z-0">
          <div className="relative w-full h-full rounded-full bg-bg-col p-0.5 overflow-hidden">
            {reel.thumbnailUrl ? (
              reel.thumbnailUrl.match(/\.(mp4|mov|webm)$/i) ? (
                <video
                  src={`${reel.thumbnailUrl}#t=0.1`}
                  className="w-full h-full rounded-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={reel.thumbnailUrl}
                  alt={reel.name}
                  fill
                  sizes="80px"
                  className="rounded-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full rounded-full bg-card-col flex items-center justify-center">
                <VideoCamera className="w-8 h-8 text-text-col/40" />
              </div>
            )}
          </div>
        </div>

        {/* Edit Button (owner only, shows on hover) */}
        {isOwner && onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-black/80 hover:bg-black rounded-full flex items-center justify-center transition-opacity shadow-lg border border-white/20 cursor-pointer z-10"
            title="Edit reel"
          >
            <Settings className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      {/* Reel Name */}
      <div className="text-center">
        <p className="text-xs text-text-col/80 font-medium truncate max-w-[80px] group-hover:text-text-col transition-colors">
          {reel.name}
        </p>
      </div>
    </div>
  );
}
