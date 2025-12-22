"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  UsersIcon,
  ClockIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PresentationChartBarIcon,
  BuildingOffice2Icon,
  TvIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { MeetingRoom } from "@/types/database";
import MeetingRoomModal from "./MeetingRoomModal";
import BookingDetailsModal from "./BookingDetailsModal";
import type { 
  MeetingRoomBookingWithRelations, 
  CustomerMeetingRoomBookingWithRelations 
} from "@/types/database";

type CombinedBooking = 
  | (MeetingRoomBookingWithRelations & { type: 'user' })
  | (CustomerMeetingRoomBookingWithRelations & { type: 'customer' });

interface MeetingRoomsListProps {
  rooms: MeetingRoom[];
  onRoomsChange: () => void;
  activeTab: 'rooms' | 'bookings';
  onTabChange: (tab: 'rooms' | 'bookings') => void;
}

export default function MeetingRoomsList({ 
  rooms, 
  onRoomsChange,
  activeTab,
  onTabChange
}: MeetingRoomsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<CombinedBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null);

  useEffect(() => {
    if (activeTab === 'bookings' && bookings.length === 0) {
      fetchBookings();
    }
  }, [activeTab]);

  const handleCreate = () => {
    setEditingRoom(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleTabChange = (tab: 'rooms' | 'bookings') => {
    onTabChange(tab);
    setSearchTerm("");
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await fetch("/api/admin/bookings");
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleViewBooking = (booking: CombinedBooking) => {
    setSelectedBooking(booking);
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <WifiIcon className="w-3.5 h-3.5" />;
    if (lower.includes("screen") || lower.includes("tv") || lower.includes("projector")) 
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

  const filteredBookings = bookings.filter((b) => {
    const searchLower = searchTerm.toLowerCase();
    const roomName = b.room?.name || "";
    const contactName = b.type === 'user' 
      ? b.contactName 
      : (b as CustomerMeetingRoomBookingWithRelations).contactName;
    const contactEmail = b.type === 'user'
      ? b.contactEmail
      : (b as CustomerMeetingRoomBookingWithRelations).contactEmail;

    return (
      roomName.toLowerCase().includes(searchLower) ||
      contactName?.toLowerCase().includes(searchLower) ||
      contactEmail?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
      CONFIRMED: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
      COMPLETED: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
      NO_SHOW: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        {activeTab === "rooms" && (
          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add Room
            </button>
          </div>
        )}

        {/* Rooms Grid View */}
        {activeTab === "rooms" && (
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
                <h3 className="text-lg font-medium text-foreground">No rooms configured</h3>
                <p className="text-sm mt-1 mb-6">Start by adding your first bookable room.</p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Table View */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-foreground/40" />
              </div>
              <input
                type="text"
                placeholder="Search by guest, email or room name..."
                className="block w-full pl-10 pr-3 py-2.5 border border-foreground/20 rounded-lg bg-white placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoadingBookings ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-foreground/10">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Booking Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-foreground/5">
                      {filteredBookings.map((booking) => {
                        const isUserBooking = booking.type === 'user';
                        const contactName = isUserBooking 
                          ? booking.contactName 
                          : (booking as CustomerMeetingRoomBookingWithRelations).contactName;
                        const contactEmail = isUserBooking 
                          ? booking.contactEmail 
                          : (booking as CustomerMeetingRoomBookingWithRelations).contactEmail;

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-foreground/5 transition-colors cursor-pointer"
                            onClick={() => handleViewBooking(booking)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                  {contactName?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-foreground">
                                    {contactName}
                                  </div>
                                  <div className="text-xs text-foreground/60">{contactEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm font-medium text-foreground">
                                <PresentationChartBarIcon className="w-4 h-4 mr-1.5 text-foreground/40" />
                                {booking.room?.name || "Unknown Room"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-foreground">
                                <CalendarIcon className="inline w-4 h-4 mr-1.5 text-foreground/40" />
                                {new Date(booking.bookingDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-foreground/60 mt-1">
                                <ClockIcon className="inline w-4 h-4 mr-1.5 text-foreground/40" />
                                {booking.startTime} - {booking.endTime} ({booking.duration} hrs)
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-foreground">
                                ₱{booking.totalAmount.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewBooking(booking);
                                }}
                                className="text-primary hover:text-primary/80 text-sm font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-foreground/40 text-sm italic"
                          >
                            {searchTerm
                              ? "No bookings found matching your search."
                              : "No bookings yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MeetingRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRoomsChange}
        initialData={editingRoom}
      />

      <BookingDetailsModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
      />
    </>
  );
}