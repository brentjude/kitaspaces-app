'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PublicHeader from '@/app/components/Header';
import MeetingRoomCard from './components/MeetingRoomCard';
import BookingModal from './components/BookingModal';
import { MeetingRoom } from '@/types/database';
import { PresentationChartBarIcon } from '@heroicons/react/24/outline';
import Footer from '@/app/components/Footer';

export default function MeetingRoomsPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/public/meeting-rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (room: MeetingRoom) => {
    setSelectedRoom(room);
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    // Optionally refresh rooms or show success message
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader currentUser={session?.user} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-foreground/60">Loading meeting rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader currentUser={session?.user} />

      {/* Hero Section */}
      <div className="bg-white border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <PresentationChartBarIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            Book a Meeting Room
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Professional spaces designed for collaboration, presentations, and focused work. 
            Instant booking available.
          </p>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms
              .filter(room => room.isActive)
              .map(room => (
                <MeetingRoomCard
                  key={room.id}
                  room={room}
                  onBookClick={handleBookClick}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-foreground/5 rounded-full mb-6">
              <PresentationChartBarIcon className="w-10 h-10 text-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Meeting Rooms Available
            </h3>
            <p className="text-foreground/60">
              Check back soon for available meeting spaces.
            </p>
          </div>
        )}
      </div>

      <Footer />

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          currentUser={session?.user}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}