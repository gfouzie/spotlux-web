'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { useUser } from '@/contexts/UserContext';
import { highlightReelsApi, type HighlightReel } from '@/api/highlightReels';
import { Play } from 'iconoir-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostModal = ({ isOpen, onClose }: PostModalProps) => {
  const { user } = useUser();
  const [step, setStep] = useState<'select-type' | 'select-reel'>('select-type');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null);
  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [isLoadingReels, setIsLoadingReels] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select-type');
      setSelectedSport('');
      setSelectedReelId(null);
      setReels([]);
      setIsLoadingReels(false);
    }
  }, [isOpen]);

  const handleSelectHighlight = async () => {
    if (!user?.id) return;

    // Load reels and move to next step
    setIsLoadingReels(true);
    setStep('select-reel');

    try {
      const userReels = await highlightReelsApi.getHighlightReels({
        userId: user.id,
      });
      setReels(userReels);

      if (userReels.length > 0) {
        // Get unique sports and select first one
        const uniqueSports = Array.from(new Set(userReels.map((r) => r.sport)));
        const firstSport = uniqueSports[0];
        setSelectedSport(firstSport);

        // Select first reel from that sport
        const firstReelInSport = userReels.find((r) => r.sport === firstSport);
        if (firstReelInSport) {
          setSelectedReelId(firstReelInSport.id);
        }
      }
    } catch (error) {
      console.error('Failed to load reels:', error);
    } finally {
      setIsLoadingReels(false);
    }
  };

  const handleCreateHighlight = () => {
    if (!selectedReelId) return;
    // TODO: Open HighlightUploadModal (pass reel ID)
    // For now, just close modal
    onClose();
    // Future: Open highlight upload flow
  };

  const handleBack = () => {
    setStep('select-type');
    setSelectedSport('');
    setReels([]);
    setSelectedReelId(null);
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    // Reset reel selection and auto-select first reel in new sport
    const firstReelInSport = reels.find((r) => r.sport === sport);
    setSelectedReelId(firstReelInSport?.id || null);
  };

  // Get unique sports from reels
  const sportOptions = Array.from(new Set(reels.map((r) => r.sport))).map(
    (sport) => ({
      value: sport,
      label: sport.charAt(0).toUpperCase() + sport.slice(1),
    })
  );

  // Filter reels by selected sport
  const filteredReels = reels.filter((r) => r.sport === selectedSport);
  const reelOptions = filteredReels.map((reel) => ({
    value: reel.id.toString(),
    label: reel.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'select-type' ? 'Create Post' : 'Select Highlight Reel'}
      size="md"
      showFooter={false}
    >
      <div className="space-y-6">
        {step === 'select-type' && (
          <>
            {/* Post Type Selection */}
            <div>
              <h3 className="text-sm font-medium text-text-col mb-3">
                What do you want to post?
              </h3>
              <div className="space-y-2">
                {/* Highlight Option */}
                <button
                  onClick={handleSelectHighlight}
                  className="w-full flex items-center gap-3 p-4 border border-border-col rounded-lg hover:bg-bg-col/50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-col/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-accent-col" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-text-col">
                      Video Highlight
                    </div>
                    <div className="text-xs text-text-muted-col">
                      Upload a clip to your highlight reel
                    </div>
                  </div>
                </button>

                {/* Lifestyle Option (Coming Soon) */}
                <button
                  disabled
                  className="w-full flex items-center gap-3 p-4 border border-border-col rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-bg-col/50 flex items-center justify-center">
                    <span className="text-lg">📝</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-text-col">
                      Lifestyle Post
                    </div>
                    <div className="text-xs text-text-muted-col">
                      Coming soon - Share your daily routine
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'select-reel' && (
          <>
            {/* Loading state */}
            {isLoadingReels && (
              <div className="text-center py-6">
                <p className="text-text-muted-col text-sm">
                  Loading your reels...
                </p>
              </div>
            )}

            {/* No reels message */}
            {!isLoadingReels && reels.length === 0 && (
              <div className="text-center py-6">
                <p className="text-text-muted-col text-sm mb-4">
                  You need to create a highlight reel first
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    window.location.href = '/profile';
                  }}
                >
                  Go to Profile
                </Button>
              </div>
            )}

            {/* Reel Selection */}
            {!isLoadingReels && reels.length > 0 && (
              <>
                <div className="space-y-4">
                  {/* Sport Selection */}
                  <Select
                    label="Sport"
                    value={selectedSport}
                    onChange={(e) => handleSportChange(e.target.value)}
                    options={sportOptions}
                  />

                  {/* Reel Selection (filtered by sport) */}
                  {selectedSport && (
                    <Select
                      label="Highlight Reel"
                      value={selectedReelId?.toString() || ''}
                      onChange={(e) =>
                        setSelectedReelId(Number(e.target.value))
                      }
                      options={reelOptions}
                    />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCreateHighlight}
                    disabled={!selectedReelId}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default PostModal;
