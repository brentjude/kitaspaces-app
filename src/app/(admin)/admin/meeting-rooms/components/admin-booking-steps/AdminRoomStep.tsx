'use client';

import { MeetingRoom } from '@/types/database';
import { CheckIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface AdminRoomStepProps {
  rooms: MeetingRoom[];
  selectedRoomId: string;
  onRoomChange: (roomId: string) => void;
}

export default function AdminRoomStep({
  rooms,
  selectedRoomId,
  onRoomChange,
}: AdminRoomStepProps) {
  const activeRooms = rooms.filter(room => room.isActive);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Select Meeting Room</h3>
        <p className="text-sm text-foreground/60">
          Choose the meeting room you want to book
        </p>
      </div>

      {activeRooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">No active meeting rooms available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {activeRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomChange(room.id)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                selectedRoomId === room.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-foreground/10 hover:border-primary/50 bg-white'
              }`}
            >
              {/* Selection Indicator */}
              {selectedRoomId === room.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Room Image */}
              {room.coverPhotoUrl ? (
                <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={room.coverPhotoUrl}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 mb-3 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <MapPinIcon className="w-12 h-12 text-primary/30" />
                </div>
              )}

              {/* Room Info */}
              <h4 className="font-bold text-foreground mb-2">{room.name}</h4>
              
              {room.description && (
                <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
                  {room.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-foreground/70">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{room.capacity} pax</span>
                </div>
                <div className="font-bold text-primary">
                  ₱{room.hourlyRate.toLocaleString()}/hr
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedRoomId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Selected:</strong> {activeRooms.find(r => r.id === selectedRoomId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}