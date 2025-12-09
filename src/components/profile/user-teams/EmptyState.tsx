'use client';

import React from 'react';
import Button from '@/components/common/Button';

interface EmptyStateProps {
  onAddTeam: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddTeam }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-text-col mb-2">
          No Teams Yet
        </h3>
        <p className="text-text-col/60 mb-6">
          Start building your sports resume by adding teams you've played for.
        </p>
        <Button
          variant="primary"
          onClick={onAddTeam}
        >
          + Add Your First Team
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
