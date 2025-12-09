'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Event, EventCategory } from '@/types/database';
import {
  fetchPublicEvents,
  fetchPublicEventCategories,
} from '@/lib/api/public';
import { generateEventSlug } from '@/lib/utils/slug';
import PublicHeader from '@/app/components/Header';
import EventCard from '@/app/components/EventCard';
import EventsSearchBar from './components/EventsSearchBar';

type PublicEvent = Event & {
  category?: EventCategory | null;
  registrationCount?: number;
};

export default function EventsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsResponse, categoriesResponse] = await Promise.all([
        fetchPublicEvents({ search: searchTerm, categoryId: selectedCategory }),
        fetchPublicEventCategories(),
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEventClick = (eventId: string, eventTitle: string) => {
    const slug = generateEventSlug(eventTitle, eventId);
    router.push(`/events/${slug}`);
  };

  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-foreground/60">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader 
        currentUser={
          session?.user
            ? { 
                name: session.user.name || '', 
                email: session.user.email || '',
                role: session.user.role 
              }
            : null
        }
        onLoginClick={handleLoginClick} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">All Events</h1>
          <p className="text-foreground/60 mt-2">
            Discover upcoming events and experiences at KITA Spaces
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <EventsSearchBar
            categories={categories}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            initialSearch={searchTerm}
            initialCategory={selectedCategory || 'all'}
          />
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={handleEventClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-foreground/5 rounded-2xl border border-dashed border-foreground/20">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No events found</h3>
            <p className="text-foreground/50 mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}