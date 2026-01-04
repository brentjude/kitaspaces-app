"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { MembershipPerk } from "@/types/dashboard";
import {
  ChevronLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface MeetingRoomPerkModalProps {
  isOpen: boolean;
  onClose: () => void;
  perk: MembershipPerk;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

type BookingFormData = {
  roomId: string;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  numberOfAttendees: number;
  purpose: string;
};

type MeetingRoom = {
  id: string;
  name: string;
  capacity: number;
  hourlyRate: number;
  amenities: string[];
  description: string;
};

type TimeSlot = {
  time: string;
  isAvailable: boolean;
};

export default function MeetingRoomPerkModal({
  isOpen,
  onClose,
  perk,
  onSuccess,
}: MeetingRoomPerkModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    roomId: "",
    bookingDate: "",
    startTime: "",
    durationHours: 1,
    numberOfAttendees: 1,
    purpose: "MEETING",
  });

  const availableHours = perk.quantity - (perk.usedToday || 0);
  const maxHoursPerBooking = Math.min(
    availableHours,
    perk.maxPerDay || availableHours
  );

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      setStep(1);
      setFormData({
        roomId: "",
        bookingDate: "",
        startTime: "",
        durationHours: 1,
        numberOfAttendees: 1,
        purpose: "MEETING",
      });
      setError(null);
      setTimeSlots([]);
    }
  }, [isOpen]);

  // ✅ Fetch time slots when room and date are selected
  useEffect(() => {
    if (formData.roomId && formData.bookingDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [formData.roomId, formData.bookingDate]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/public/meeting-rooms");
      const result = await response.json();

      if (result.success) {
        const transformedRooms = result.data.map(
          (room: {
            id: string;
            name: string;
            capacity: number;
            hourlyRate: number;
            amenities: string | null;
            description: string | null;
          }) => ({
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hourlyRate: room.hourlyRate,
            amenities: room.amenities ? JSON.parse(room.amenities) : [],
            description: room.description || "",
          })
        );
        setRooms(transformedRooms);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load meeting rooms");
    }
  };

  const fetchTimeSlots = async () => {
    if (!formData.roomId || !formData.bookingDate) return;

    setLoadingSlots(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/public/meeting-rooms/${formData.roomId}/availability?date=${formData.bookingDate}`
      );
      const result = await response.json();

      if (result.success && result.data.timeSlots) {
        setTimeSlots(result.data.timeSlots);
      } else {
        setError("Failed to load available time slots");
        setTimeSlots([]);
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError("Failed to load available time slots");
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
      setError(null);
    }
  };

  const canProceedFromStep = () => {
    switch (step) {
      case 1:
        return formData.roomId !== "";
      case 2:
        return formData.bookingDate !== "" && formData.startTime !== "";
      case 3:
        return formData.numberOfAttendees > 0 && formData.purpose !== "";
      default:
        return true;
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const endTime = calculateEndTime(
        formData.startTime,
        formData.durationHours
      );

      const response = await fetch(`/api/user/perks/${perk.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: formData.roomId,
          bookingDate: formData.bookingDate,
          startTime: formData.startTime,
          endTime,
          duration: formData.durationHours,
          numberOfAttendees: formData.numberOfAttendees,
          purpose: formData.purpose,
          notes: `Redeemed ${formData.durationHours} hours from membership perk`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to redeem perk");
      }

      alert(result.data.message || "Meeting room hours redeemed successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem perk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => {
    const selectedRoom = rooms.find((r) => r.id === formData.roomId);

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Available Hours
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {availableHours} {perk.unit}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-3">Select a Room</h3>

        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loading meeting rooms...
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setFormData({ ...formData, roomId: room.id })}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.roomId === room.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{room.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Capacity: {room.capacity} people
                    </p>
                  </div>
                  {formData.roomId === room.id && (
                    <CheckCircleIcon className="w-6 h-6 text-primary shrink-0" />
                  )}
                </div>

                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedRoom && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Note: This booking will use your membership hours. No additional
              payment required.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    return (
      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Booking Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              min={today}
              max={maxDateStr}
              value={formData.bookingDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookingDate: e.target.value,
                  startTime: "", // Reset start time when date changes
                })
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Time Slot Selection */}
        {formData.bookingDate && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Start Time
            </label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <svg
                    className="animate-spin h-8 w-8 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-sm text-gray-500">
                    Loading available times...
                  </p>
                </div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p>No available time slots for this date</p>
                <p className="text-xs mt-2">Please select a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() =>
                      setFormData({ ...formData, startTime: slot.time })
                    }
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      formData.startTime === slot.time
                        ? "bg-primary text-white shadow-md"
                        : slot.isAvailable
                          ? "bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duration Selection */}
        {formData.startTime && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duration (Hours)
            </label>
            <select
              value={formData.durationHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationHours: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {Array.from(
                { length: Math.min(maxHoursPerBooking * 2, 8) },
                (_, i) => {
                  const hours = (i + 1) * 0.5;
                  if (hours <= maxHoursPerBooking) {
                    return (
                      <option key={hours} value={hours}>
                        {hours} {hours === 1 ? "hour" : "hours"}
                      </option>
                    );
                  }
                  return null;
                }
              ).filter(Boolean)}
            </select>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">End Time:</span>
                <span className="font-bold text-gray-900">
                  {calculateEndTime(formData.startTime, formData.durationHours)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-700">Hours to be used:</span>
                <span className="font-bold text-primary">
                  {formData.durationHours} / {availableHours} available
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    const selectedRoom = rooms.find((r) => r.id === formData.roomId);

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Room:</span>
            <span className="font-medium text-gray-900">
              {selectedRoom?.name}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">
              {new Date(formData.bookingDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium text-gray-900">
              {formData.startTime} -{" "}
              {calculateEndTime(formData.startTime, formData.durationHours)}
            </span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span className="text-gray-600">Duration:</span>
            <span className="font-bold text-primary">
              {formData.durationHours} {perk.unit}
            </span>
          </div>
        </div>

        {/* Number of Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Number of Attendees
          </label>
          <input
            type="number"
            min="1"
            max={selectedRoom?.capacity || 20}
            value={formData.numberOfAttendees}
            onChange={(e) =>
              setFormData({
                ...formData,
                numberOfAttendees: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum capacity: {selectedRoom?.capacity} people
          </p>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Purpose of Meeting
          </label>
          <select
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="MEETING">Meeting</option>
            <option value="TRAINING">Training</option>
            <option value="INTERVIEW">Interview</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Redeem Meeting Room Hours"
      size="lg"
      closeOnOverlayClick={false}
      footer={
        <>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromStep()}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceedFromStep() || isSubmitting}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Redeeming..." : "Confirm Booking"}
            </button>
          )}
        </>
      }
    >
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-1 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= i ? "flex-1 bg-primary" : "w-8 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </Modal>
  );
}
