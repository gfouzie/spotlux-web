'use client';

import { useState, useEffect, useCallback } from 'react';
import { HighlightReel, highlightReelsApi } from '@/api/highlightReels';
import { Highlight, highlightsApi } from '@/api/highlights';
import HighlightReelGrid from './HighlightReelGrid';
import CreateReelModal from './CreateReelModal';
import EditReelModal from './EditReelModal';
import HighlightUploadModal from './HighlightUploadModal';
import StoryViewer from './StoryViewer';
import Alert from '@/components/common/Alert';
import LoadingState from '@/components/common/LoadingState';
import AddButton from '@/components/common/AddButton';

interface HighlightProfileContentProps {
  sport: string;
  isOwner: boolean;
  userId?: number; // Optional: if provided, fetches reels for this user
}

export default function HighlightProfileContent({
  sport,
  isOwner,
  userId,
}: HighlightProfileContentProps) {
  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateReelModal, setShowCreateReelModal] = useState(false);
  const [showEditReelModal, setShowEditReelModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState<HighlightReel | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [viewerHighlights, setViewerHighlights] = useState<Highlight[]>([]);

  const loadReels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reels = await highlightReelsApi.getHighlightReels({
        offset: 0,
        limit: 100,
        sport,
        userId, // Include userId filter if provided
      });
      // Sort by order_ranking
      const sorted = reels?.sort((a, b) => a.orderRanking - b.orderRanking);
      setReels(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load highlight reels'
      );
    } finally {
      setIsLoading(false);
    }
  }, [sport, userId]);

  useEffect(() => {
    loadReels();
  }, [sport, loadReels]);

  const handleReelClick = async (reel: HighlightReel) => {
    try {
      const highlights = await highlightsApi.getHighlightsByReel(reel.id);
      const sorted = highlights?.sort((a, b) => a.orderIndex - b.orderIndex);

      if (sorted.length === 0) {
        if (isOwner) {
          handleEditReel(reel);
        } else {
          setError('This reel has no clips yet');
        }
      } else {
        // Show story viewer
        setViewerHighlights(sorted);
        setSelectedReel(reel);
        setShowStoryViewer(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load highlights'
      );
    }
  };

  const handleCreateReelSuccess = () => {
    loadReels();
  };

  const handleEditReelSuccess = () => {
    loadReels();
  };

  const handleUploadSuccess = () => {
    loadReels();
  };

  const handleEditReel = (reel: HighlightReel) => {
    setSelectedReel(reel);
    setShowEditReelModal(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }
  // Hide section if no reels and not owner
  if (!isOwner && reels.length === 0) {
    return null;
  }

  return (
    <div className="bg-card-col rounded-lg p-6">
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-col">Highlights</h2>
          {isOwner && (
            <AddButton
              onClick={() => setShowUploadModal(true)}
              ariaLabel="Add highlight reel"
            />
          )}
        </div>

        {/* Highlight Reels Grid */}
        <div>
          <HighlightReelGrid
            reels={reels}
            onReelClick={handleReelClick}
            onCreateReel={
              isOwner ? () => setShowCreateReelModal(true) : undefined
            }
            onEditReel={isOwner ? handleEditReel : undefined}
            isOwner={isOwner}
          />
        </div>

        {/* Create Reel Modal */}
        {isOwner && (
          <CreateReelModal
            isOpen={showCreateReelModal}
            onClose={() => setShowCreateReelModal(false)}
            onSuccess={handleCreateReelSuccess}
            sport={sport}
          />
        )}

        {/* Edit Reel Modal */}
        {isOwner && selectedReel && (
          <EditReelModal
            isOpen={showEditReelModal}
            onClose={() => setShowEditReelModal(false)}
            onSuccess={handleEditReelSuccess}
            reel={selectedReel}
          />
        )}

        {/* Upload Highlights Modal */}
        {isOwner && (
          <HighlightUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={handleUploadSuccess}
            reelId={selectedReel?.id}
            reels={reels?.map((r) => ({ id: r.id, name: r.name }))}
            sport={sport}
          />
        )}

        {/* Story Viewer */}
        {showStoryViewer && selectedReel && (
          <StoryViewer
            highlights={viewerHighlights}
            reelName={selectedReel?.name}
            onClose={() => {
              setShowStoryViewer(false);
              setSelectedReel(null);
              setViewerHighlights([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
