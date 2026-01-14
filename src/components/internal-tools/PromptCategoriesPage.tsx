'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  promptCategoriesApi,
  type PromptCategory,
  type PromptCategoryCreateRequest,
} from '@/api/promptCategories';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import LoadingState from '@/components/common/LoadingState';
import { formatShortDate } from '@/lib/dateUtils';

const PromptCategoriesPage = () => {
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
  });

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const categories = await promptCategoriesApi.getPromptCategories();
      setCategories(categories);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setFormData({ name: '' });
    setShowCreateForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await promptCategoriesApi.updatePromptCategory(editingId, formData);
        setSuccess('Category updated successfully');
      } else {
        await promptCategoriesApi.createPromptCategory(
          formData as PromptCategoryCreateRequest
        );
        setSuccess('Category created successfully');
      }

      resetForm();
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const handleEdit = (category: PromptCategory) => {
    setFormData({ name: category.name });
    setEditingId(category.id);
    setShowCreateForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setError(null);
      await promptCategoriesApi.deletePromptCategory(id);
      setSuccess('Category deleted successfully');
      loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete category'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>
            Prompt Categories
          </h1>
          <p className="text-text-col/60 mt-1">
            Manage categories for organizing prompts
          </p>
        </div>
        {!showCreateForm && (
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
          >
            Create Category
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          onClose={() => setSuccess(null)}
          className="mb-4"
        >
          {success}
        </Alert>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-bg-col/30 rounded border border-bg-col"
        >
          <h3 className="mb-4">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h3>

          <div className="space-y-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Game, Practice, Drill"
              required
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {categories?.length === 0 ? (
          <p className="text-text-col/60 text-center py-8">
            No categories yet. Create your first category above.
          </p>
        ) : (
          categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-bg-col/30 rounded border border-bg-col hover:bg-bg-col/50 transition-colors"
            >
              <div>
                <h3 className="text-text-col font-medium">{category?.name}</h3>
                <p className="text-text-col/60 text-sm">
                  Created {formatShortDate(category?.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(category?.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptCategoriesPage;
