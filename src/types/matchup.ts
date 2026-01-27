/**
 * Prompt interface (minimal, for nested objects)
 * Uses camelCase (automatically converted from snake_case by API middleware)
 */
export interface PromptMinimal {
  id: number;
  name: string;
  description: string | null;
  sport: string;
  promptCategoryId: number | null;
  promptCategoryName: string | null;
  createdByUserId: number;
  createdAt: string;
}

/**
 * FeaturedPrompt interface matching the backend FeaturedPromptRead schema
 */
export interface FeaturedPrompt {
  id: number;
  promptId: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  prompt: PromptMinimal | null;
}

/**
 * Creator info for highlight in matchup feed
 */
export interface HighlightCreator {
  id: number;
  username: string;
  profileImageUrl: string | null;
}

/**
 * HighlightMatchup interface matching the backend HighlightMatchupRead schema
 */
export interface HighlightMatchup {
  id: number;
  promptId: number;
  highlightAId: number;
  highlightBId: number;
  createdAt: string;
  updatedAt: string;
  // Optional joined highlight data (when fetched with video URLs for feed)
  highlightA?: {
    id: number;
    videoUrl: string;
    prompt?: { id: number; name: string };
    creator?: HighlightCreator;
  };
  highlightB?: {
    id: number;
    videoUrl: string;
    prompt?: { id: number; name: string };
    creator?: HighlightCreator;
  };
}

/**
 * HighlightMatchupView interface matching the backend HighlightMatchupViewRead schema
 */
export interface HighlightMatchupView {
  id: number;
  matchupId: number;
  userId: number;
  viewedAt: string;
}

/**
 * HighlightMatchupVote interface matching the backend HighlightMatchupVoteRead schema
 */
export interface HighlightMatchupVote {
  id: number;
  matchupId: number;
  userId: number;
  votedForHighlightId: number;
  voteComment: string | null;
  commentProcessed: boolean;
  votedAt: string;
}

/**
 * HighlightMatchupResults interface matching the backend HighlightMatchupResultsRead schema
 */
export interface HighlightMatchupResults {
  matchupId: number;
  highlightAId: number;
  highlightBId: number;
  highlightAVotes: number;
  highlightBVotes: number;
  totalVotes: number;
}
