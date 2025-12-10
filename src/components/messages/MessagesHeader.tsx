'use client';

interface MessagesHeaderProps {
  isConnected: boolean;
  onNewMessage: () => void;
}

const MessagesHeader = ({ isConnected, onNewMessage }: MessagesHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onNewMessage}
          className="px-4 py-2 bg-accent-col text-white rounded-lg font-medium hover:bg-accent-col/90 transition-colors"
        >
          + New Message
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-text-col/60">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessagesHeader;
