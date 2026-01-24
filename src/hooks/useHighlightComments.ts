import { useState, useEffect, useCallback } from 'react';
import { commentsApi, Comment, CommentsResponse } from '@/api/comments';
import { useUser } from '@/contexts/UserContext';

interface UseHighlightCommentsReturn {
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  addComment: (text: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  likeComment: (commentId: number) => Promise<void>;
  unlikeComment: (commentId: number) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refetch: () => Promise<void>;
}

const PAGE_SIZE = 20;

export function useHighlightComments(
  highlightId: number | null
): UseHighlightCommentsReturn {
  const { user } = useUser();
  const [data, setData] = useState<CommentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  // Fetch comments
  const fetchComments = useCallback(
    async (reset: boolean = false) => {
      if (!highlightId) {
        setData(null);
        setIsLoading(false);
        return;
      }

      if (reset) {
        setOffset(0);
      }

      setIsLoading(true);
      setError(null);

      try {
        const commentsData = await commentsApi.getComments(highlightId, {
          offset: 0,
          limit: PAGE_SIZE,
        });

        setData(commentsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load comments'
        );
        console.error('Failed to fetch comments:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [highlightId]
  );

  // Fetch on mount and when highlightId changes
  useEffect(() => {
    fetchComments(true);
  }, [highlightId]);

  // Add comment with optimistic update
  const addComment = useCallback(
    async (text: string) => {
      if (!highlightId || !data || !user) return;

      // Store previous state for rollback
      const previousData = { ...data, comments: [...data.comments] };

      try {
        // Optimistic update - add comment to top (highest hot score)
        const optimisticComment: Comment = {
          id: Date.now(), // Temporary ID
          highlightId,
          text,
          createdAt: new Date().toISOString(),
          author: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
          },
          likeCount: 0,
          userLiked: false,
          hotScore: Infinity, // Will be at top
        };

        setData({
          ...data,
          comments: [optimisticComment, ...data.comments],
          totalCount: data.totalCount + 1,
        });

        // Make API call
        const createdComment = await commentsApi.createComment(
          highlightId,
          text
        );

        // Update with real data (replace temp ID with real ID)
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === optimisticComment.id ? { ...c, id: createdComment.id } : c
            ),
          };
        });
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err instanceof Error ? err.message : 'Failed to add comment');
        console.error('Failed to add comment:', err);
        throw err;
      }
    },
    [highlightId, data, user]
  );

  // Delete comment with optimistic update
  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!highlightId || !data) return;

      // Store previous state for rollback
      const previousData = { ...data, comments: [...data.comments] };

      try {
        // Optimistic update
        setData({
          ...data,
          comments: data.comments.filter((c) => c.id !== commentId),
          totalCount: data.totalCount - 1,
        });

        // Make API call
        await commentsApi.deleteComment(highlightId, commentId);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(
          err instanceof Error ? err.message : 'Failed to delete comment'
        );
        console.error('Failed to delete comment:', err);
        throw err;
      }
    },
    [highlightId, data]
  );

  // Like comment with optimistic update
  const likeComment = useCallback(
    async (commentId: number) => {
      if (!highlightId || !data) return;

      // Store previous state for rollback
      const previousData = { ...data, comments: [...data.comments] };

      try {
        // Optimistic update
        setData({
          ...data,
          comments: data.comments.map((c) =>
            c.id === commentId
              ? { ...c, likeCount: c.likeCount + 1, userLiked: true }
              : c
          ),
        });

        // Make API call
        await commentsApi.likeComment(highlightId, commentId);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err instanceof Error ? err.message : 'Failed to like comment');
        console.error('Failed to like comment:', err);
      }
    },
    [highlightId, data]
  );

  // Unlike comment with optimistic update
  const unlikeComment = useCallback(
    async (commentId: number) => {
      if (!highlightId || !data) return;

      // Store previous state for rollback
      const previousData = { ...data, comments: [...data.comments] };

      try {
        // Optimistic update
        setData({
          ...data,
          comments: data.comments.map((c) =>
            c.id === commentId
              ? { ...c, likeCount: Math.max(0, c.likeCount - 1), userLiked: false }
              : c
          ),
        });

        // Make API call
        await commentsApi.unlikeComment(highlightId, commentId);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(
          err instanceof Error ? err.message : 'Failed to unlike comment'
        );
        console.error('Failed to unlike comment:', err);
      }
    },
    [highlightId, data]
  );

  // Load more comments - uses offset state for proper pagination
  const loadMore = useCallback(async () => {
    if (!highlightId || !data || isLoading) return;

    // Calculate next offset based on current offset state, not data length
    // This ensures correct pagination even with optimistic updates
    const nextOffset = offset + PAGE_SIZE;

    try {
      const moreComments = await commentsApi.getComments(highlightId, {
        offset: nextOffset,
        limit: PAGE_SIZE,
      });

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, ...moreComments.comments],
        };
      });
      setOffset(nextOffset);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more comments'
      );
      console.error('Failed to load more comments:', err);
    }
  }, [highlightId, data, isLoading, offset]);

  const hasMore = data ? data.comments.length < data.totalCount : false;

  return {
    comments: data?.comments || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    loadMore,
    hasMore,
    refetch: () => fetchComments(true),
  };
}
