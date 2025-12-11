'use client';

import { ConversationWithDetails } from '@/api/conversations';
import { NavArrowLeft } from 'iconoir-react';

interface ConversationHeaderProps {
  conversation: ConversationWithDetails;
  onBackToList?: () => void;
}

const ConversationHeader = ({ conversation, onBackToList }: ConversationHeaderProps) => {
  const displayName =
    conversation.otherUser.firstName && conversation.otherUser.lastName
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.otherUser.username;

  const initial =
    conversation.otherUser.firstName?.[0] ||
    conversation.otherUser.username?.[0] ||
    'U';

  return (
    <div className="p-4 border-b border-text-col/10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button - only visible on mobile */}
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="lg:hidden p-2 hover:bg-bg-col/50 rounded-lg transition-colors"
            aria-label="Back to conversations"
          >
            <NavArrowLeft width={20} height={20} />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium">
          {initial}
        </div>
        <div>
          <h3 className="font-semibold">{displayName}</h3>
          <p className="text-sm text-text-col/60">
            @{conversation.otherUser.username}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
