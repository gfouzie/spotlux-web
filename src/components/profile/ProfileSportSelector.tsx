"use client";

import { Tab, TabList } from "@/components/common/Tabs";
import { useProfileSport } from "@/contexts/ProfileSportContext";

export default function ProfileSportSelector() {
  const { userSports, selectedSport, setSelectedSport } = useProfileSport();

  if (userSports.length === 0) {
    return null;
  }

  return (
    <TabList variant="default" className="justify-center">
      {userSports.map((userSport) => (
        <Tab
          key={userSport.sport}
          isActive={selectedSport === userSport.sport}
          onClick={() => setSelectedSport(userSport.sport)}
        >
          {userSport.sport.toUpperCase()}
        </Tab>
      ))}
    </TabList>
  );
}
