'use client';

export type FeedTabType = 'highlights' | 'lifestyle';

interface HomeFeedTabsProps {
  activeTab: FeedTabType;
  onTabChange: (tab: FeedTabType) => void;
}

const HomeFeedTabs = ({ activeTab, onTabChange }: HomeFeedTabsProps) => {
  const tabs: { id: FeedTabType; label: string }[] = [
    { id: 'highlights', label: 'Highlights' },
    { id: 'lifestyle', label: 'Lifestyle' },
  ];

  return (
    <div className="flex border-b border-border-col bg-bg-sec-col">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab.id
              ? 'border-b-2 border-accent-col text-accent-col'
              : 'text-text-muted-col hover:text-text-col'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default HomeFeedTabs;
