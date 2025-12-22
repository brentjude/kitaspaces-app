"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockOutlineIcon,
} from "@heroicons/react/24/outline";
import type { MeetingRoomBookingWithRelations, CustomerMeetingRoomBookingWithRelations } from "@/types/database";
import { BookingStatus } from "@/types/database";

type CombinedBooking = 
  | (MeetingRoomBookingWithRelations & { type: 'user' })
  | (CustomerMeetingRoomBookingWithRelations & { type: 'customer' });

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: CombinedBooking | null;
  onRefresh?: () => void;
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onRefresh,
}: BookingDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  if (!booking) return null;

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;

    setIsUpdating(true);
    setUpdateError("");

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          type: booking.type 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }

      if (onRefresh) {
        onRefresh();
      }
      onClose();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Failed to update booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: ClockOutlineIcon,
      },
      CONFIRMED: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: CheckCircleIcon,
      },
      COMPLETED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: CheckCircleIcon,
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: XCircleIcon,
      },
      NO_SHOW: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        icon: XCircleIcon,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        <Icon className="w-4 h-4" />
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;

    const badges = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
      COMPLETED: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
      FAILED: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      REFUNDED: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {status}
      </span>
    );
  };

  const isUserBooking = booking.type === 'user';
  const contactName = isUserBooking 
    ? booking.contactName 
    : (booking as CustomerMeetingRoomBookingWithRelations).contactName;
  const contactEmail = isUserBooking 
    ? booking.contactEmail 
    : (booking as CustomerMeetingRoomBookingWithRelations).contactEmail;
  const contactMobile = isUserBooking 
    ? booking.contactMobile 
    : (booking as CustomerMeetingRoomBookingWithRelations).contactMobile;
  const company = booking.company;
  const designation = booking.designation;

  const canUpdateStatus = booking.status !== "COMPLETED" && booking.status !== "CANCELLED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            Close
          </button>
          {canUpdateStatus && booking.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => handleStatusUpdate("CONFIRMED")}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Confirm Booking
              </button>
            </div>
          )}
          {canUpdateStatus && booking.status === "CONFIRMED" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("NO_SHOW")}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Mark as No Show
              </button>
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </>
      }
    >
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {updateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {updateError}
          </div>
        )}

        {/* Header Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {booking.room?.name || 'Room'}
              </h3>
              <p className="text-sm text-foreground/60 mt-1">
                Booking ID: {booking.id}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              isUserBooking 
                ? 'bg-primary/10 text-primary'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isUserBooking ? 'USER BOOKING' : 'GUEST BOOKING'}
            </span>
            {isUserBooking && (booking as MeetingRoomBookingWithRelations).isUsingMembershipPerk && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                USING MEMBERSHIP PERK
              </span>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg p-4 border border-foreground/10">
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <UserIcon className="w-4 h-4 mr-2 text-foreground/40 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{contactName}</p>
                {designation && (
                  <p className="text-xs text-foreground/60">{designation}</p>
                )}
              </div>
            </div>
            {contactEmail && (
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-foreground/40" />
                <p className="text-foreground/80">{contactEmail}</p>
              </div>
            )}
            {contactMobile && (
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2 text-foreground/40" />
                <p className="text-foreground/80">{contactMobile}</p>
              </div>
            )}
            {company && (
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-foreground/40" />
                <p className="text-foreground/80">{company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">
            Booking Schedule
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date:
              </span>
              <span className="font-medium text-blue-900">
                {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Time:
              </span>
              <span className="font-medium text-blue-900">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Duration:</span>
              <span className="font-medium text-blue-900">
                {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Attendees:</span>
              <span className="font-medium text-blue-900">
                {booking.numberOfAttendees} {booking.numberOfAttendees === 1 ? 'person' : 'people'}
              </span>
            </div>
            {booking.purpose && (
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Purpose:</span>
                <span className="font-medium text-blue-900">{booking.purpose}</span>
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        {booking.room && (
          <div className="bg-white rounded-lg p-4 border border-foreground/10">
            <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Room Details
            </h4>
            <div className="space-y-2 text-sm">
              {booking.room.floor && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Floor:
                  </span>
                  <span className="font-medium text-foreground">{booking.room.floor}</span>
                </div>
              )}
              {booking.room.roomNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground/60">Room Number:</span>
                  <span className="font-medium text-foreground">{booking.room.roomNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Capacity:</span>
                <span className="font-medium text-foreground">{booking.room.capacity} people</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Hourly Rate:</span>
                <span className="font-medium text-foreground">₱{booking.room.hourlyRate.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wide flex items-center">
            <BanknotesIcon className="w-4 h-4 mr-2" />
            Payment Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-orange-700">Total Amount:</span>
              <span className="font-bold text-xl text-orange-900">
                ₱{booking.totalAmount.toFixed(2)}
              </span>
            </div>
            {booking.payment && (
              <>
                <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                  <span className="text-orange-700">Payment Method:</span>
                  <span className="font-medium text-orange-900">
                    {booking.payment.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Payment Status:</span>
                  {getPaymentStatusBadge(booking.payment.status)}
                </div>
                {booking.payment.paymentReference && (
                  <div className="flex items-center justify-between">
                    <span className="text-orange-700">Reference:</span>
                    <span className="font-medium text-orange-900 font-mono text-xs">
                      {booking.payment.paymentReference}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        {booking.notes && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Additional Notes
            </h4>
            <p className="text-sm text-foreground/80">{booking.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-foreground/40 space-y-1 pt-4 border-t border-foreground/10">
          <p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
          {booking.checkedInAt && (
            <p>Checked In: {new Date(booking.checkedInAt).toLocaleString()}</p>
          )}
          {booking.checkedOutAt && (
            <p>Checked Out: {new Date(booking.checkedOutAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}