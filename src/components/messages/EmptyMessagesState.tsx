'use client';

interface EmptyMessagesStateProps {
  onNewMessage: () => void;
}

const EmptyMessagesState = ({ onNewMessage }: EmptyMessagesStateProps) => {
  return (
    <div className="bg-card-col rounded-lg p-8">
      <div className="text-center">
        <p className="text-text-col/60 mb-4">
          No conversations yet. Start messaging your friends!
        </p>
        <button
          onClick={onNewMessage}
          className="px-6 py-3 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/90 transition-colors"
        >
          Start a Conversation
        </button>
      </div>
    </div>
  );
};

export default EmptyMessagesState;
