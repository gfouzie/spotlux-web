'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { conversationsApi } from '@/api/conversations';

interface MessageButtonProps {
  userId: number;
  isFriend: boolean; // Only show button if they're friends
}

export default function MessageButton({ userId, isFriend }: MessageButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = async () => {
    if (!isFriend) return;

    try {
      setIsLoading(true);
      // Create or get existing conversation
      const conversation = await conversationsApi.createOrGetConversation(userId);
      // Navigate to messages page with the conversation selected
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFriend) return null;

  return (
    <button
      onClick={handleMessage}
      disabled={isLoading}
      className="px-4 py-2 bg-accent-col text-white rounded-md hover:bg-accent-col/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isLoading ? 'Loading...' : 'Message'}
    </button>
  );
}
