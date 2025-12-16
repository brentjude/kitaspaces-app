'use client';

import { useState } from 'react';
import { MeetingRoom } from '@/types/database';
import { 
  PlusIcon, 
  PencilIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WifiIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import MeetingRoomModal from './MeetingRoomModal';
import DeleteRoomModal from './DeleteRoomModal';
import Image from 'next/image';

interface MeetingRoomsListProps {
  rooms: MeetingRoom[];
  onRoomsChange: () => void;
}

export default function MeetingRoomsList({ rooms, onRoomsChange }: MeetingRoomsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<MeetingRoom | null>(null);

  const handleCreate = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = (room: MeetingRoom) => {
    setDeletingRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingRoom(null);
    setDeletingRoom(null);
    onRoomsChange();
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <WifiIcon className="w-3.5 h-3.5" />;
    if (lower.includes('screen') || lower.includes('tv') || lower.includes('projector')) {
      return <ComputerDesktopIcon className="w-3.5 h-3.5" />;
    }
    return <CheckCircleIcon className="w-3.5 h-3.5" />;
  };

  const parseAmenities = (amenitiesJson: string | null): string[] => {
    if (!amenitiesJson) return [];
    try {
      return JSON.parse(amenitiesJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Meeting Rooms</h2>
          <p className="text-foreground/60 text-sm mt-1">
            Manage your space's bookable rooms and resources.
          </p>
        </div>
        <button 
          onClick={handleCreate}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Add Room
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map(room => {
          const amenities = parseAmenities(room.amenities);
          
          return (
            <div 
              key={room.id} 
              className={`group bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                room.isActive 
                  ? 'border-foreground/10 hover:border-primary/30' 
                  : 'border-foreground/10 opacity-75'
              }`}
            >
              {/* Image */}
              <div className="h-48 bg-foreground/5 relative overflow-hidden">
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
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1 ${
                    room.isActive 
                      ? 'bg-white/90 text-green-700' 
                      : 'bg-gray-200/90 text-foreground/60'
                  }`}>
                    {room.isActive ? (
                      <CheckCircleIcon className="w-3 h-3" />
                    ) : (
                      <XCircleIcon className="w-3 h-3" />
                    )}
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Title and Price */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-foreground leading-tight">{room.name}</h3>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xl font-bold text-primary">₱{room.hourlyRate}</div>
                    <div className="text-xs text-foreground/60">per hour</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/70 mb-4 h-10 line-clamp-2">
                  {room.description || 'No description provided'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs font-medium text-foreground/60 mb-4 border-b border-foreground/10 pb-4">
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
                  <div className="flex flex-wrap gap-2 mb-6">
                    {amenities.slice(0, 4).map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/5 text-foreground/70 text-xs border border-foreground/10"
                      >
                        {getAmenityIcon(amenity)} {amenity}
                      </span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-foreground/5 text-foreground/60 text-xs border border-foreground/10">
                        +{amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(room)}
                    className="flex-1 px-4 py-2 border border-foreground/20 text-foreground/70 font-medium rounded-lg text-sm hover:bg-foreground/5 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center"
                  >
                    <PencilIcon className="w-3.5 h-3.5 mr-2" /> Manage
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg text-sm hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className="col-span-full py-16 text-center text-foreground/60 bg-white rounded-xl border border-dashed border-foreground/20 flex flex-col items-center">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4 text-foreground/30">
              <ComputerDesktopIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No meeting rooms yet</h3>
            <p className="max-w-sm mt-1 mb-6 text-sm">
              Add your first meeting room to start accepting bookings.
            </p>
            <button 
              onClick={handleCreate}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Create Room
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <MeetingRoomModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoom(null);
        }}
        onSuccess={handleSuccess}
        initialData={editingRoom}
      />

      {deletingRoom && (
        <DeleteRoomModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingRoom(null);
          }}
          onSuccess={handleSuccess}
          room={deletingRoom}
        />
      )}
    </div>
  );
}