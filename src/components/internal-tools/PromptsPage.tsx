'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useCallback, useEffect } from 'react';
import { promptsApi, type Prompt, type PromptCreate } from '@/api/prompts';
import {
  promptCategoriesApi,
  type PromptCategory,
} from '@/api/promptCategories';
import { sportsApi } from '@/api/sports';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Alert from '@/components/common/Alert';

const PromptsPage = () => {
  const { isAuthenticated } = useAuth();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    description: '',
    promptCategoryId: undefined as number | undefined,
  });

  const loadPrompts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const prompts = await promptsApi.getPrompts();
      setPrompts(prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadSports = useCallback(async () => {
    try {
      const sportsDict = await sportsApi.getSports();
      const sportValues = Object.values(sportsDict);
      setSports(sportValues);

      if (sportValues?.length > 0 && !formData.sport) {
        setFormData((prev) => ({ ...prev, sport: sportValues?.[0] }));
      }
    } catch (err) {
      console.error('Failed to load sports:', err);
    }
  }, [formData.sport]);

  const loadCategories = useCallback(async () => {
    try {
      const categories = await promptCategoriesApi.getPromptCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPrompts();
      loadSports();
      loadCategories();
    }
  }, [isAuthenticated, loadPrompts, loadSports, loadCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      setError(null);
      const promptData: PromptCreate = {
        name: formData.name,
        sport: formData.sport,
        description: formData.description || undefined,
        promptCategoryId: formData.promptCategoryId,
      };
      await promptsApi.createPrompt(promptData);
      setFormData({
        name: '',
        sport: sports[0] || '',
        description: '',
        promptCategoryId: undefined,
      });
      setShowCreateForm(false);
      await loadPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || editingId === null) return;

    try {
      setError(null);
      await promptsApi.updatePrompt(editingId, {
        name: formData.name,
        sport: formData.sport,
        description: formData.description || undefined,
        promptCategoryId: formData.promptCategoryId,
      });
      setFormData({
        name: '',
        sport: sports[0] || '',
        description: '',
        promptCategoryId: undefined,
      });
      setEditingId(null);
      await loadPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) return;
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      setError(null);
      await promptsApi.deletePrompt(id);
      await loadPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const startEdit = (prompt: Prompt) => {
    setFormData({
      name: prompt.name,
      sport: prompt.sport,
      description: prompt.description || '',
      promptCategoryId: prompt.promptCategoryId,
    });
    setEditingId(prompt.id);
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      sport: sports[0] || '',
      description: '',
      promptCategoryId: undefined,
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Prompts Management</h1>
        {!showCreateForm && !editingId && (
          <Button onClick={() => setShowCreateForm(true)}>
            Create New Prompt
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {(showCreateForm || editingId !== null) && (
        <form
          onSubmit={editingId !== null ? handleUpdate : handleCreate}
          className="mb-6 p-4 bg-bg-col/30 rounded border border-bg-col"
        >
          <h2 className="mb-4">
            {editingId !== null ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          <div className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Select
              label="Sport"
              value={formData.sport}
              onChange={(e) =>
                setFormData({ ...formData, sport: e.target.value })
              }
              options={
                sports?.length === 0
                  ? [{ value: '', label: 'Loading sports...' }]
                  : sports?.map((sport) => ({
                      value: sport,
                      label: sport.charAt(0).toUpperCase() + sport.slice(1),
                    }))
              }
              required
            />

            <Select
              label="Category (optional)"
              value={formData.promptCategoryId?.toString() || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  promptCategoryId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              options={[
                { value: '', label: 'None' },
                ...(categories?.length === 0
                  ? [{ value: '', label: 'No categories available' }]
                  : categories?.map((category) => ({
                      value: category.id.toString(),
                      label: category.name,
                    }))),
              ]}
            />

            <Textarea
              label="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />

            <div className="flex gap-2">
              <Button type="submit">
                {editingId !== null ? 'Update' : 'Create'}
              </Button>
              <Button type="button" onClick={cancelEdit} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center text-text-col">Loading prompts...</div>
      ) : prompts?.length === 0 ? (
        <div className="text-center text-text-col">
          No prompts yet. Create one to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {prompts?.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 bg-bg-col/30 rounded border border-bg-col hover:bg-bg-col/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3>
                    {prompt.name}
                  </h3>
                  <div className="text-sm text-text-col/60 mt-1">
                    Sport: {prompt.sport}
                    {prompt?.promptCategoryName && (
                      <> • Category: {prompt.promptCategoryName}</>
                    )}
                  </div>
                  {prompt?.description && (
                    <p className="text-text-col/80 mt-2">
                      {prompt.description}
                    </p>
                  )}
                  <div className="text-xs text-text-col/50 mt-2">
                    Created: {new Date(prompt.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" onClick={() => startEdit(prompt)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptsPage;
