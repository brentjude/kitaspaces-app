'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEvents, type EventStatusFilter } from '@/hooks/useEvents';
import EventsTable from './EventsTable';
import EventsFilters from './EventsFilter';

export default function EventsListClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  // Fetch events using the custom hook
  const { events, stats, isLoading, error, refetch } = useEvents({
    status: statusFilter,
    search: searchTerm,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Determine event status based on date
  const getEventStatus = (eventDate: Date): 'upcoming' | 'completed' => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime > now ? 'upcoming' : 'completed';
  };

  // Handle loading state
  if (isLoading && events.length === 0) {
    return <EventsLoadingSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg
            className="w-12 h-12 mx-auto text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Error Loading Events
          </h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Events"
            value={stats.total}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            variant="success"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            variant="secondary"
          />
          <StatCard
            label="Total Attendees"
            value={stats.totalAttendees}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            variant="info"
          />
        </div>
      )}

      {/* Filters */}
      <EventsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Events Table */}
      {events.length > 0 ? (
        <EventsTable events={events} getEventStatus={getEventStatus} />
      ) : (
        <EmptyState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'secondary' | 'info';
}

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600',
    secondary: 'bg-gray-100 text-gray-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground/60 mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${variantStyles[variant]}`}>{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({
  searchTerm,
  statusFilter,
  onClearFilters,
}: {
  searchTerm: string;
  statusFilter: EventStatusFilter;
  onClearFilters: () => void;
}) {
  const hasFilters = searchTerm || statusFilter !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-12 text-center">
      <svg
        className="w-16 h-16 mx-auto text-foreground/20 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
      <p className="text-sm text-foreground/60 mb-6">
        {hasFilters
          ? 'Try adjusting your search or filters'
          : 'Get started by creating your first event'}
      </p>
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 text-foreground rounded-lg text-sm font-medium hover:bg-foreground/20 transition-all"
        >
          Clear Filters
        </button>
      ) : (
        <Link
          href="/admin/events/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-button text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      )}
    </div>
  );
}

function EventsLoadingSkeleton() {
  return (
    <div className="space-y-6 p-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-foreground/10 rounded w-24 mb-2"></div>
                <div className="h-8 bg-foreground/10 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-foreground/10 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10 animate-pulse">
        <div className="h-10 bg-foreground/5 rounded w-full"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-foreground/5 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}