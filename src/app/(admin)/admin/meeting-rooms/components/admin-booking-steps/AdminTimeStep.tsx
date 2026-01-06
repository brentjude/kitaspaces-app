'use client';

import { useState, useEffect } from 'react';
import { MeetingRoom } from '@/types/database';
import { ClockIcon } from '@heroicons/react/24/outline';

interface AdminTimeStepProps {
  room: MeetingRoom;
  selectedDate: string;
  startTimeSlot: string;
  durationHours: number;
  onTimeChange: (startTime: string, duration: number) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function AdminTimeStep({
  room,
  selectedDate,
  startTimeSlot,
  durationHours,
  onTimeChange,
}: AdminTimeStepProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && room.id) {
      fetchAvailability();
    }
  }, [selectedDate, room.id]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/meeting-rooms/${room.id}/availability?date=${selectedDate}`
      );
      const data = await response.json();

      if (data.success && data.data.timeSlots) {
        setTimeSlots(data.data.timeSlots);
      } else {
        console.error('Failed to fetch availability:', data.error);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndTime = (start: string, duration: number): string => {
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  // Duration options (1 hour increments only)
  const durationOptions = [
    { value: 1, label: '1 hour' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' },
    { value: 5, label: '5 hours' },
    { value: 6, label: '6 hours' },
    { value: 7, label: '7 hours' },
    { value: 8, label: '8 hours' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-foreground/60">Loading available time slots...</p>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <ClockIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No time slots available for this date</p>
        <p className="text-sm text-gray-400 mt-1">Please select a different date</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Select Time & Duration</h3>
        <p className="text-sm text-foreground/60">
          Choose your preferred start time and booking duration
        </p>
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Start Time <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => onTimeChange(slot.time, durationHours)}
              disabled={!slot.available}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${startTimeSlot === slot.time
                  ? 'bg-primary text-white shadow-md'
                  : slot.available
                  ? 'bg-white border border-foreground/20 hover:border-primary text-foreground'
                  : 'bg-foreground/5 text-foreground/30 cursor-not-allowed line-through'
                }
              `}
            >
              {slot.time}
            </button>
          ))}
        </div>
        <p className="text-xs text-foreground/60 mt-2">
          ℹ️ Grayed out slots are already booked
        </p>
      </div>

      {/* Duration Selector (Dropdown) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Duration <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <select
            value={durationHours}
            onChange={(e) => onTimeChange(startTimeSlot, parseInt(e.target.value))}
            className="w-full pl-11 pr-4 py-3 border-2 border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-semibold text-base appearance-none bg-white cursor-pointer"
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium">
            💰 Cost: ₱{(room.hourlyRate * durationHours).toLocaleString()} 
            <span className="text-blue-600"> ({room.hourlyRate.toLocaleString()}/hr × {durationHours}h)</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      {startTimeSlot && (
        <div className="p-4 bg-linear-to-br from-primary/5 to-orange-50 border-2 border-primary/20 rounded-xl">
          <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" />
            Booking Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground/60 mb-1">Start Time</p>
              <p className="font-bold text-foreground text-base">{startTimeSlot}</p>
            </div>
            <div>
              <p className="text-foreground/60 mb-1">End Time</p>
              <p className="font-bold text-foreground text-base">
                {calculateEndTime(startTimeSlot, durationHours)}
              </p>
            </div>
            <div>
              <p className="text-foreground/60 mb-1">Duration</p>
              <p className="font-bold text-foreground text-base">
                {durationHours === 1 ? '1 hour' : `${durationHours} hours`}
              </p>
            </div>
            <div>
              <p className="text-foreground/60 mb-1">Total Amount</p>
              <p className="font-bold text-primary text-base">
                ₱{(room.hourlyRate * durationHours).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}