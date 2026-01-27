'use client';

interface UserTab {
  id: number;
  username: string;
  profileImageUrl?: string | null;
}

interface MatchupUserTabsProps {
  userA: UserTab;
  userB: UserTab;
  selectedSide: 'a' | 'b';
  onSelectSide: (side: 'a' | 'b') => void;
}

/**
 * MatchupUserTabs - Tab row component for matchup UI
 *
 * Displays two user tabs with "VS" separator for side selection.
 * Selected tab gets accent background with visual connection to video.
 */
export default function MatchupUserTabs({
  userA,
  userB,
  selectedSide,
  onSelectSide,
}: MatchupUserTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2">
      {/* User A Tab */}
      <button
        onClick={() => onSelectSide('a')}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all cursor-pointer flex-1 max-w-[160px] ${
          selectedSide === 'a'
            ? 'bg-accent-col text-black font-medium'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        {userA.profileImageUrl ? (
          <img
            src={userA.profileImageUrl}
            alt={userA.username}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {userA.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="truncate text-sm">@{userA.username}</span>
      </button>

      {/* VS Separator */}
      <div className="flex items-center justify-center w-10 flex-shrink-0">
        <span className="text-white/60 text-sm font-bold">VS</span>
      </div>

      {/* User B Tab */}
      <button
        onClick={() => onSelectSide('b')}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all cursor-pointer flex-1 max-w-[160px] ${
          selectedSide === 'b'
            ? 'bg-accent-col text-black font-medium'
            : 'bg-white/10 text-white/70 hover:bg-white/20'
        }`}
      >
        {userB.profileImageUrl ? (
          <img
            src={userB.profileImageUrl}
            alt={userB.username}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {userB.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="truncate text-sm">@{userB.username}</span>
      </button>
    </div>
  );
}
