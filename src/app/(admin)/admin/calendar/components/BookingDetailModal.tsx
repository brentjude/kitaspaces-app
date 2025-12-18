"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { CalendarItem } from "@/types/database";
import { format } from "date-fns";
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
} from "@heroicons/react/24/outline";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: CalendarItem;
}

interface BookingDetails {
  id: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  numberOfAttendees: number;
  purpose: string | null;
  status: string;
  room: {
    name: string;
    capacity: number;
    location: string | null;
    amenities: string[];
  };
  user?: {
    name: string;
    email: string;
    contactNumber: string | null;
    isMember: boolean;
  };
  customer?: {
    name: string;
    email: string;
    contactNumber: string | null;
  };
  createdAt: Date;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailModalProps) {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && booking.id) {
      fetchBookingDetails();
    }
  }, [isOpen, booking.id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`);
      const data = await response.json();

      if (data.success) {
        setDetails(data.data);
      } else {
        setError(data.error || "Failed to load booking details");
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      CONFIRMED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: "Confirmed",
      },
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <PendingIcon className="w-4 h-4" />,
        label: "Pending",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircleIcon className="w-4 h-4" />,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg">
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-2 text-sm text-foreground/60">
              Loading booking details...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {details.room.name}
              </h3>
              {getStatusBadge(details.status)}
            </div>

            {/* Date & Time */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(details.bookingDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {details.startTime} - {details.endTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Room Details
              </h4>
              <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
                {details.room.location && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-foreground/40" />
                    <div>
                      <p className="text-xs text-foreground/60">Location</p>
                      <p className="text-sm font-medium text-foreground">
                        {details.room.location}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5 text-foreground/40" />
                  <div>
                    <p className="text-xs text-foreground/60">Capacity</p>
                    <p className="text-sm font-medium text-foreground">
                      {details.room.capacity} people (Booked for{" "}
                      {details.numberOfAttendees})
                    </p>
                  </div>
                </div>
                {details.room.amenities.length > 0 && (
                  <div>
                    <p className="text-xs text-foreground/60 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {details.room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white border border-foreground/10 rounded-md text-xs text-foreground"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booker Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Booked By
              </h4>
              <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-foreground/40" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground/60">Name</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {details.user?.name || details.customer?.name}
                      </p>
                      {details.user?.isMember && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-foreground/40" />
                  <div>
                    <p className="text-xs text-foreground/60">Email</p>
                    <p className="text-sm font-medium text-foreground">
                      {details.user?.email || details.customer?.email}
                    </p>
                  </div>
                </div>
                {(details.user?.contactNumber ||
                  details.customer?.contactNumber) && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-foreground/40" />
                    <div>
                      <p className="text-xs text-foreground/60">
                        Contact Number
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {details.user?.contactNumber ||
                          details.customer?.contactNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Purpose */}
            {details.purpose && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Purpose
                </h4>
                <div className="bg-foreground/5 rounded-xl p-4">
                  <p className="text-sm text-foreground/70">
                    {details.purpose}
                  </p>
                </div>
              </div>
            )}

            {/* Booking Info */}
            <div className="pt-4 border-t border-foreground/10">
              <p className="text-xs text-foreground/50">
                Booked on {format(new Date(details.createdAt), "PPp")}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
