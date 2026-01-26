'use client';

import { MeetingRoom } from '@/types/database';

interface BookingCardProps {
  room: MeetingRoom;
  onBookClick: () => void;
}

export default function BookingCard({ room, onBookClick }: BookingCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-foreground/10 p-6 lg:sticky lg:top-6">
      <div className="space-y-6">
        {/* Price */}
        <div className="text-center pb-6 border-b border-foreground/10">
          <p className="text-sm text-foreground/60 mb-2">Starting at</p>
          <p className="text-4xl font-bold text-primary">
            ₱{room.hourlyRate.toLocaleString()}
          </p>
          <p className="text-sm text-foreground/60 mt-1">per hour</p>
        </div>

        {/* Quick Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-foreground/5">
            <span className="text-sm text-foreground/60">Capacity</span>
            <span className="font-semibold text-foreground">
              {room.capacity} people
            </span>
          </div>
          
          {room.startTime && room.endTime && (
            <div className="flex justify-between items-center py-2 border-b border-foreground/5">
              <span className="text-sm text-foreground/60">Hours</span>
              <span className="font-semibold text-foreground">
                {room.startTime} - {room.endTime}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-foreground/60">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                room.status === 'AVAILABLE'
                  ? 'bg-green-100 text-green-700'
                  : room.status === 'OCCUPIED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {room.status}
            </span>
          </div>
        </div>

        {/* Book Now Button */}
        <button
          onClick={onBookClick}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Book Now
        </button>

        {/* Additional Info */}
        <div className="pt-4 border-t border-foreground/10">
          <p className="text-xs text-foreground/60 text-center">
            You&apos;ll be asked to select date, time, and provide your details
          </p>
        </div>
      </div>
    </div>
  );
}