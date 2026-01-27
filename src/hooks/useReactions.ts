import { useState, useEffect, useCallback } from 'react';
import {
  reactionsApi,
  ContentReactions,
  EmojiId,
  ReactionSummary,
  ContentType,
} from '@/api/reactions';

interface UseReactionsReturn {
  reactions: ReactionSummary[];
  userReaction: EmojiId | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  addReaction: (emojiId: EmojiId) => Promise<void>;
  removeReaction: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useReactions(
  contentType: ContentType,
  contentId: number | null
): UseReactionsReturn {
  const [data, setData] = useState<ContentReactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    if (!contentId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reactionsData = await reactionsApi.getReactions(contentType, contentId);
      setData(reactionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reactions');
      console.error('Failed to fetch reactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  // Fetch on mount and when contentType/contentId changes
  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Add or update reaction with optimistic update
  const addReaction = useCallback(
    async (emojiId: EmojiId) => {
      if (!contentId || !data) return;

      // Store previous state for rollback
      const previousData = { ...data };

      try {
        // Optimistic update
        const newReactions = [...data.reactions];
        const existingIndex = newReactions.findIndex((r) => r.emoji === emojiId);
        const previousUserReaction = data.userReaction;

        // Remove previous user reaction if it exists
        if (previousUserReaction) {
          const prevIndex = newReactions.findIndex(
            (r) => r.emoji === previousUserReaction
          );
          if (prevIndex !== -1) {
            newReactions[prevIndex] = {
              ...newReactions[prevIndex],
              count: newReactions[prevIndex].count - 1,
              userReacted: false,
            };
            // Remove if count is now 0
            if (newReactions[prevIndex].count === 0) {
              newReactions.splice(prevIndex, 1);
            }
          }
        }

        // Add or increment new reaction
        if (existingIndex !== -1) {
          newReactions[existingIndex] = {
            ...newReactions[existingIndex],
            count: newReactions[existingIndex].count + 1,
            userReacted: true,
          };
        } else {
          newReactions.push({
            emoji: emojiId,
            count: 1,
            userReacted: true,
          });
        }

        // Sort by count descending
        newReactions.sort((a, b) => b.count - a.count);

        // Calculate new total count
        const totalCount = newReactions.reduce((sum, r) => sum + r.count, 0);

        // Update state optimistically
        setData({
          contentType: contentType,
          contentId,
          reactions: newReactions,
          userReaction: emojiId,
          totalCount,
        });

        // Make API call
        await reactionsApi.addReaction(contentType, contentId, emojiId);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err instanceof Error ? err.message : 'Failed to add reaction');
        console.error('Failed to add reaction:', err);
      }
    },
    [contentType, contentId, data]
  );

  // Remove reaction with optimistic update
  const removeReaction = useCallback(async () => {
    if (!contentId || !data || !data.userReaction) return;

    // Store previous state for rollback
    const previousData = { ...data };

    try {
      // Optimistic update
      const newReactions = [...data.reactions];
      const reactionIndex = newReactions.findIndex(
        (r) => r.emoji === data.userReaction
      );

      if (reactionIndex !== -1) {
        newReactions[reactionIndex] = {
          ...newReactions[reactionIndex],
          count: newReactions[reactionIndex].count - 1,
          userReacted: false,
        };

        // Remove if count is now 0
        if (newReactions[reactionIndex].count === 0) {
          newReactions.splice(reactionIndex, 1);
        }
      }

      // Sort by count descending
      newReactions.sort((a, b) => b.count - a.count);

      // Calculate new total count
      const totalCount = newReactions.reduce((sum, r) => sum + r.count, 0);

      // Update state optimistically
      setData({
        contentType: contentType,
        contentId,
        reactions: newReactions,
        userReaction: null,
        totalCount,
      });

      // Make API call
      await reactionsApi.removeReaction(contentType, contentId);
    } catch (err) {
      // Rollback on error
      setData(previousData);
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
      console.error('Failed to remove reaction:', err);
    }
  }, [contentType, contentId, data]);

  return {
    reactions: data?.reactions || [],
    userReaction: data?.userReaction || null,
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    addReaction,
    removeReaction,
    refetch: fetchReactions,
  };
}
