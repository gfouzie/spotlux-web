'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';
import {
  highlightReelsApi,
  HighlightReelCreateRequest,
} from '@/api/highlightReels';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sport: string;
}

export default function CreateReelModal({
  isOpen,
  onClose,
  onSuccess,
  sport,
}: CreateReelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    visibility: 'private' as 'private' | 'public' | 'friends_only',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Backend auto-assigns orderRanking
      const createRequest: HighlightReelCreateRequest = {
        name: formData.name,
        sport: sport,
        visibility: formData.visibility,
      };

      await highlightReelsApi.createHighlightReel(createRequest);

      // Reset form
      setFormData({ name: '', visibility: 'private' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', visibility: 'private' });
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Highlight Reel"
      size="md"
      showFooter
      confirmText="Create Reel"
      cancelText="Cancel"
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isSubmitting}
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Input
          label="Reel Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Best Plays 2024"
          required
          maxLength={100}
        />

        <Select
          label="Visibility"
          value={formData.visibility}
          onChange={(e) =>
            setFormData({
              ...formData,
              visibility: e.target.value as
                | 'private'
                | 'public'
                | 'friends_only',
            })
          }
          options={[
            { value: 'private', label: 'Private - Only you can see' },
            {
              value: 'friends_only',
              label: 'Friends Only - Only friends can see',
            },
            { value: 'public', label: 'Public - Everyone can see' },
          ]}
          required
        />

        <div className="bg-bg-col/30 p-3 rounded">
          <p className="text-sm text-text-col/60">
            <strong>Sport:</strong>{' '}
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
