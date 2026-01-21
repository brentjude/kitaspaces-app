'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Filters {
  status: string;
  reason: string;
  type: string;
  search: string;
  page: number;
  limit: number;
}

interface InquiryFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
}

export default function InquiryFilters({
  filters,
  onFilterChange,
}: InquiryFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-foreground/10 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-foreground/40" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Search by name, email, or message..."
              className="pl-10 w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Reason Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reason
          </label>
          <select
            value={filters.reason}
            onChange={(e) => {
              onFilterChange('reason', e.target.value);
              if (e.target.value !== 'INQUIRY') {
                onFilterChange('type', '');
              }
            }}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Reasons</option>
            <option value="INQUIRY">Inquiry</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="COMPLAINT">Complaint</option>
            <option value="SUPPORT">Support</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Type Filter (only show if reason is INQUIRY) */}
        {filters.reason === 'INQUIRY' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Inquiry Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="EVENT">Event</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="MEMBERSHIP">Membership</option>
              <option value="GENERAL">General</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}