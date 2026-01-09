import { config } from '@/lib/config';
import { authRequest } from './client';

/**
 * Comment author info
 */
export interface CommentAuthor {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

/**
 * Comment with author and like data
 */
export interface Comment {
  id: number;
  highlightId: number;
  text: string;
  createdAt: string;
  author: CommentAuthor;
  likeCount: number;
  userLiked: boolean;
  hotScore: number;
}

/**
 * Response from comments endpoint
 */
export interface CommentsResponse {
  highlightId: number;
  comments: Comment[];
  totalCount: number;
}

/**
 * Created comment (without author info)
 */
export interface CreatedComment {
  id: number;
  highlightId: number;
  userId: number;
  text: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Params for fetching comments
 */
export interface GetCommentsParams {
  offset?: number;
  limit?: number;
}

/**
 * API client for highlight comments
 */
export const commentsApi = {
  /**
   * Get comments for a highlight with hot ranking sort
   */
  async getComments(
    highlightId: number,
    params?: GetCommentsParams
  ): Promise<CommentsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/comments${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<CommentsResponse>(url);
  },

  /**
   * Create a new comment on a highlight
   */
  async createComment(
    highlightId: number,
    text: string
  ): Promise<CreatedComment> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/comments`;
    return authRequest<CreatedComment>(url, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  /**
   * Delete a comment
   */
  async deleteComment(highlightId: number, commentId: number): Promise<void> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/comments/${commentId}`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },

  /**
   * Like a comment
   */
  async likeComment(highlightId: number, commentId: number): Promise<void> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/comments/${commentId}/like`;
    await authRequest<void>(url, {
      method: 'POST',
    });
  },

  /**
   * Unlike a comment
   */
  async unlikeComment(highlightId: number, commentId: number): Promise<void> {
    const url = `${config.apiBaseUrl}/api/v1/highlights/${highlightId}/comments/${commentId}/like`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },
};
