'use client';

import { useState } from 'react';
import HomeFeedTabs, { FeedTabType } from './HomeFeedTabs';
import FeedPage from '@/components/feed/FeedPage';
import LifestyleFeedPage from '@/components/lifestyle/LifestyleFeedPage';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<FeedTabType>('highlights');

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <HomeFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'highlights' && <FeedPage />}
        {activeTab === 'lifestyle' && (
          <div className="h-full overflow-y-auto">
            <LifestyleFeedPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
