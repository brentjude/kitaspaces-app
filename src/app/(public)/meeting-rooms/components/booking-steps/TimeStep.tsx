'use client';

import { useEffect, useState } from 'react';
import { MeetingRoom } from '@/types/database';

interface TimeStepProps {
  room: MeetingRoom;
  selectedSlots: number[];
  selectedDate: string;
  onSlotsChange: (slots: number[]) => void;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

export default function TimeStep({ room, selectedSlots, selectedDate, onSlotsChange }: TimeStepProps) {
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedDate, room.id]);

  const fetchBookedSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await fetch(
        `/api/public/meeting-rooms/${room.id}/availability?date=${selectedDate}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch availability');
      
      const data = await response.json();
      setBookedSlots(data.data.bookedSlots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const parseRoomHours = () => {
    const start = room.startTime ? parseInt(room.startTime.split(':')[0], 10) : 9;
    const end = room.endTime ? parseInt(room.endTime.split(':')[0], 10) : 18;
    return { start, end };
  };

  const isSlotBooked = (hour: number): boolean => {
    return bookedSlots.some(slot => {
      const slotStart = parseInt(slot.startTime.split(':')[0], 10);
      const slotEnd = parseInt(slot.endTime.split(':')[0], 10);
      return hour >= slotStart && hour < slotEnd;
    });
  };

  const toggleTimeSlot = (hour: number) => {
    if (isSlotBooked(hour)) return;

    if (selectedSlots.length === 0) {
      onSlotsChange([hour]);
      return;
    }

    const min = Math.min(...selectedSlots);
    const max = Math.max(...selectedSlots);

    if (hour < min) {
      // Check if any slots between hour and min are booked
      const range: number[] = [];
      for (let i = hour; i <= max; i++) {
        if (isSlotBooked(i)) {
          // If blocked, just select the single hour
          onSlotsChange([hour]);
          return;
        }
        range.push(i);
      }
      onSlotsChange(range);
    } else if (hour > max) {
      // Extend to the right
      const range: number[] = [];
      for (let i = min; i <= hour; i++) {
        if (isSlotBooked(i)) {
          // If blocked, just select the single hour
          onSlotsChange([hour]);
          return;
        }
        range.push(i);
      }
      onSlotsChange(range);
    } else {
      // Clicking inside the range
      const range: number[] = [];
      for (let i = min; i <= hour; i++) {
        range.push(i);
      }
      if (hour === min && selectedSlots.length === 1) {
        onSlotsChange([]);
      } else {
        onSlotsChange(range);
      }
    }
  };

  const { start, end } = parseRoomHours();
  const availableHours = Array.from({ length: end - start }, (_, i) => start + i);

  if (isLoadingSlots) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h4 className="text-lg font-bold text-foreground">Select Time Slots</h4>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-foreground">Select Time Slots</h4>
        {selectedSlots.length > 0 && (
          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
            {selectedSlots.length} Hour{selectedSlots.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
        {availableHours.map((hour) => {
          const isSelected = selectedSlots.includes(hour);
          const isBooked = isSlotBooked(hour);
          const isRangeEdge =
            (hour === Math.min(...selectedSlots) || hour === Math.max(...selectedSlots)) &&
            selectedSlots.length > 1;

          return (
            <button
              key={hour}
              type="button"
              onClick={() => toggleTimeSlot(hour)}
              disabled={isBooked}
              className={`
                relative py-3 rounded-lg text-sm font-bold border transition-all duration-200
                ${
                  isBooked
                    ? 'bg-foreground/5 border-foreground/10 text-foreground/30 cursor-not-allowed'
                    : isSelected
                    ? 'bg-orange-50 border-primary text-primary shadow-sm ring-1 ring-primary'
                    : 'bg-white border-foreground/20 text-foreground/70 hover:border-foreground/30 hover:bg-foreground/5'
                }
              `}
            >
              {String(hour).padStart(2, '0')}:00
              {isRangeEdge && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
              {isBooked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-full bg-red-400 rotate-45 transform origin-center"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedSlots.length > 0 && (
        <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 flex justify-between items-center">
          <div>
            <p className="text-xs text-foreground/60 uppercase font-semibold">Total Price</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              {selectedSlots.length} hours × ₱{room.hourlyRate}
            </p>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₱{(selectedSlots.length * room.hourlyRate).toFixed(2)}
          </div>
        </div>
      )}

      <p className="text-xs text-center text-foreground/40">
        Times are in local facility time. Gray slots are already booked.
      </p>
    </div>
  );
}