import { config } from '@/lib/config';
import { authRequest } from './client';
import { ContentType, CONTENT_TYPE_PATHS } from './contentTypes';

// Re-export for convenience
export type { ContentType } from './contentTypes';

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
  contentType: string;
  contentId: number;
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
  contentType: string;
  contentId: number;
  comments: Comment[];
  totalCount: number;
}

/**
 * Created comment (without author info)
 */
export interface CreatedComment {
  id: number;
  contentType: string;
  contentId: number;
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
 * API client for content comments (highlights, lifestyle posts, etc.)
 */
export const commentsApi = {
  /**
   * Get comments for any content with hot ranking sort
   */
  async getComments(
    contentType: ContentType,
    contentId: number,
    params?: GetCommentsParams
  ): Promise<CommentsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/comments${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return authRequest<CommentsResponse>(url);
  },

  /**
   * Create a new comment on any content
   */
  async createComment(
    contentType: ContentType,
    contentId: number,
    text: string
  ): Promise<CreatedComment> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/comments`;
    return authRequest<CreatedComment>(url, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  /**
   * Delete a comment
   */
  async deleteComment(
    contentType: ContentType,
    contentId: number,
    commentId: number
  ): Promise<void> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/comments/${commentId}`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },

  /**
   * Like a comment
   */
  async likeComment(
    contentType: ContentType,
    contentId: number,
    commentId: number
  ): Promise<void> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/comments/${commentId}/like`;
    await authRequest<void>(url, {
      method: 'POST',
    });
  },

  /**
   * Unlike a comment
   */
  async unlikeComment(
    contentType: ContentType,
    contentId: number,
    commentId: number
  ): Promise<void> {
    const path = CONTENT_TYPE_PATHS[contentType];
    const url = `${config.apiBaseUrl}/api/v1/${path}/${contentId}/comments/${commentId}/like`;
    await authRequest<void>(url, {
      method: 'DELETE',
    });
  },
};
