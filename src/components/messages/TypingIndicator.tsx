'use client';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-col/60 flex-shrink-0">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-text-col/40 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-text-col/40 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 bg-text-col/40 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
