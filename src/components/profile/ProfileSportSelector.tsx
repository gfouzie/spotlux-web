'use client';

import { useEffect, useRef } from 'react';
import { Tab, TabList } from '@/components/common/Tabs';
import { useProfileSport } from '@/contexts/ProfileSportContext';

export default function ProfileSportSelector() {
  const { userSports, selectedSport, setSelectedSport } = useProfileSport();
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Scroll to active tab when selected sport changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedSport]);

  if (userSports.length === 0) {
    return null;
  }

  return (
    <TabList variant="default" className="justify-center">
      {userSports.map((userSport) => {
        const isActive = selectedSport === userSport.sport;
        return (
          <Tab
            key={userSport.sport}
            ref={isActive ? activeTabRef : null}
            isActive={isActive}
            onClick={() => setSelectedSport(userSport.sport)}
          >
            {userSport.sport.toUpperCase()}
          </Tab>
        );
      })}
    </TabList>
  );
}
