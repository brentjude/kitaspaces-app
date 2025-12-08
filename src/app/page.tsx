"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PublicHeader from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import EventCard from "@/app/components/EventCard";
import { CalendarIcon } from "@heroicons/react/24/outline";
import type { EventWithRelations } from "@/types";

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

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader currentUser={null} onLoginClick={handleLoginClick} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground/60">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PublicHeader
        currentUser={session?.user || null}
        onLoginClick={handleLoginClick}
      />

      <HeroSection />

      {/* Events Grid */}
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
              No events scheduled
            </h3>
            <p className="text-foreground/60 mt-1">
              Check back later for upcoming activities.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-foreground/10 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground/40 text-sm">
            © 2025 KITA Spaces. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
