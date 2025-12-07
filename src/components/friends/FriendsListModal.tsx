"use client";

import { useState, useEffect, useCallback } from "react";
import { Xmark } from "iconoir-react";
import { friendshipsApi } from "@/api/friendships";
import { UserProfile } from "@/api/profile";
import Link from "next/link";
import Image from "next/image";

interface FriendsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  isOwnProfile?: boolean;
}

export default function FriendsListModal({
  isOpen,
  onClose,
  userId,
  isOwnProfile = false,
}: FriendsListModalProps) {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all friends (up to 100)
      const friendsList = isOwnProfile
        ? await friendshipsApi.getMyFriends(0, 100)
        : await friendshipsApi.getUserFriends(userId, 0, 100);

      setFriends(friendsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  }, [isOwnProfile, userId]);

  useEffect(() => {
    if (isOpen) {
      loadAllFriends();
    }
  }, [isOpen, loadAllFriends]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-card-col rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-component-col">
          <h2 className="text-xl font-semibold text-text-col">
            Friends {friends?.length > 0 && `(${friends?.length})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-text-col opacity-70 hover:opacity-100 transition-opacity"
          >
            <Xmark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : friends?.length === 0 ? (
            <div className="text-center text-text-col opacity-70 py-8">
              {isOwnProfile ? "You have no friends yet" : "No friends to show"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends?.map((friend) => (
                <Link
                  key={friend.id}
                  href={`/profile/${friend.username}`}
                  onClick={onClose}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-component-col/30 hover:bg-component-col/50 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-full bg-component-col overflow-hidden flex-shrink-0">
                    {friend?.profileImageUrl ? (
                      <Image
                        src={friend.profileImageUrl}
                        alt={`${friend.username}'s profile`}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent-col/20">
                        <span className="text-lg font-semibold text-text-col">
                          {friend.firstName?.[0]}{friend.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-col font-medium truncate">
                      {friend.firstName} {friend.lastName}
                    </p>
                    <p className="text-text-col opacity-70 text-sm truncate">
                      @{friend.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
