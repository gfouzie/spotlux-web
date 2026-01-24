import { config } from '@/lib/config';
import { authRequest } from './client';

/**
 * Base interface for presigned URL requests
 */
interface BasePresignedUrlRequest {
  filename: string;
  contentType: string;
}

/**
 * Profile picture upload request
 */
interface ProfilePicturePresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'profile_picture';
}

/**
 * Team picture upload request
 */
interface TeamPicturePresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'team_picture';
  teamId: number;
}

/**
 * Highlight video upload request
 */
interface HighlightVideoPresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'highlight_video';
  highlightReelId: number;
}

/**
 * Highlight reel thumbnail upload request
 */
interface HighlightReelThumbnailPresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'highlight_reel_thumbnail';
  highlightReelId: number;
}

/**
 * Highlight thumbnail upload request
 */
interface HighlightThumbnailPresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'highlight_thumbnail';
  highlightId: number;
}

/**
 * Message image upload request
 */
interface MessageImagePresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'message_image';
}

/**
 * Lifestyle image upload request
 */
interface LifestyleImagePresignedUrlRequest extends BasePresignedUrlRequest {
  uploadType: 'lifestyle_image';
}

/**
 * Discriminated union of all presigned URL request types
 */
export type PresignedUrlRequest =
  | ProfilePicturePresignedUrlRequest
  | TeamPicturePresignedUrlRequest
  | HighlightVideoPresignedUrlRequest
  | HighlightReelThumbnailPresignedUrlRequest
  | HighlightThumbnailPresignedUrlRequest
  | MessageImagePresignedUrlRequest
  | LifestyleImagePresignedUrlRequest;

/**
 * Presigned URL response interface
 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fields: Record<string, string>;
  fileUrl: string;
  s3Key: string;
}

/**
 * Base interface for upload completion requests
 */
interface BaseUploadCompleteRequest {
  s3Key: string;
}

/**
 * Profile picture upload completion request
 */
interface ProfilePictureUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'profile_picture';
}

/**
 * Team picture upload completion request
 */
interface TeamPictureUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'team_picture';
  teamId: number;
}

/**
 * Highlight reel thumbnail upload completion request
 */
interface HighlightReelThumbnailUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'highlight_reel_thumbnail';
  highlightReelId: number;
}

/**
 * Highlight thumbnail upload completion request
 */
interface HighlightThumbnailUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'highlight_thumbnail';
  highlightId: number;
}

/**
 * Message image upload completion request
 */
interface MessageImageUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'message_image';
}

/**
 * Lifestyle image upload completion request
 */
interface LifestyleImageUploadCompleteRequest extends BaseUploadCompleteRequest {
  uploadType: 'lifestyle_image';
}

/**
 * Discriminated union of all upload completion request types
 */
export type UploadCompleteRequest =
  | ProfilePictureUploadCompleteRequest
  | TeamPictureUploadCompleteRequest
  | HighlightReelThumbnailUploadCompleteRequest
  | HighlightThumbnailUploadCompleteRequest
  | MessageImageUploadCompleteRequest
  | LifestyleImageUploadCompleteRequest;

/**
 * Profile picture upload response interface
 */
export interface ProfilePictureUploadResponse {
  message: string;
  profileImageUrl: string;
}

/**
 * Upload a file directly to S3 using presigned URL
 */
const uploadToS3 = async (
  file: File,
  presignedData: PresignedUrlResponse
): Promise<void> => {
  const formData = new FormData();

  // Add all the fields from presigned URL
  Object.entries(presignedData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // File must be the last field
  formData.append('file', file);

  const response = await fetch(presignedData.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`S3 upload failed: ${errorText}`);
  }
};

/**
 * Upload API service
 */
export const uploadApi = {
  /**
   * Upload profile picture using presigned URL flow
   */
  uploadProfilePicture: async (
    file: File
  ): Promise<ProfilePictureUploadResponse> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'profile_picture',
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'profile_picture',
    };

    return authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );
  },

  /**
   * Delete profile picture
   */
  deleteProfilePicture: async (): Promise<{ message: string }> => {
    return authRequest<{ message: string }>(
      `${config.apiBaseUrl}/api/v1/upload/profile-picture`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Upload team picture using presigned URL flow
   */
  uploadTeamPicture: async (
    teamId: number,
    file: File
  ): Promise<ProfilePictureUploadResponse> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'team_picture',
      teamId,
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'team_picture',
      teamId,
    };

    return authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );
  },

  /**
   * Delete team picture
   */
  deleteTeamPicture: async (teamId: number): Promise<{ message: string }> => {
    return authRequest<{ message: string }>(
      `${config.apiBaseUrl}/api/v1/upload/team-picture/${teamId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Upload highlight video using presigned URL flow
   * Note: Does not auto-complete like image uploads. Returns URL for use
   * in highlightsApi.createHighlight() with additional metadata (promptId, etc.)
   */
  uploadHighlightVideo: async (
    reelId: number,
    file: File
  ): Promise<{ fileUrl: string; s3Key: string }> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'highlight_video',
      highlightReelId: reelId,
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Return the file URL and S3 key for use in creating the highlight
    return {
      fileUrl: presignedData.fileUrl,
      s3Key: presignedData.s3Key,
    };
  },

  /**
   * Upload highlight reel thumbnail using presigned URL flow
   */
  uploadHighlightReelThumbnail: async (
    reelId: number,
    file: File
  ): Promise<ProfilePictureUploadResponse> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'highlight_reel_thumbnail',
      highlightReelId: reelId,
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'highlight_reel_thumbnail',
      highlightReelId: reelId,
    };

    return authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );
  },

  /**
   * Upload highlight thumbnail using presigned URL flow
   */
  uploadHighlightThumbnail: async (
    highlightId: number,
    file: File
  ): Promise<ProfilePictureUploadResponse> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'highlight_thumbnail',
      highlightId: highlightId,
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'highlight_thumbnail',
      highlightId: highlightId,
    };

    return authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );
  },

  /**
   * Delete highlight reel thumbnail
   * Note: Currently unused in frontend - PATCH with null is used instead
   */
  deleteHighlightReelThumbnail: async (
    reelId: number
  ): Promise<{ message: string }> => {
    return authRequest<{ message: string }>(
      `${config.apiBaseUrl}/api/v1/upload/highlight-reel-thumbnail/${reelId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Upload message image using presigned URL flow
   * Returns the file URL for use in message content
   */
  uploadMessageImage: async (
    file: File
  ): Promise<{ fileUrl: string; s3Key: string }> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'message_image',
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'message_image',
    };

    await authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );

    // Return the file URL for use in the message
    return {
      fileUrl: presignedData.fileUrl,
      s3Key: presignedData.s3Key,
    };
  },

  /**
   * Upload lifestyle image using presigned URL flow
   * Returns the file URL for use in lifestyle post content
   */
  uploadLifestyleImage: async (
    file: File
  ): Promise<{ fileUrl: string; s3Key: string }> => {
    // Step 1: Request presigned URL from backend
    const presignedRequest: PresignedUrlRequest = {
      filename: file.name,
      contentType: file.type,
      uploadType: 'lifestyle_image',
    };

    const presignedData = await authRequest<PresignedUrlResponse>(
      `${config.apiBaseUrl}/api/v1/upload/presigned-url`,
      {
        method: 'POST',
        body: JSON.stringify(presignedRequest),
      }
    );

    // Step 2: Upload directly to S3
    await uploadToS3(file, presignedData);

    // Step 3: Notify backend of completion
    const completeRequest: UploadCompleteRequest = {
      s3Key: presignedData.s3Key,
      uploadType: 'lifestyle_image',
    };

    await authRequest<ProfilePictureUploadResponse>(
      `${config.apiBaseUrl}/api/v1/upload/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completeRequest),
      }
    );

    // Return the file URL for use in the lifestyle post
    return {
      fileUrl: presignedData.fileUrl,
      s3Key: presignedData.s3Key,
    };
  },
};
