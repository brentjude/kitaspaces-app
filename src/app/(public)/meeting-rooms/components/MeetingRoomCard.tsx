'use client';

import { MeetingRoom } from '@/types/database';
import { 
  UserGroupIcon, 
  ClockIcon,
  WifiIcon,
  ComputerDesktopIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface MeetingRoomCardProps {
  room: MeetingRoom;
  onBookClick: (room: MeetingRoom) => void;
}

export default function MeetingRoomCard({ room, onBookClick }: MeetingRoomCardProps) {
  const parseAmenities = (amenitiesJson: string | null): string[] => {
    if (!amenitiesJson) return [];
    try {
      return JSON.parse(amenitiesJson);
    } catch {
      return [];
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <WifiIcon className="w-3.5 h-3.5" />;
    if (lower.includes('screen') || lower.includes('tv') || lower.includes('projector')) {
      return <ComputerDesktopIcon className="w-3.5 h-3.5" />;
    }
    return null;
  };

  const amenities = parseAmenities(room.amenities);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-foreground/10 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Image */}
      <Link href={`/meeting-rooms/${room.id}`} className="block">
        <div className="h-56 bg-foreground/5 relative overflow-hidden">
          {room.coverPhotoUrl ? (
            <Image
              src={room.coverPhotoUrl}
              alt={room.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-foreground/5 text-foreground/20">
              <ComputerDesktopIcon className="w-16 h-16" />
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-foreground shadow-sm">
              ₱{room.hourlyRate}/hr
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <Link 
          href={`/meeting-rooms/${room.id}`}
          className="group/title"
        >
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover/title:text-primary transition-colors">
            {room.name}
          </h3>
        </Link>
        
        <p className="text-foreground/60 text-sm mb-4 line-clamp-2">
          {room.description || 'Professional meeting space'}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs font-medium text-foreground/60 mb-6">
          <div className="flex items-center bg-foreground/5 px-2 py-1 rounded">
            <UserGroupIcon className="w-3.5 h-3.5 mr-1.5 text-foreground/40" />
            {room.capacity} Pax
          </div>
          {room.startTime && room.endTime && (
            <div className="flex items-center bg-foreground/5 px-2 py-1 rounded">
              <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-foreground/40" />
              {room.startTime} - {room.endTime}
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 mt-auto">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/5 text-foreground/70 text-xs border border-foreground/10"
              >
                {getAmenityIcon(amenity)}
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-foreground/5 text-foreground/60 text-xs border border-foreground/10">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link 
            href={`/meeting-rooms/${room.id}`}
            className="flex-1 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground font-semibold rounded-xl transition-colors flex items-center justify-center"
          >
            View Details
          </Link>
          <button 
            onClick={() => onBookClick(room)}
            className="flex-1 py-3 bg-foreground hover:bg-primary text-white font-bold rounded-xl transition-colors flex items-center justify-center group-hover:bg-primary"
          >
            Book Now 
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}