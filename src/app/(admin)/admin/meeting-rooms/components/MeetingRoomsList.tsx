"use client";

import { useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  UsersIcon,
  ClockIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  PresentationChartBarIcon,
  BuildingOffice2Icon,
  TvIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { MeetingRoom } from "@/types/database";
import MeetingRoomModal from "./MeetingRoomModal";

interface MeetingRoomsListProps {
  rooms: MeetingRoom[];
  onRoomsChange: () => void;
}

export default function MeetingRoomsList({
  rooms,
  onRoomsChange,
}: MeetingRoomsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | undefined>(
    undefined
  );

  const handleCreate = () => {
    setEditingRoom(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <WifiIcon className="w-3.5 h-3.5" />;
    if (
      lower.includes("screen") ||
      lower.includes("tv") ||
      lower.includes("projector")
    )
      return <TvIcon className="w-3.5 h-3.5" />;
    if (lower.includes("air") || lower.includes("ac"))
      return <CpuChipIcon className="w-3.5 h-3.5" />;
    return <CheckCircleIcon className="w-3.5 h-3.5" />;
  };

  const parseAmenities = (amenitiesString: string | null): string[] => {
    if (!amenitiesString) return [];
    try {
      return JSON.parse(amenitiesString);
    } catch {
      return [];
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" /> Add Room
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const amenities = parseAmenities(room.amenities);
            return (
              <div
                key={room.id}
                className={`group bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                  room.isActive
                    ? "border-foreground/10 hover:border-primary/50"
                    : "border-foreground/10 opacity-75"
                }`}
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {room.coverPhotoUrl ? (
                    <img
                      src={room.coverPhotoUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-foreground/20">
                      <BuildingOffice2Icon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md flex items-center gap-1 ${
                        room.isActive
                          ? "bg-white/90 text-green-700"
                          : "bg-gray-200/90 text-foreground/60"
                      }`}
                    >
                      {room.isActive ? (
                        <CheckCircleIcon className="w-3 h-3" />
                      ) : (
                        <XCircleIcon className="w-3 h-3" />
                      )}
                      {room.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      {room.name}
                    </h3>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-xl font-bold text-primary">
                        ₱{room.hourlyRate}
                      </div>
                      <div className="text-xs text-foreground/60">per hour</div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/60 mb-4 h-10 line-clamp-2">
                    {room.description || "No description available"}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-foreground/60 mb-4 border-b border-foreground/10 pb-4">
                    <div className="flex items-center bg-foreground/5 px-2 py-1 rounded">
                      <UsersIcon className="w-3.5 h-3.5 mr-1.5 text-foreground/40" />
                      {room.capacity} Pax
                    </div>
                    <div className="flex items-center bg-foreground/5 px-2 py-1 rounded">
                      <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-foreground/40" />
                      {room.startTime || "09:00"} - {room.endTime || "18:00"}
                    </div>
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/5 text-foreground/60 text-xs border border-foreground/10"
                        >
                          {getAmenityIcon(amenity)} {amenity}
                        </span>
                      ))}
                      {amenities.length > 4 && (
                        <span className="text-xs text-foreground/40 px-2 py-1">
                          +{amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleEdit(room)}
                    className="w-full px-4 py-2 border border-foreground/20 text-foreground font-medium rounded-lg text-sm hover:bg-foreground/5 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center"
                  >
                    <PencilSquareIcon className="w-4 h-4 mr-2" /> Manage Room
                  </button>
                </div>
              </div>
            );
          })}
          {rooms.length === 0 && (
            <div className="col-span-full py-16 text-center text-foreground/40 bg-white rounded-xl border border-dashed border-foreground/20 flex flex-col items-center">
              <PresentationChartBarIcon className="w-8 h-8 mb-4 text-foreground/20" />
              <h3 className="text-lg font-medium text-foreground">
                No rooms configured
              </h3>
              <p className="text-sm mt-1 mb-6">
                Start by adding your first bookable room.
              </p>
            </div>
          )}
        </div>
      </div>

      <MeetingRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRoomsChange}
        initialData={editingRoom}
      />
    </>
  );
}
