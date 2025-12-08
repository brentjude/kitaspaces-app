'use client';

import { useState } from 'react';
import { TagIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { EventCategory } from '@/types/database';

interface EventCategoriesTabProps {
  categories: EventCategory[];
  onAddCategory: (data: { name: string; color: string; icon: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const COLOR_OPTIONS = [
  { label: 'Blue', value: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-800' },
  { label: 'Green', value: '#10B981', bg: 'bg-green-100', text: 'text-green-800' },
  { label: 'Orange', value: '#F59E0B', bg: 'bg-orange-100', text: 'text-orange-800' },
  { label: 'Pink', value: '#EC4899', bg: 'bg-pink-100', text: 'text-pink-800' },
  { label: 'Purple', value: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800' },
  { label: 'Red', value: '#EF4444', bg: 'bg-red-100', text: 'text-red-800' },
  { label: 'Indigo', value: '#6366F1', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { label: 'Gray', value: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-800' },
];

const ICON_OPTIONS = ['🎓', '🤝', '🎁', '🎉', '💼', '🎨', '🏆', '🎯', '📚', '🎭'];

export default function EventCategoriesTab({
  categories,
  onAddCategory,
  onDeleteCategory,
}: EventCategoriesTabProps) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: COLOR_OPTIONS[0].value,
    icon: ICON_OPTIONS[0],
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    setIsAdding(true);
    try {
      await onAddCategory(newCategory);
      setNewCategory({
        name: '',
        color: COLOR_OPTIONS[0].value,
        icon: ICON_OPTIONS[0],
      });
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await onDeleteCategory(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const getColorClasses = (color: string | null) => {
    const option = COLOR_OPTIONS.find((opt) => opt.value === color);
    return option ? `${option.bg} ${option.text}` : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
        <h3 className="text-base font-semibold text-foreground flex items-center">
          <TagIcon className="w-5 h-5 mr-2" />
          Event Categories
        </h3>
      </div>
      <div className="p-6">
        {/* Add Category Form */}
        <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 mb-6">
          <h4 className="text-sm font-semibold text-foreground/80 mb-3">
            Add New Category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Category Name"
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Color
              </label>
              <select
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCategory.color}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, color: e.target.value })
                }
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Icon
              </label>
              <select
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCategory.icon}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, icon: e.target.value })
                }
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                &nbsp;
              </label>
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4 mr-1.5" />
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-3 flex items-center">
            <span className="text-xs text-foreground/50 mr-2">Preview:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(
                newCategory.color
              )}`}
            >
              <span className="mr-1">{newCategory.icon}</span>
              {newCategory.name || 'Category Name'}
            </span>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/80">
            Existing Categories ({categories.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors"
              >
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(
                    cat.color
                  )}`}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </span>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-foreground/40 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                  title="Delete Category"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-8 text-foreground/40 text-sm">
                No categories defined yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}