"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import AdminDateStep from "./admin-booking-steps/AdminDateStep";
import AdminTimeStep from "./admin-booking-steps/AdminTimeStep";
import { MeetingRoom } from "@/types/database";
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  bookingType: "MEMBER" | "CUSTOMER";
  room: MeetingRoom;
  currentDate: string;
  currentStartTime: string;
  currentEndTime: string;
  currentDuration: number;
  contactName: string;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  bookingType,
  room,
  currentDate,
  currentStartTime,
  currentEndTime,
  currentDuration,
  contactName,
}: EditBookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bookingDate: currentDate,
    startTimeSlot: currentStartTime,
    durationHours: currentDuration,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bookingDate: currentDate,
        startTimeSlot: currentStartTime,
        durationHours: currentDuration,
      });
      setStep(1);
      setError(null);
    }
  }, [isOpen, currentDate, currentStartTime, currentDuration, room]);

  // ✅ Enhanced validation with better error message
  if (!room || !room.id) {
    console.error("EditBookingModal: Invalid room data", { room, bookingId });
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Error"
        size="md"
        footer={
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        }
      >
        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">Invalid Room Data</h4>
              <p className="text-sm text-red-700">
                Unable to load room information for this booking. Please try
                refreshing the page.
              </p>
              <p className="text-xs text-red-600 mt-2">
                Booking ID: {bookingId}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const calculateEndTime = (
    startTime: string,
    durationHours: number
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Only submit if on step 2
    if (step !== 2) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endTime = calculateEndTime(
        formData.startTimeSlot,
        formData.durationHours
      );
      const totalAmount = room.hourlyRate * formData.durationHours;

      const response = await fetch(
        `/api/admin/meeting-rooms/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingType,
            bookingDate: formData.bookingDate,
            startTime: formData.startTimeSlot,
            endTime,
            duration: formData.durationHours,
            totalAmount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update booking");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handler for next button
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (formData.bookingDate) {
      setStep(2);
    }
  };

  // ✅ Handler for back button
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setStep(1);
  };

  const hasChanges =
    formData.bookingDate !== currentDate ||
    formData.startTimeSlot !== currentStartTime ||
    formData.durationHours !== currentDuration;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Booking Schedule"
      size="lg"
      closeOnOverlayClick={false}
      footer={
        <>
          {step === 2 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          <div className="flex-1" />

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!formData.bookingDate}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Next: Select Time
            </button>
          ) : (
            <button
              type="submit"
              form="editBookingForm"
              disabled={!hasChanges || isSubmitting}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? "Updating..." : "Update Booking"}
            </button>
          )}
        </>
      }
    >
      <form id="editBookingForm" onSubmit={handleSubmit} className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-1 mb-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= i ? "flex-1 bg-primary" : "w-8 bg-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Booking Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">
                Editing Schedule for {contactName}
              </h4>
              <p className="text-xs text-blue-700">
                <strong>{room.name}</strong> - Current: {currentDate} at{" "}
                {currentStartTime}-{currentEndTime}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        {step === 1 && (
          <AdminDateStep
            selectedDate={formData.bookingDate}
            onDateChange={(date) =>
              setFormData({ ...formData, bookingDate: date })
            }
          />
        )}

        {step === 2 && (
          <AdminTimeStep
            room={room}
            selectedDate={formData.bookingDate}
            startTimeSlot={formData.startTimeSlot}
            durationHours={formData.durationHours}
            onTimeChange={(startTime, duration) =>
              setFormData({
                ...formData,
                startTimeSlot: startTime,
                durationHours: duration,
              })
            }
            excludeBookingId={bookingId}
            bookingType={bookingType}
          />
        )}
      </form>
    </Modal>
  );
}
