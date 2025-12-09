'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { EventCategory } from '@/types/database';

interface EventsSearchBarProps {
  categories: EventCategory[];
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  initialSearch?: string;
  initialCategory?: string;
}

export default function EventsSearchBar({
  categories,
  onSearchChange,
  onCategoryChange,
  initialSearch = '',
  initialCategory = 'all',
}: EventsSearchBarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId === 'all' ? '' : categoryId);
  };

  const getCategoryColor = (color: string | null) => {
    if (!color) return 'bg-gray-100 text-gray-800';
    
    // Map hex colors to Tailwind classes
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-100 text-blue-800',
      '#10B981': 'bg-green-100 text-green-800',
      '#F59E0B': 'bg-orange-100 text-orange-800',
      '#EC4899': 'bg-pink-100 text-pink-800',
      '#8B5CF6': 'bg-purple-100 text-purple-800',
      '#EF4444': 'bg-red-100 text-red-800',
      '#6366F1': 'bg-indigo-100 text-indigo-800',
      '#6B7280': 'bg-gray-100 text-gray-800',
    };

    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-foreground/5 rounded-xl p-4 border border-foreground/10">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 items-center scrollbar-hide">
          <FunnelIcon className="w-5 h-5 text-foreground/40 mr-1 flex-shrink-0" />
          
          <button
            onClick={() => handleCategoryChange('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-foreground/20 text-foreground/60 hover:bg-foreground/5'
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-foreground/20 text-foreground/60 hover:bg-foreground/5'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}