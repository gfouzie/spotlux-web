'use client';

import { useState, useEffect, useCallback } from 'react';
import { HighlightReel, highlightReelsApi } from '@/api/highlightReels';
import { Highlight, highlightsApi } from '@/api/highlights';
import HighlightReelGrid from './HighlightReelGrid';
import CreateReelModal from './CreateReelModal';
import EditReelModal from './EditReelModal';
import HighlightUploadModal from './HighlightUploadModal';
import StoryViewer from './StoryViewer';
import HighlightClipManager from './HighlightClipManager';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import LoadingState from '@/components/common/LoadingState';

interface HighlightProfileContentProps {
  sport: string;
  isOwner: boolean;
}

export default function HighlightProfileContent({
  sport,
  isOwner,
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
  const [showClipManager, setShowClipManager] = useState(false);

  const loadReels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reels = await highlightReelsApi.getHighlightReels({
        offset: 0,
        limit: 100,
        sport,
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
  }, [sport]);

  useEffect(() => {
    loadReels();
  }, [sport, loadReels]);

  const handleReelClick = async (reel: HighlightReel) => {
    try {
      const highlights = await highlightsApi.getHighlightsByReel(reel.id);
      const sorted = highlights?.sort((a, b) => a.orderIndex - b.orderIndex);

      if (sorted.length === 0) {
        // No clips yet - if owner, show clip manager
        if (isOwner) {
          setSelectedReel(reel);
          setShowClipManager(true);
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
    setShowClipManager(false);
  };

  const handleOpenUploadModal = (reel: HighlightReel) => {
    setSelectedReel(reel);
    setShowUploadModal(true);
  };

  const handleEditReel = (reel: HighlightReel) => {
    setSelectedReel(reel);
    setShowEditReelModal(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      {isOwner && reels?.length > 0 && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setShowCreateReelModal(true)}>
            Create Reel
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            Upload Highlights
          </Button>
        </div>
      )}

      {/* Highlight Reels Grid */}
      <div>
        <h2 className="text-2xl font-bold text-text-col mb-6">
          Highlight Reels
        </h2>
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

      {/* Clip Manager (only shown when owner clicks empty reel) */}
      {showClipManager && selectedReel && (
        <div className="bg-card-col rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-text-col">
              {selectedReel?.name}
            </h3>
            <button
              type="button"
              onClick={() => setShowClipManager(false)}
              className="text-text-col/60 hover:text-text-col cursor-pointer"
            >
              Close
            </button>
          </div>
          <HighlightClipManager
            reel={selectedReel}
            onUploadClick={() => handleOpenUploadModal(selectedReel)}
            onReload={loadReels}
          />
        </div>
      )}

      {/* Create Reel Modal */}
      <CreateReelModal
        isOpen={showCreateReelModal}
        onClose={() => setShowCreateReelModal(false)}
        onSuccess={handleCreateReelSuccess}
        sport={sport}
      />

      {/* Edit Reel Modal */}
      {selectedReel && (
        <EditReelModal
          isOpen={showEditReelModal}
          onClose={() => setShowEditReelModal(false)}
          onSuccess={handleEditReelSuccess}
          reel={selectedReel}
        />
      )}

      {/* Upload Highlights Modal */}
      <HighlightUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        reelId={selectedReel?.id}
        reels={reels?.map((r) => ({ id: r.id, name: r.name }))}
        sport={sport}
      />

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
  );
}
