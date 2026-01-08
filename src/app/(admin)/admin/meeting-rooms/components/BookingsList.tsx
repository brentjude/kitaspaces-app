"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import BookingListActions from "./BookingListActions";
import BookingDetailsModal from "./BookingDetailsModal";
import EditBookingModal from "./EditBookingModal";
import CancelBookingModal from "./CancelBookingModal";
import type {
  MeetingRoomBookingWithRelations,
  CustomerMeetingRoomBookingWithRelations,
} from "@/types/database";

type CombinedBooking =
  | (MeetingRoomBookingWithRelations & { type: "user" })
  | (CustomerMeetingRoomBookingWithRelations & { type: "customer" });

interface BookingsListProps {
  onBookingCountChange?: (count: number) => void;
}

export default function BookingsList({
  onBookingCountChange,
}: BookingsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<CombinedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedBooking, setSelectedBooking] =
    useState<CombinedBooking | null>(null);
  const [editingBooking, setEditingBooking] = useState<CombinedBooking | null>(
    null
  );
  const [cancellingBooking, setCancellingBooking] =
    useState<CombinedBooking | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (onBookingCountChange) {
      onBookingCountChange(bookings.length);
    }
  }, [bookings, onBookingCountChange]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/bookings");
      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (reason: string) => {
    if (!cancellingBooking) return;

    const bookingType =
      cancellingBooking.type === "user" ? "MEMBER" : "CUSTOMER";

    const response = await fetch(
      `/api/admin/meeting-rooms/bookings/${cancellingBooking.id}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingType, reason }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to cancel booking");
    }

    await fetchBookings();
    setCancellingBooking(null);
  };

  const handleDeleteBooking = async (
    bookingId: string,
    bookingType: "MEMBER" | "CUSTOMER"
  ) => {
    try {
      const response = await fetch(
        `/api/admin/meeting-rooms/bookings/${bookingId}?type=${bookingType}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete booking");
      }

      await fetchBookings();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete booking"
      );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchTerm.toLowerCase();
    const roomName = b.room?.name || "";
    const contactName =
      b.type === "user"
        ? b.contactName
        : (b as CustomerMeetingRoomBookingWithRelations).contactName;
    const contactEmail =
      b.type === "user"
        ? b.contactEmail
        : (b as CustomerMeetingRoomBookingWithRelations).contactEmail;

    return (
      roomName.toLowerCase().includes(searchLower) ||
      contactName?.toLowerCase().includes(searchLower) ||
      contactEmail?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      },
      CONFIRMED: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      },
      COMPLETED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      },
      NO_SHOW: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-foreground/40" />
          </div>
          <input
            type="text"
            placeholder="Search by guest, email or room name..."
            className="block w-full pl-10 pr-3 py-2.5 border border-foreground/20 rounded-lg bg-white placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bookings Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-foreground/10">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Booking Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-foreground/5">
                  {filteredBookings.map((booking) => {
                    const isUserBooking = booking.type === "user";
                    const bookingType = isUserBooking ? "MEMBER" : "CUSTOMER";
                    const contactName = isUserBooking
                      ? booking.contactName
                      : (booking as CustomerMeetingRoomBookingWithRelations)
                          .contactName;
                    const contactEmail = isUserBooking
                      ? booking.contactEmail
                      : (booking as CustomerMeetingRoomBookingWithRelations)
                          .contactEmail;

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-foreground/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {contactName?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground">
                                {contactName}
                              </div>
                              <div className="text-xs text-foreground/60">
                                {contactEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-foreground">
                            <PresentationChartBarIcon className="w-4 h-4 mr-1.5 text-foreground/40" />
                            {booking.room?.name || "Unknown Room"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            <CalendarIcon className="inline w-4 h-4 mr-1.5 text-foreground/40" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-foreground/60 mt-1">
                            <ClockIcon className="inline w-4 h-4 mr-1.5 text-foreground/40" />
                            {booking.startTime} - {booking.endTime} (
                            {booking.duration} hrs)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <BookingListActions
                            bookingId={booking.id}
                            bookingType={bookingType}
                            status={booking.status}
                            onView={() => setSelectedBooking(booking)}
                            onEdit={() => {
                              if (!booking.room || !booking.room.id) {
                                console.error(
                                  "Cannot edit booking: Invalid room data",
                                  booking
                                );
                                alert(
                                  "Unable to edit this booking. Room data is invalid."
                                );
                                return;
                              }
                              setEditingBooking(booking);
                            }}
                            onCancel={() => setCancellingBooking(booking)}
                            onDelete={() => setShowDeleteConfirm(booking.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-foreground/40 text-sm italic"
                      >
                        {searchTerm
                          ? "No bookings found matching your search."
                          : "No bookings yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingDetailsModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onRefresh={fetchBookings}
      />

      {editingBooking && editingBooking.room && (
        <EditBookingModal
          isOpen={!!editingBooking}
          onClose={() => setEditingBooking(null)}
          onSuccess={() => {
            fetchBookings();
            setEditingBooking(null);
          }}
          bookingId={editingBooking.id}
          bookingType={editingBooking.type === "user" ? "MEMBER" : "CUSTOMER"}
          room={editingBooking.room}
          currentDate={
            new Date(editingBooking.bookingDate).toISOString().split("T")[0]
          }
          currentStartTime={editingBooking.startTime}
          currentEndTime={editingBooking.endTime}
          currentDuration={editingBooking.duration}
          contactName={
            editingBooking.type === "user"
              ? editingBooking.contactName || ""
              : (editingBooking as CustomerMeetingRoomBookingWithRelations)
                  .contactName
          }
        />
      )}

      {cancellingBooking && (
        <CancelBookingModal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancelBooking}
          bookingDetails={{
            roomName: cancellingBooking.room?.name || "Unknown Room",
            contactName:
              cancellingBooking.type === "user"
                ? cancellingBooking.contactName || ""
                : (cancellingBooking as CustomerMeetingRoomBookingWithRelations)
                    .contactName,
            bookingDate: new Date(
              cancellingBooking.bookingDate
            ).toLocaleDateString(),
            startTime: cancellingBooking.startTime,
            endTime: cancellingBooking.endTime,
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Delete Cancelled Booking
            </h3>
            <p className="text-sm text-foreground/70 mb-6">
              Are you sure you want to permanently delete this cancelled
              booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const booking = bookings.find(
                    (b) => b.id === showDeleteConfirm
                  );
                  if (booking) {
                    const bookingType =
                      booking.type === "user" ? "MEMBER" : "CUSTOMER";
                    handleDeleteBooking(booking.id, bookingType);
                  }
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
