'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface CustomerFiltersProps {
  searchTerm: string;
  filterType: 'all' | 'registered' | 'guest';
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: 'all' | 'registered' | 'guest') => void;
}

export default function CustomerFilters({
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange,
}: CustomerFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full sm:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-foreground/40" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-lg leading-5 bg-white placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition duration-150 ease-in-out"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-1 bg-foreground/5 rounded-lg p-1 border border-foreground/10">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'all'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('registered')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'registered'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Registered
          </button>
          <button
            onClick={() => onFilterChange('guest')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              filterType === 'guest'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Guests
          </button>
        </div>
      </div>
    </div>
  );
}