'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { useUser } from '@/contexts/UserContext';
import { highlightReelsApi, type HighlightReel } from '@/api/highlightReels';
import { type LifestylePrompt, type LifestylePostMinimal } from '@/api/lifestyle';
import { Play, EditPencil } from 'iconoir-react';
import LifestylePromptSelect from '@/components/lifestyle/LifestylePromptSelect';
import LifestylePostCreate from '@/components/lifestyle/LifestylePostCreate';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHighlightUpload?: (reelId: number, sport: string) => void;
}

type ModalStep =
  | 'select-type'
  | 'select-reel'
  | 'lifestyle-select-prompt'
  | 'lifestyle-create-post';

const PostModal = ({ isOpen, onClose, onOpenHighlightUpload }: PostModalProps) => {
  const { user } = useUser();
  const [step, setStep] = useState<ModalStep>('select-type');

  // Highlight state
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null);
  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [isLoadingReels, setIsLoadingReels] = useState(false);

  // Lifestyle state
  const [selectedPrompt, setSelectedPrompt] = useState<LifestylePrompt | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select-type');
      setSelectedSport('');
      setSelectedReelId(null);
      setReels([]);
      setIsLoadingReels(false);
      setSelectedPrompt(null);
    }
  }, [isOpen]);

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // ============================================================
  // Highlight Flow Handlers
  // ============================================================

  const handleSelectHighlight = async () => {
    if (!user?.id) return;

    setIsLoadingReels(true);
    setStep('select-reel');

    try {
      const userReels = await highlightReelsApi.getHighlightReels({
        userId: user.id,
      });
      setReels(userReels);

      if (userReels.length > 0) {
        const uniqueSports = Array.from(new Set(userReels.map((r) => r.sport)));
        const firstSport = uniqueSports[0];
        setSelectedSport(firstSport);

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

    // Call the parent's callback to open the HighlightUploadModal
    if (onOpenHighlightUpload) {
      onOpenHighlightUpload(selectedReelId, selectedSport);
    }

    // Close this modal
    onClose();
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    const firstReelInSport = reels.find((r) => r.sport === sport);
    setSelectedReelId(firstReelInSport?.id || null);
  };

  // ============================================================
  // Lifestyle Flow Handlers
  // ============================================================

  const handleSelectLifestyle = () => {
    setStep('lifestyle-select-prompt');
  };

  const handlePromptSelected = (prompt: LifestylePrompt) => {
    setSelectedPrompt(prompt);
    setStep('lifestyle-create-post');
  };

  const handlePostCreated = () => {
    // Post is already saved to DB and automatically visible in feed
    // Close the modal
    onClose();
  };

  const handleBackToType = () => {
    setStep('select-type');
    setSelectedSport('');
    setReels([]);
    setSelectedReelId(null);
    setSelectedPrompt(null);
  };

  const handleBackToPromptSelect = () => {
    setSelectedPrompt(null);
    setStep('lifestyle-select-prompt');
  };

  // ============================================================
  // Derived Values
  // ============================================================

  const sportOptions = Array.from(new Set(reels.map((r) => r.sport))).map(
    (sport) => ({
      value: sport,
      label: sport.charAt(0).toUpperCase() + sport.slice(1),
    })
  );

  const filteredReels = reels.filter((r) => r.sport === selectedSport);
  const reelOptions = filteredReels.map((reel) => ({
    value: reel.id.toString(),
    label: reel.name,
  }));

  // Modal title based on step
  const getModalTitle = () => {
    switch (step) {
      case 'select-type':
        return 'Create Post';
      case 'select-reel':
        return 'Select Highlight Reel';
      case 'lifestyle-select-prompt':
        return 'Log Activity';
      case 'lifestyle-create-post':
        return 'Log Activity';
      default:
        return 'Create Post';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="md"
      showFooter={false}
    >
      <div className="space-y-6">
        {/* Step 1: Select Type */}
        {step === 'select-type' && (
          <>
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

              {/* Lifestyle Option */}
              <button
                onClick={handleSelectLifestyle}
                className="w-full flex items-center gap-3 p-4 border border-border-col rounded-lg hover:bg-bg-col/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-accent-col/10 flex items-center justify-center">
                  <EditPencil className="w-5 h-5 text-accent-col" strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-text-col">
                    Lifestyle Post
                  </div>
                  <div className="text-xs text-text-muted-col">
                    Track your daily routine and build streaks
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step: Select Highlight Reel */}
        {step === 'select-reel' && (
          <>
            {isLoadingReels && (
              <div className="text-center py-6">
                <p className="text-text-muted-col text-sm">
                  Loading your reels...
                </p>
              </div>
            )}

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

            {!isLoadingReels && reels.length > 0 && (
              <>
                <div className="space-y-4">
                  <Select
                    label="Sport"
                    value={selectedSport}
                    onChange={(e) => handleSportChange(e.target.value)}
                    options={sportOptions}
                  />

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

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleBackToType}
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

        {/* Lifestyle: Select Prompt */}
        {step === 'lifestyle-select-prompt' && (
          <LifestylePromptSelect
            onBack={handleBackToType}
            onSelectPrompt={handlePromptSelected}
          />
        )}

        {/* Lifestyle: Create Post */}
        {step === 'lifestyle-create-post' && selectedPrompt && (
          <LifestylePostCreate
            prompt={selectedPrompt}
            onBack={handleBackToPromptSelect}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </Modal>
  );
};

export default PostModal;
