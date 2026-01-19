"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Event, EventCategory } from "@/types/database";
import {
  fetchPublicEvents,
  fetchPublicEventCategories,
} from "@/lib/api/public";
import { generateEventSlug } from "@/lib/utils/slug";
import PublicHeader from "@/app/components/Header";
import EventCard from "@/app/components/EventCard";
import EventsSearchBar from "./components/EventsSearchBar";
import Footer from "@/app/components/Footer";

type PublicEvent = Event & {
  category?: EventCategory | null;
  registrationCount?: number;
};

export default function EventsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<PublicEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  // Load initial data once
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [eventsResponse, categoriesResponse] = await Promise.all([
          fetchPublicEvents({}),
          fetchPublicEventCategories(),
        ]);

        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data);
          setFilteredEvents(eventsResponse.data);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Only run once on mount

  // Filter events client-side
  useEffect(() => {
    startTransition(() => {
      let filtered = [...events];

      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(search) ||
            event.description?.toLowerCase().includes(search) ||
            event.location?.toLowerCase().includes(search)
        );
      }

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(
          (event) => event.categoryId === selectedCategory
        );
      }

      setFilteredEvents(filtered);
    });
  }, [searchTerm, selectedCategory, events]);

  const handleEventClick = (eventId: string, eventTitle: string) => {
    const slug = generateEventSlug(eventTitle, eventId);
    router.push(`/events/${slug}`);
  };

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
        <PublicHeader
          currentUser={
            session?.user
              ? {
                  name: session.user.name || "",
                  email: session.user.email || "",
                  role: session.user.role,
                }
              : null
          }
          onLoginClick={handleLoginClick}
        />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium text-foreground/70">
              Loading events...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      <PublicHeader
        currentUser={
          session?.user
            ? {
                name: session.user.name || "",
                email: session.user.email || "",
                role: session.user.role,
              }
            : null
        }
        onLoginClick={handleLoginClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            All Events
          </h1>
          <p className="text-lg text-foreground/60">
            Discover upcoming events and experiences at KITA Spaces
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-10">
          <EventsSearchBar
            categories={categories}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            initialSearch={searchTerm}
            initialCategory={selectedCategory || "all"}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-foreground/60">
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                Filtering...
              </span>
            ) : filteredEvents.length === 0 ? (
              "No events found"
            ) : (
              `${filteredEvents.length} ${
                filteredEvents.length === 1 ? "event" : "events"
              } found`
            )}
          </p>
        </div>

        {/* Events Grid */}
        <div className={isPending ? "opacity-60 transition-opacity" : ""}>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-foreground/10 shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-orange-100/50 flex items-center justify-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-primary/40" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No events found
              </h3>
              <p className="text-foreground/60 text-lg mb-6">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
      </div>
      <Footer />
    </div>
  );
}
