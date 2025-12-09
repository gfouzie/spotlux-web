'use client';

import React, { useState } from 'react';
import { Position } from '@/types/team';
import { positionsApi } from '@/api/positions';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PositionFormData } from './types';

interface PositionCreateScreenProps {
  sport: string;
  formData: PositionFormData;
  onFormChange: (data: Partial<PositionFormData>) => void;
  onCreate: (position: Position) => void;
}

const PositionCreateScreen: React.FC<PositionCreateScreenProps> = ({
  sport,
  formData,
  onFormChange,
  onCreate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Position name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const createdPosition = await positionsApi.createPosition({
        sport,
        name: formData.name.trim(),
        abbreviation: formData.abbreviation.trim() || null,
      });

      onCreate(createdPosition);
    } catch (err) {
      setErrors({ submit: 'Failed to create position. Please try again.' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Position Name */}
      <Input
        label="Position Name *"
        value={formData.name}
        onChange={(e) => onFormChange({ name: e.target.value })}
        placeholder="e.g., Point Guard"
        error={errors.name}
        maxLength={100}
      />

      {/* Position Abbreviation */}
      <Input
        label="Position Abbreviation (optional)"
        value={formData.abbreviation}
        onChange={(e) => onFormChange({ abbreviation: e.target.value })}
        placeholder="e.g., PG"
        maxLength={10}
      />

      {/* Sport (Disabled) */}
      <Input
        label="Sport *"
        value={sport}
        disabled
        className="opacity-60 cursor-not-allowed"
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Add Position Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        Add Position
      </Button>
    </form>
  );
};

export default PositionCreateScreen;
