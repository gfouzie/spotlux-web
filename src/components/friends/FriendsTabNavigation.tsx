'use client';

type TabType = 'friends' | 'received' | 'sent';

interface FriendsTabNavigationProps {
  activeTab: TabType;
  friendsCount: number;
  receivedRequestsCount: number;
  sentRequestsCount: number;
  onTabChange: (tab: TabType) => void;
}

const FriendsTabNavigation = ({
  activeTab,
  friendsCount,
  receivedRequestsCount,
  sentRequestsCount,
  onTabChange,
}: FriendsTabNavigationProps) => {
  const tabs = [
    { id: 'friends' as TabType, label: 'Friends', count: friendsCount },
    {
      id: 'received' as TabType,
      label: 'Requests',
      count: receivedRequestsCount,
    },
    { id: 'sent' as TabType, label: 'Sent', count: sentRequestsCount },
  ];

  return (
    <div className="flex gap-4 mb-6 border-b border-bg-col">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 px-4 ${
            activeTab === tab.id
              ? 'border-b-2 border-accent-col text-text-col'
              : 'text-text-col/60 hover:text-text-col'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};

export default FriendsTabNavigation;
