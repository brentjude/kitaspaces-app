"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
import {
  NoSymbolIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  bookingDetails: {
    roomName: string;
    contactName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
  };
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Cancellation reason is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Booking"
      size="md"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            type="submit"
            form="cancelForm"
            disabled={!reason.trim() || isSubmitting}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <NoSymbolIcon className="w-4 h-4 mr-2" />
            {isSubmitting ? "Cancelling..." : "Cancel Booking"}
          </button>
        </>
      }
    >
      <form id="cancelForm" onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Warning Banner */}
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-orange-900 mb-1">
                Confirm Booking Cancellation
              </h4>
              <p className="text-sm text-orange-700">
                This action will cancel the booking and delete the associated
                payment record.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-4 bg-foreground/5 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Room:</span>
            <span className="font-semibold text-foreground">
              {bookingDetails.roomName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Customer:</span>
            <span className="font-semibold text-foreground">
              {bookingDetails.contactName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Date:</span>
            <span className="font-semibold text-foreground">
              {bookingDetails.bookingDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Time:</span>
            <span className="font-semibold text-foreground">
              {bookingDetails.startTime} - {bookingDetails.endTime}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Cancellation Reason */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reason for Cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            className="w-full rounded-lg border border-foreground/20 px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
            placeholder="Please provide a reason for cancelling this booking..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting}
          />
          <p className="text-xs text-foreground/60 mt-1">
            This reason will be logged for record-keeping purposes
          </p>
        </div>
      </form>
    </Modal>
  );
}
