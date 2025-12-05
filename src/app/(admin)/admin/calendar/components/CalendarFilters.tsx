'use client';

import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface CalendarFiltersProps {
  showFreeOnly: boolean;
  showMemberOnly: boolean;
  showRedemptionOnly: boolean;
  onFilterChange: (filters: {
    showFreeOnly: boolean;
    showMemberOnly: boolean;
    showRedemptionOnly: boolean;
  }) => void;
}

export default function CalendarFilters({
  showFreeOnly,
  showMemberOnly,
  showRedemptionOnly,
  onFilterChange,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (filter: 'free' | 'member' | 'redemption') => {
    const newFilters = {
      showFreeOnly,
      showMemberOnly,
      showRedemptionOnly,
    };

    switch (filter) {
      case 'free':
        newFilters.showFreeOnly = !showFreeOnly;
        break;
      case 'member':
        newFilters.showMemberOnly = !showMemberOnly;
        break;
      case 'redemption':
        newFilters.showRedemptionOnly = !showRedemptionOnly;
        break;
    }

    onFilterChange(newFilters);
  };

  const activeFiltersCount = [showFreeOnly, showMemberOnly, showRedemptionOnly].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-foreground/20 rounded-lg hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
      >
        <FunnelIcon className="w-4 h-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-foreground/10 z-20">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Event Filters</span>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={() => handleToggle('free')}
                  className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground/70">Free events only</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMemberOnly}
                  onChange={() => handleToggle('member')}
                  className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground/70">Member-only events</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRedemptionOnly}
                  onChange={() => handleToggle('redemption')}
                  className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground/70">Daily use events</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}