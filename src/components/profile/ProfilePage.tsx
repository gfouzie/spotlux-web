"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import ProfilePictureSection from "@/components/profile/ProfilePictureSection";
import UserSportsManager from "@/components/profile/UserSportsManager";
import SportTabContent from "@/components/highlights/SportTabContent";
import { Tab, TabList, TabPanel } from "@/components/common/Tabs";
import { profileApi } from "@/api/profile";
import { userSportsApi, UserSport } from "@/api/userSports";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSports, setUserSports] = useState<UserSport[]>([]);
  const [activeSportTab, setActiveSportTab] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        const [profileData, sportsData] = await Promise.all([
          profileApi.getProfile(),
          userSportsApi.getUserSports(),
        ]);

        setProfileImageUrl(profileData.profileImageUrl);
        setUserSports(sportsData);

        // Set first sport as active tab if available
        if (sportsData?.length > 0 && !activeSportTab) {
          setActiveSportTab(sportsData[0].sport);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, user]);

  const handleSportsUpdate = async () => {
    // Reload user sports when they're updated
    try {
      const sportsData = await userSportsApi.getUserSports();
      setUserSports(sportsData);

      // Update active tab if needed
      if (sportsData?.length > 0 && !activeSportTab) {
        setActiveSportTab(sportsData[0].sport);
      } else if (sportsData?.length === 0) {
        setActiveSportTab(null);
      } else if (activeSportTab && !sportsData?.find(s => s.sport === activeSportTab)) {
        // If current active tab was removed, switch to first available
        setActiveSportTab(sportsData[0].sport);
      }
    } catch (err) {
      console.error("Failed to reload sports:", err);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-col">{user?.username || "Profile"}</h1>
          </div>

          {/* Profile Sections */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-accent-col border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <ProfilePictureSection
                profileImageUrl={profileImageUrl}
                firstName={user?.firstName || null}
                lastName={user?.lastName || null}
                userId={user?.id || 0}
                isOwnProfile={true}
              />

              {/* Sports Manager */}
              <UserSportsManager onSportsUpdate={handleSportsUpdate} />

              {/* Highlights Section */}
              {user && userSports?.length > 0 && (
                <div className="bg-card-col rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-text-col mb-6">
                    Highlights
                  </h2>

                  {/* Sport Tabs */}
                  <TabList className="mb-6">
                    {userSports?.map((userSport) => (
                      <Tab
                        key={userSport.sport}
                        isActive={activeSportTab === userSport.sport}
                        onClick={() => setActiveSportTab(userSport.sport)}
                      >
                        {userSport.sport.charAt(0).toUpperCase() +
                          userSport.sport.slice(1)}
                      </Tab>
                    ))}
                  </TabList>

                  {/* Tab Panels */}
                  {userSports.map((userSport) => (
                    <TabPanel
                      key={userSport.sport}
                      isActive={activeSportTab === userSport.sport}
                    >
                      <SportTabContent
                        sport={userSport.sport}
                        isOwner={true}
                      />
                    </TabPanel>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProfilePage;
