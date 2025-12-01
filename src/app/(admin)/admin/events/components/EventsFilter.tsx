'use client';

import type { EventStatusFilter } from '@/hooks/useEvents';

interface EventsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: EventStatusFilter;
  onStatusChange: (value: EventStatusFilter) => void;
}

export default function EventsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: EventsFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events or locations..."
            className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-lg text-sm bg-background placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-background rounded-lg p-1 border border-foreground/20">
            <button
              onClick={() => onStatusChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onStatusChange('upcoming')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'upcoming'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => onStatusChange('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Filter Button */}
          <button className="p-2 text-foreground/60 hover:text-foreground border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}