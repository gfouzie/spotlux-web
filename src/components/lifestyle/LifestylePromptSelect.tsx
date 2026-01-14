'use client';

import { useState, useEffect } from 'react';
import {
  lifestyleApi,
  type LifestylePromptCategory,
  type LifestylePrompt,
} from '@/api/lifestyle';
import { NavArrowLeft, FireFlame } from 'iconoir-react';

interface LifestylePromptSelectProps {
  onBack: () => void;
  onSelectPrompt: (prompt: LifestylePrompt) => void;
}

const LifestylePromptSelect = ({
  onBack,
  onSelectPrompt,
}: LifestylePromptSelectProps) => {
  const [categories, setCategories] = useState<LifestylePromptCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lifestyleApi.getPromptsByCategory();
      setCategories(data);
    } catch (err) {
      setError('Failed to load prompts');
      console.error('Failed to load lifestyle prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: LifestylePrompt) => {
    onSelectPrompt(prompt);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted-col hover:text-text-col transition-colors"
        >
          <NavArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="text-center py-8">
          <p className="text-text-muted-col text-sm">Loading prompts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted-col hover:text-text-col transition-colors"
        >
          <NavArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="text-center py-8">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={loadPrompts}
            className="text-accent-col hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-col/50 transition-colors"
          aria-label="Back"
        >
          <NavArrowLeft className="w-5 h-5 text-text-muted-col" />
        </button>
        <h3 className="text-lg font-medium text-text-col">Select a Prompt</h3>
      </div>

      {/* Categories and prompts */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            {/* Category header */}
            <h4 className="text-xs font-semibold text-text-muted-col uppercase tracking-wider px-1">
              {category.name}
            </h4>

            {/* Prompts grid */}
            <div className="grid grid-cols-2 gap-2">
              {category.prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="flex items-center gap-3 p-3 border border-border-col rounded-lg hover:bg-bg-col/50 hover:border-accent-col/50 transition-all cursor-pointer text-left"
                >
                  {/* Emoji */}
                  <span className="text-2xl flex-shrink-0">
                    {prompt.emoji || '📝'}
                  </span>

                  {/* Name and streak */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-col truncate">
                      {prompt.name}
                    </div>

                    {/* Streak indicator */}
                    {prompt.currentStreak !== undefined &&
                      prompt.currentStreak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <FireFlame className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-500 font-medium">
                            {prompt.currentStreak}
                          </span>
                        </div>
                      )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-muted-col text-sm">
            No prompts available. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default LifestylePromptSelect;
