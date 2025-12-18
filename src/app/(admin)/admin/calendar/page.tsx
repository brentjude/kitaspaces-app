"use client";

import { useState, useEffect } from "react";
import { CalendarItem } from "@/types/database";
import CalendarView from "./components/CalendarView";
import CalendarLegend from "./components/CalendarLegend";

interface ApiEvent {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  isFree: boolean;
  isMemberOnly: boolean;
  isRedemptionEvent: boolean;
  categoryId: string | null;
  categoryName?: string;
  categoryColor?: string | null;
  registrationCount: number;
  maxAttendees: number | null;
  type: "event";
}

interface ApiBooking {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  roomName: string;
  userName: string;
  userEmail: string;
  status: string;
  numberOfAttendees: number;
  type: "booking";
  bookingType: "user" | "customer";
}

interface CalendarStats {
  totalEvents: number;
  totalBookings: number;
  freeEvents: number;
  paidEvents: number;
  totalRegistrations: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [bookings, setBookings] = useState<CalendarItem[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Remove unused state since navigation is handled in CalendarView
  // const [currentDate, setCurrentDate] = useState(new Date());

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      // Use current date instead of state
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });

      const response = await fetch(`/api/admin/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        // Transform events
        const transformedEvents: CalendarItem[] = data.data.events.map(
          (event: ApiEvent) => {
            const eventDate = new Date(event.date);

            // Parse start and end times
            let startDateTime = eventDate;
            let endDateTime = new Date(
              eventDate.getTime() + 2 * 60 * 60 * 1000
            ); // Default 2 hours

            if (event.startTime) {
              const [hours, minutes] = event.startTime.split(":").map(Number);
              startDateTime = new Date(eventDate);
              startDateTime.setHours(hours, minutes, 0, 0);

              if (event.endTime) {
                const [endHours, endMinutes] = event.endTime
                  .split(":")
                  .map(Number);
                endDateTime = new Date(eventDate);
                endDateTime.setHours(endHours, endMinutes, 0, 0);
              } else {
                endDateTime = new Date(
                  startDateTime.getTime() + 2 * 60 * 60 * 1000
                );
              }
            }

            // Determine color class
            let colorClass =
              "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
            if (event.isFree) {
              colorClass =
                "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
            } else if (event.isMemberOnly) {
              colorClass =
                "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
            }

            return {
              id: event.id,
              title: event.title,
              start: startDateTime,
              end: endDateTime,
              type: "event" as const,
              location: event.location || undefined,
              colorClass,
              categoryName: event.categoryName,
              categoryColor: event.categoryColor || undefined,
              registrationCount: event.registrationCount,
              maxAttendees: event.maxAttendees,
            };
          }
        );

        // Transform bookings
        const transformedBookings: CalendarItem[] = data.data.bookings.map(
          (booking: ApiBooking) => {
            const bookingDate = new Date(booking.date);
            const [startHours, startMinutes] = booking.startTime
              .split(":")
              .map(Number);
            const [endHours, endMinutes] = booking.endTime
              .split(":")
              .map(Number);

            const startDateTime = new Date(bookingDate);
            startDateTime.setHours(startHours, startMinutes, 0, 0);

            const endDateTime = new Date(bookingDate);
            endDateTime.setHours(endHours, endMinutes, 0, 0);

            return {
              id: booking.id,
              title: booking.title,
              start: startDateTime,
              end: endDateTime,
              type: "booking" as const,
              location: booking.roomName,
              colorClass:
                "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
              roomName: booking.roomName,
              userName: booking.userName,
              status: booking.status,
            };
          }
        );

        setEvents(transformedEvents);
        setBookings(transformedBookings);
        setStats(data.data.stats);
      } else {
        console.error("Failed to fetch calendar data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []); // Empty dependency array - only fetch once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-foreground/60">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Calendar */}
            <div className="lg:col-span-3">
              <CalendarView events={events} bookings={bookings} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CalendarLegend />

              {/* Stats Card */}
              {stats && (
                <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/60">
                        Total Events
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {stats.totalEvents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/60">
                        Free Events
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {stats.freeEvents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/60">
                        Paid Events
                      </span>
                      <span className="text-sm font-semibold text-orange-600">
                        {stats.paidEvents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/60">
                        Room Bookings
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {stats.totalBookings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-foreground/10">
                      <span className="text-xs text-foreground/60">
                        Total Registrations
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {stats.totalRegistrations}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
