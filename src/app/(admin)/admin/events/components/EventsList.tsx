"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { EventWithRelations } from "@/types";
import EventsTable from "./EventsTable";
import CreateEventModal from "@/app/(admin)/components/CreateEventModal";

type EventStatusFilter = "all" | "upcoming" | "completed";

interface EventsListProps {
  events: EventWithRelations[];
  onEventCreated?: () => void;
}

export default function EventsList({
  events,
  onEventCreated,
}: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Listen for event creation
  useEffect(() => {
    const handleEventCreated = () => {
      if (onEventCreated) {
        onEventCreated();
      }
      setShowCreateModal(false);
    };

    window.addEventListener("eventCreated", handleEventCreated);
    return () => window.removeEventListener("eventCreated", handleEventCreated);
  }, [onEventCreated]);

  // Determine event status based on date
  const getEventStatus = (eventDate: Date): "upcoming" | "completed" => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime > now ? "upcoming" : "completed";
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const status = getEventStatus(event.date);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // 🔧 UPDATED: Calculate statistics using pax data
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => getEventStatus(e.date) === "upcoming"
    ).length;
    const completedEvents = events.filter(
      (e) => getEventStatus(e.date) === "completed"
    ).length;

    // Calculate total attendees including pax
    const totalAttendees = events.reduce((sum, event) => {
      // Member attendees = registrations + their pax
      const memberRegistrations = event.registrations?.length || 0;
      const memberPax =
        event.registrations?.reduce((paxSum, reg) => {
          return paxSum + (reg.pax?.length || 0);
        }, 0) || 0;

      // Customer attendees = registrations + their pax
      const customerRegistrations = event.customerRegistrations?.length || 0;
      const customerPax =
        event.customerRegistrations?.reduce((paxSum, reg) => {
          return paxSum + (reg.pax?.length || 0);
        }, 0) || 0;

      return (
        sum +
        memberRegistrations +
        memberPax +
        customerRegistrations +
        customerPax
      );
    }, 0);

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalAttendees,
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-foreground/10 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            Events
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Events"
            value={stats.totalEvents}
            icon={<CalendarIcon className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcomingEvents}
            icon={<ClockIcon className="w-6 h-6" />}
            variant="info"
          />
          <StatCard
            label="Completed"
            value={stats.completedEvents}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            variant="success"
          />
          <StatCard
            label="Total Attendees"
            value={stats.totalAttendees}
            icon={<UsersIcon className="w-6 h-6" />}
            variant="secondary"
          />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "upcoming"
                    ? "bg-primary text-white"
                    : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "completed"
                    ? "bg-primary text-white"
                    : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        {filteredEvents.length > 0 ? (
          <EventsTable
            events={filteredEvents}
            getEventStatus={getEventStatus}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              No events found
            </h3>
            <p className="text-foreground/60">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first event to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "secondary" | "info";
}

function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-600",
    secondary: "bg-gray-100 text-gray-600",
    info: "bg-blue-100 text-blue-600",
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
