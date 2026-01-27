/**
 * Backwards compatibility wrapper for useReactions hook.
 * Use useReactions('highlights', highlightId) directly for new code.
 */
import { useReactions } from './useReactions';

export function useHighlightReactions(highlightId: number | null) {
  return useReactions('highlights', highlightId);
}
