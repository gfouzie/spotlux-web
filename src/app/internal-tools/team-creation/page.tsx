'use client';

import React, { useState } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import CreateTeamForm from '@/components/test-tools/CreateTeamForm';
import TeamsList from '@/components/test-tools/TeamsList';
import { Team } from '@/types/team';

export default function TeamCreationPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTeamCreated = (team: Team) => {
    console.log('Team created:', team);
    // Trigger teams list refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-bg-col py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1>Team Creation</h1>
            <p className="text-text-col/60 mt-2">
              Development utilities for creating and managing teams
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Create Team */}
            <div>
              <CreateTeamForm onTeamCreated={handleTeamCreated} />
            </div>

            {/* Right Column - Teams List */}
            <div>
              <TeamsList key={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
