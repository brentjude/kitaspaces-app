"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PublicHeader from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import EventCard from "@/app/components/EventCard";
import { CalendarIcon } from "@heroicons/react/24/outline";
import type { EventWithRelations } from "@/types";
import { generateEventSlug } from "@/lib/utils/slug";
import Footer from "@/app/components/Footer";

// Event Skeleton Component
function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-foreground/10 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-linear-to-br from-gray-200 to-gray-300 relative">
        <div className="absolute top-4 right-4">
          <div className="w-24 h-6 bg-gray-300 rounded-full" />
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="w-20 h-8 bg-white/50 rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="mb-2">
          <div className="w-20 h-5 bg-gray-200 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Event Details */}
        <div className="space-y-3 mt-auto border-t border-foreground/10 pt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2.5" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2.5" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="mt-6 w-full h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

// Events Section Skeleton
function EventsSectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Only fetch upcoming events (showPastEvents=false is default)
      const response = await fetch("/api/public/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId: string, eventTitle: string) => {
    const slug = generateEventSlug(eventTitle, eventId);
    router.push(`/events/${slug}`);
  };

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
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

      <HeroSection />

      {/* Events Section with Skeleton */}
      {loading ? (
        <EventsSectionSkeleton />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground">
              Upcoming Events
            </h2>
            <div className="text-sm text-foreground/60">
              Showing {events.length} {events.length === 1 ? "event" : "events"}
            </div>
          </div>

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
              <CalendarIcon className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                No upcoming events
              </h3>
              <p className="text-foreground/60 mt-1">
                Check back later for new activities and experiences.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}