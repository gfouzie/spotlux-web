'use client';

import { ConversationWithDetails } from '@/api/conversations';
import ConversationListItem from './ConversationListItem';
import AddButton from '@/components/common/AddButton';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewMessage: () => void;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewMessage,
}: ConversationListProps) => {
  return (
    <div className="bg-card-col p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2>Conversations</h2>
        <AddButton onClick={onNewMessage} ariaLabel="New Message" />
      </div>

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-text-col/60">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={onSelectConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
