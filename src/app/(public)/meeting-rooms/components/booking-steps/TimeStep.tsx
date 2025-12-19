'use client';

import { useState, useEffect } from 'react';
import { MeetingRoom } from '@/types/database';
import { ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface TimeStepProps {
  room: MeetingRoom;
  selectedDate: string;
  startTimeSlot: string;
  durationHours: number;
  onTimeChange: (startTime: string, duration: number) => void;
}

type BookedSlot = {
  startTime: string;
  endTime: string;
};

export default function TimeStep({
  room,
  selectedDate,
  startTimeSlot,
  durationHours,
  onTimeChange,
}: TimeStepProps) {
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDuration, setMaxDuration] = useState(8);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate, room.id]);

  // Recalculate max duration when start time changes
  useEffect(() => {
    if (startTimeSlot) {
      calculateMaxDuration();
    }
  }, [startTimeSlot, bookedSlots]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/meeting-rooms/${room.id}/availability?date=${selectedDate}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setBookedSlots(data.data.bookedSlots || []);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate 30-minute time slots based on room operating hours
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    const startHour = room.startTime ? parseInt(room.startTime.split(':')[0]) : 9;
    const endHour = room.endTime ? parseInt(room.endTime.split(':')[0]) : 18;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    // Add the final slot at closing time
    slots.push(`${String(endHour).padStart(2, '0')}:00`);

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if a time slot is booked
  const isTimeSlotBooked = (time: string): boolean => {
    for (const booking of bookedSlots) {
      // A time slot is booked if it falls within any booking's time range
      if (time >= booking.startTime && time < booking.endTime) {
        return true;
      }
    }
    return false;
  };

  // Calculate time in minutes from "HH:MM" format
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate maximum available duration from a given start time
  const calculateMaxDuration = () => {
    if (!startTimeSlot) {
      setMaxDuration(8);
      return;
    }

    const startMinutes = timeToMinutes(startTimeSlot);
    const roomEndMinutes = timeToMinutes(room.endTime || '18:00');
    
    // Find the earliest booking that starts after our selected start time
    let nextBookingMinutes = roomEndMinutes;
    
    for (const booking of bookedSlots) {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      
      // If this booking starts after our start time and is earlier than current next booking
      if (bookingStartMinutes > startMinutes && bookingStartMinutes < nextBookingMinutes) {
        nextBookingMinutes = bookingStartMinutes;
      }
    }

    // Calculate maximum available minutes
    const availableMinutes = nextBookingMinutes - startMinutes;
    
    // 🔧 UPDATED: Convert to hours and round down to nearest full hour
    const maxHours = Math.floor(availableMinutes / 60);
    
    // Set max duration (minimum 1 hour, maximum 8 hours)
    const finalMaxDuration = Math.max(1, Math.min(maxHours, 8));
    setMaxDuration(finalMaxDuration);

    // Auto-adjust current duration if it exceeds max
    if (durationHours > finalMaxDuration) {
      onTimeChange(startTimeSlot, finalMaxDuration);
    }
  };

  // Check if a time slot can be selected (must have at least 1 hour available after it)
  const canSelectTimeSlot = (slotTime: string): boolean => {
    // Don't allow booking if slot is already booked
    if (isTimeSlotBooked(slotTime)) {
      return false;
    }

    const slotMinutes = timeToMinutes(slotTime);
    const oneHourLater = slotMinutes + 60; // Need at least 1 hour available
    const roomEndMinutes = timeToMinutes(room.endTime || '18:00');

    // Check if we have at least 1 hour before room closes
    if (oneHourLater > roomEndMinutes) {
      return false;
    }

    // Check if any booking starts within the next hour
    for (const booking of bookedSlots) {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      
      // If a booking starts within the next hour, we can't select this slot
      if (bookingStartMinutes > slotMinutes && bookingStartMinutes < oneHourLater) {
        return false;
      }
    }

    return true;
  };

  // 🔧 UPDATED: Generate duration options (1, 2, 3, ..., up to maxDuration) - FULL HOURS ONLY
  const getDurationOptions = (): number[] => {
    const options: number[] = [];
    for (let i = 1; i <= maxDuration; i++) {
      options.push(i);
    }
    return options;
  };

  // 🔧 UPDATED: Format duration for full hours only
  const formatDuration = (hours: number): string => {
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  const totalAmount = room.hourlyRate * durationHours;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="mt-2 text-sm text-foreground/60">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Select Time & Duration</h3>
        <p className="text-sm text-foreground/60">
          Choose your start time (30-minute intervals) and booking duration
        </p>
      </div>

      {/* Time Slots Grid - ONLY STARTING TIME */}
      <div>
        <label className="block text-sm font-medium text-foreground/70 mb-3">
          Start Time <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-2">
          {timeSlots.map((slot) => {
            const isSelected = startTimeSlot === slot;
            const isBooked = isTimeSlotBooked(slot);
            const isSelectable = canSelectTimeSlot(slot);

            return (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  if (isSelectable) {
                    onTimeChange(slot, 1); // Default to 1 hour
                  }
                }}
                disabled={!isSelectable}
                className={`
                  px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isSelected
                      ? 'bg-primary text-white shadow-md scale-105'
                      : isSelectable
                      ? 'bg-foreground/5 hover:bg-foreground/10 text-foreground border border-foreground/20'
                      : 'bg-foreground/5 text-foreground/30 cursor-not-allowed opacity-50'
                  }
                `}
                title={
                  isBooked
                    ? 'Time slot is booked'
                    : !isSelectable
                    ? 'Not enough time available'
                    : 'Select this time'
                }
              >
                {slot}
              </button>
            );
          })}
        </div>
        {startTimeSlot && maxDuration < 3 && (
          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Limited availability: Maximum {formatDuration(maxDuration)} from this time
          </p>
        )}
      </div>

      {/* Duration Dropdown - ONLY APPEARS AFTER SELECTING START TIME */}
      {startTimeSlot && (
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Duration <span className="text-red-500">*</span>
          </label>
          <select
            value={durationHours}
            onChange={(e) => onTimeChange(startTimeSlot, parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground bg-white"
          >
            {getDurationOptions().map((hours) => (
              <option key={hours} value={hours}>
                {formatDuration(hours)}
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/50 mt-1">
            Maximum {formatDuration(maxDuration)} available from selected time
          </p>
        </div>
      )}

      {/* Booking Summary */}
      {startTimeSlot && (
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <h4 className="text-sm font-semibold text-foreground mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/60">
                <ClockIcon className="w-4 h-4" />
                <span>Start Time:</span>
              </div>
              <span className="font-semibold text-foreground">{startTimeSlot}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/60">
                <ClockIcon className="w-4 h-4" />
                <span>Duration:</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatDuration(durationHours)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/60">
                <CurrencyDollarIcon className="w-4 h-4" />
                <span>Rate:</span>
              </div>
              <span className="font-semibold text-foreground">
                ₱{room.hourlyRate.toFixed(2)}/hour
              </span>
            </div>
            <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                ₱{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-foreground/60">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-foreground/5 border border-foreground/20 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-foreground/5 opacity-50 rounded" />
          <span>Booked/Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}