'use client';

import { useState, useEffect } from 'react';
import type { EventWithRelations } from '@/types';

export type EventStatusFilter = 'all' | 'upcoming' | 'completed';

interface UseEventsOptions {
  status?: EventStatusFilter;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

interface EventsStats {
  total: number;
  upcoming: number;
  completed: number;
  totalAttendees: number;
}

interface UseEventsReturn {
  events: EventWithRelations[];
  stats: EventsStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const {
    status = 'all',
    search = '',
    sortBy = 'date',
    sortOrder = 'desc',
    autoFetch = true,
  } = options;

  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [stats, setStats] = useState<EventsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      if (data.success) {
        setEvents(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [status, search, sortBy, sortOrder, autoFetch]);

  return {
    events,
    stats,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}