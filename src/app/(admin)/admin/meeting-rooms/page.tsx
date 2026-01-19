"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MeetingRoomsList from "./components/MeetingRoomsList";
import BookingsList from "./components/BookingsList";
import AdminBookingModal from "./components/AdminBookingModal";
import { MeetingRoom } from "@/types/database";
import {
  PresentationChartBarIcon,
  CalendarIcon,
  CalendarDaysIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function MeetingRoomsPage() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">("rooms");
  const [bookingCount, setBookingCount] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Protect route
  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "ADMIN")
  ) {
    redirect("/auth/signin");
  }

  useEffect(() => {
    fetchRooms();
    fetchBookingCount();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/meeting-rooms");
      if (!response.ok) throw new Error("Failed to fetch rooms");

      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingCount = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      if (data.success && data.data) {
        setBookingCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching booking count:", error);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    // Refresh booking count after successful booking
    fetchBookingCount();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading meeting rooms...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "rooms" as const,
      label: "Rooms",
      icon: <PresentationChartBarIcon className="w-5 h-5" />,
      count: rooms.length,
    },
    {
      id: "bookings" as const,
      label: "Bookings",
      icon: <CalendarIcon className="w-5 h-5" />,
      count: bookingCount,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Meeting Room Management
              </h2>
              <p className="text-foreground/60 text-sm mt-1">
                Manage bookable spaces and view customer reservations.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Book Room Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Book Room
              </button>

              {/* Calendar Button - Only show on bookings tab */}
              {activeTab === "bookings" && (
                <Link
                  href="/admin/calendar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <CalendarDaysIcon className="w-5 h-5" />
                  Calendar View
                </Link>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-foreground/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>
                    {tab.label} ({tab.count})
                  </span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "rooms" ? (
            <MeetingRoomsList rooms={rooms} onRoomsChange={fetchRooms} />
          ) : (
            <BookingsList onBookingCountChange={setBookingCount} />
          )}
        </div>
      </div>

      {/* Admin Booking Modal */}
      {showBookingModal && (
        <AdminBookingModal
          rooms={rooms}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}