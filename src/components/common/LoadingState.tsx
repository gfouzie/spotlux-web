interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = 'Loading...',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center bg-bg-col text-text-col ${className}`}
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent-col border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>{message}</p>
      </div>
    </div>
  );
}
