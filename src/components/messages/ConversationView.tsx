'use client';

import {
  ConversationWithDetails,
  MessageWithSender,
} from '@/api/conversations';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ConversationViewProps {
  conversation: ConversationWithDetails | undefined;
  messages: MessageWithSender[];
  currentUserId: number;
  isConnected: boolean;
  isOtherUserTyping: boolean;
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onTypingChange: (isTyping: boolean) => void;
  onEditMessage: (messageId: number, content: string) => void;
  onDeleteMessage: (messageId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

const ConversationView = ({
  conversation,
  messages,
  currentUserId,
  isConnected,
  isOtherUserTyping,
  onSendMessage,
  onTypingChange,
  onEditMessage,
  onDeleteMessage,
  onMarkAsRead,
}: ConversationViewProps) => {
  if (!conversation) {
    return (
      <div className="bg-card-col rounded-lg flex items-center justify-center h-full">
        <div className="text-center text-text-col/60">
          <p className="text-lg mb-2">Select a conversation</p>
          <p className="text-sm">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const displayName =
    conversation.otherUser.firstName && conversation.otherUser.lastName
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.otherUser.username;

  return (
    <div className="bg-card-col rounded-lg flex flex-col h-full">
      <ConversationHeader conversation={conversation} />

      <MessageThread
        messages={messages}
        currentUserId={currentUserId}
        isLoading={false}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
        onMarkAsRead={onMarkAsRead}
      />

      {isOtherUserTyping && <TypingIndicator username={displayName} />}

      <MessageInput
        onSendMessage={onSendMessage}
        onTypingChange={onTypingChange}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ConversationView;
