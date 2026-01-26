'use client';

import { MeetingRoom } from '@/types/database';
import {
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface RoomInfoProps {
  room: MeetingRoom;
}

export default function RoomInfo({ room }: RoomInfoProps) {
  const location = [room.floor, room.roomNumber].filter(Boolean).join(', ');

  // Parse amenities from JSON string
  const parseAmenities = (amenitiesJson: string | null): string[] => {
    if (!amenitiesJson) return [];
    try {
      return JSON.parse(amenitiesJson);
    } catch {
      return [];
    }
  };

  const amenities = parseAmenities(room.amenities);

  return (
    <div className="bg-white rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
      {/* Cover Photo */}
      <div className="relative h-96 bg-foreground/5">
        {room.coverPhotoUrl ? (
          <img
            src={room.coverPhotoUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPinIcon className="w-20 h-20 text-foreground/20" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
              room.status === 'AVAILABLE'
                ? 'bg-green-500 text-white'
                : room.status === 'OCCUPIED'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            {room.status}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-lg font-bold text-foreground shadow-lg">
            ₱{room.hourlyRate.toLocaleString()}/hr
          </span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {room.name}
        </h1>

        {location && (
          <div className="flex items-center gap-2 text-foreground/60 mb-6">
            <MapPinIcon className="w-5 h-5" />
            <span>{location}</span>
          </div>
        )}

        {room.description && (
          <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-foreground/5 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Capacity</p>
              <p className="text-xl font-bold text-foreground">
                {room.capacity} people
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <CurrencyDollarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Hourly Rate</p>
              <p className="text-xl font-bold text-foreground">
                ₱{room.hourlyRate.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <ClockIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Operating Hours</p>
              <p className="text-xl font-bold text-foreground">
                {room.startTime} - {room.endTime}
              </p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Amenities & Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-foreground/80 p-3 bg-foreground/5 rounded-lg"
                >
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}