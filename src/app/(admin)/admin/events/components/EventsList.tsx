'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { EventWithRelations } from '@/types';
import { type EventStatusFilter } from '@/hooks/useEvents';
import EventsTable from './EventsTable';
import EventsFilters from './EventsFilter';

interface EventsListProps {
  events: EventWithRelations[];
  onEventCreated?: () => void;
}

export default function EventsList({ events, onEventCreated }: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  // Listen for event creation
  useEffect(() => {
    const handleEventCreated = () => {
      if (onEventCreated) {
        onEventCreated();
      }
    };

    window.addEventListener('eventCreated', handleEventCreated);
    return () => window.removeEventListener('eventCreated', handleEventCreated);
  }, [onEventCreated]);

  // Determine event status based on date
  const getEventStatus = (eventDate: Date): 'upcoming' | 'completed' => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime > now ? 'upcoming' : 'completed';
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());

      const eventStatus = getEventStatus(event.date);
      const matchesStatus =
        statusFilter === 'all' || eventStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => getEventStatus(e.date) === 'upcoming'
    ).length;
    const completedEvents = events.filter(
      (e) => getEventStatus(e.date) === 'completed'
    ).length;
    const totalAttendees = events.reduce(
      (sum, event) => sum + (event.registrations?.length || 0),
      0
    );

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalAttendees,
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Upcoming"
          value={stats.upcomingEvents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
        />
        <StatCard
          label="Completed"
          value={stats.completedEvents}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="secondary"
        />
        <StatCard
          label="Total Attendees"
          value={stats.totalAttendees}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          variant="info"
        />
      </div>

      {/* Filters */}
      <EventsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Events Table */}
      <EventsTable events={filteredEvents} getEventStatus={getEventStatus} />

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-foreground/20 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No events found
          </h3>
          <p className="text-sm text-foreground/60 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first event'}
          </p>
        </div>
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
        <div className={`p-3 rounded-lg ${variantStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}