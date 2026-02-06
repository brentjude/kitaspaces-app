"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import DateStep from "./booking-steps/DateStep";
import TimeStep from "./booking-steps/TimeStep";
import DetailsStep from "./booking-steps/DetailsStep";
import SuccessStep from "./booking-steps/SuccessStep";
import { MeetingRoom, BookingStatus } from "@/types/database";
import { ChevronLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface BookingModalProps {
  room: MeetingRoom;
  currentUser?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export type BookingFormData = {
  bookingDate: string;
  startTimeSlot: string;
  durationHours: number;
  guestDetails: {
    company: string;
    name: string;
    designation: string;
    email: string;
    mobile: string;
    purpose: string;
    numberOfAttendees: number;
  };
  agreedToTerms: boolean;
};

export default function BookingModal({
  room,
  currentUser,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  const isLoggedIn = !!currentUser?.id;

  const [formData, setFormData] = useState<BookingFormData>({
    bookingDate: "",
    startTimeSlot: "",
    durationHours: 1,
    guestDetails: {
      company: "",
      name: currentUser?.name || "",
      designation: "",
      email: currentUser?.email || "",
      mobile: "",
      purpose: "MEETING",
      numberOfAttendees: 1,
    },
    agreedToTerms: false,
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        guestDetails: {
          ...prev.guestDetails,
          name: currentUser.name || "",
          email: currentUser.email || "",
        },
      }));
    }
  }, [currentUser]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((prev) => (prev + 1) as typeof step);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const canProceedFromStep = () => {
    switch (step) {
      case 1:
        return formData.bookingDate !== "";
      case 2:
        return formData.startTimeSlot !== "" && formData.durationHours > 0;
      case 3:
        return (
          formData.guestDetails.company.trim() !== "" &&
          formData.guestDetails.name.trim() !== "" &&
          formData.guestDetails.email.trim() !== "" &&
          formData.guestDetails.mobile.trim() !== "" &&
          formData.guestDetails.purpose.trim() !== "" &&
          formData.agreedToTerms
        );
      default:
        return true;
    }
  };

  const calculateEndTime = (
    startTime: string,
    durationHours: number,
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedFromStep()) return;

    setIsSubmitting(true);

    try {
      const endTime = calculateEndTime(
        formData.startTimeSlot,
        formData.durationHours,
      );
      const totalAmount = room.hourlyRate * formData.durationHours;

      const bookingData = {
        roomId: room.id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTimeSlot,
        endTime,
        duration: formData.durationHours,
        company: formData.guestDetails.company,
        contactName: formData.guestDetails.name,
        designation: formData.guestDetails.designation || undefined,
        contactEmail: formData.guestDetails.email,
        contactMobile: formData.guestDetails.mobile,
        numberOfAttendees: formData.guestDetails.numberOfAttendees,
        purpose: formData.guestDetails.purpose,
        status: "PENDING" as BookingStatus,
        totalAmount,
        paymentMethod: "CASH",
      };

      const response = await fetch("/api/public/meeting-rooms/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create booking");
      }

      setBookingReference(result.data.paymentReference || "");
      setShowSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create booking",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    onSuccess();
    onClose();
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <SuccessStep
          room={room}
          bookingDate={formData.bookingDate}
          startTime={formData.startTimeSlot}
          endTime={calculateEndTime(
            formData.startTimeSlot,
            formData.durationHours,
          )}
          reference={bookingReference}
          onClose={handleSuccessClose}
        />
      );
    }

    switch (step) {
      case 1:
        return (
          <DateStep
            selectedDate={formData.bookingDate}
            onDateChange={(date) =>
              setFormData({ ...formData, bookingDate: date })
            }
          />
        );
      case 2:
        return (
          <TimeStep
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
          />
        );
      case 3:
        return (
          <DetailsStep
            room={room}
            durationHours={formData.durationHours}
            bookingDate={formData.bookingDate}
            guestDetails={formData.guestDetails}
            agreedToTerms={formData.agreedToTerms}
            onDetailsChange={(details) =>
              setFormData({ ...formData, guestDetails: details })
            }
            onTermsChange={(agreed) =>
              setFormData({ ...formData, agreedToTerms: agreed })
            }
            isLoggedIn={isLoggedIn}
          />
        );
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {renderStepContent()}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Book ${room.name}`}
      size="lg"
      closeOnOverlayClick={false}
      footer={
        <>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
            >
              <ChevronLeftIcon className="w-4 h-4" /> Back
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromStep()}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-md"
            >
              Next Step <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceedFromStep() || isSubmitting}
              className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="inline w-4 h-4 mr-2 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          )}
        </>
      }
    >
      {/* Scrollable Content Container - Mobile Optimized */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-150 px-6 py-4">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-1 mb-6 sticky top-0 bg-white z-10 pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
                  step >= i ? "bg-primary" : "bg-foreground/10"
                }`}
              />
              {i < 3 && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-0.5 transition-all duration-300 ${
                    step > i ? "bg-primary" : "bg-foreground/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-50">{renderStepContent()}</div>
      </div>
    </Modal>
  );
}
