/**
 * Backwards compatibility wrapper for useComments hook.
 * Use useComments('highlights', highlightId) directly for new code.
 */
import { useComments } from './useComments';

export function useHighlightComments(highlightId: number | null) {
  return useComments('highlights', highlightId);
}
