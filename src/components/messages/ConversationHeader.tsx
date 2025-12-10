'use client';

import { ConversationWithDetails } from '@/api/conversations';

interface ConversationHeaderProps {
  conversation: ConversationWithDetails;
}

const ConversationHeader = ({ conversation }: ConversationHeaderProps) => {
  const displayName =
    conversation.otherUser.firstName && conversation.otherUser.lastName
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.otherUser.username;

  const initial =
    conversation.otherUser.firstName?.[0] ||
    conversation.otherUser.username?.[0] ||
    'U';

  return (
    <div className="p-4 border-b border-text-col/10">
      <div className="flex items-center gap-3">
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
