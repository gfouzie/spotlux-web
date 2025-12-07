"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { friendshipsApi } from "@/api/friendships";
import { UserProfile } from "@/api/profile";
import Link from "next/link";
import Image from "next/image";

interface FriendsPreviewProps {
  userId: number; // The user whose friends to display
  isOwnProfile?: boolean; // Whether this is the current user's profile
}

export default function FriendsPreview({ userId, isOwnProfile = false }: FriendsPreviewProps) {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadFriends();
    }
  }, [isAuthenticated, userId]);

  const loadFriends = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load first 6 friends for preview
      const friends = isOwnProfile
        ? await friendshipsApi.getMyFriends(0, 6)
        : await friendshipsApi.getUserFriends(userId, 0, 6);

      setFriends(friends);
      setTotalCount(friends.length === 6 ? 6 : friends.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-bg-col/30 rounded border border-bg-col">
        <h3 className="text-lg font-semibold text-text-col mb-4">Friends</h3>
        <div className="text-text-col/50">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-bg-col/30 rounded border border-bg-col">
        <h3 className="text-lg font-semibold text-text-col mb-4">Friends</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-bg-col/30 rounded border border-bg-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-col">
          Friends {totalCount > 0 && `(${totalCount})`}
        </h3>
        {totalCount > 0 && (
          <Link
            href="/friends"
            className="text-sm text-accent-col hover:text-accent-col/80"
          >
            See all
          </Link>
        )}
      </div>

      {friends?.length === 0 ? (
        <div className="text-text-col/50 text-sm">
          {isOwnProfile ? "You have no friends yet" : "No friends to show"}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {friends?.map((friend) => (
            <Link
              key={friend.id}
              href={`/profile/${friend.username}`}
              className="flex flex-col items-center p-2 rounded hover:bg-bg-col/50 transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full bg-bg-col mb-1 overflow-hidden">
                {friend.profileImageUrl ? (
                  <Image
                    src={friend.profileImageUrl}
                    alt={`${friend.username}'s profile`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-col/40">
                    {friend.firstName?.charAt(0) || friend.username.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs text-text-col text-center truncate w-full">
                {friend.firstName} {friend.lastName}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
