'use client';

import { use, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import RoomInfo from './components/RoomInfo';
import BookingCard from './components/BookingCard';
import BookingModal from '../components/BookingModal';
import { useMeetingRoom } from '@/hooks/useMeetingRoom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingRoomPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { room, isLoading: roomLoading, error: roomError } = useMeetingRoom(id);

  const handleBookClick = () => {
    if (!room) return;
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader currentUser={session?.user} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground/60">Loading meeting room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader currentUser={session?.user} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Meeting Room Not Found
            </h2>
            <p className="text-foreground/60 mb-6">
              {roomError || 'The meeting room you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/meeting-rooms')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Meeting Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader currentUser={session?.user} />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/meeting-rooms')}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Meeting Rooms</span>
        </button>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Info (2/3 width) */}
          <div className="lg:col-span-2">
            <RoomInfo room={room} />
          </div>

          {/* Right Column - Book Now Card (1/3 width) */}
          <div className="lg:col-span-1">
            <BookingCard room={room} onBookClick={handleBookClick} />
          </div>
        </div>
      </div>

      <Footer />

      {/* Booking Modal */}
      {showBookingModal && room && (
        <BookingModal
          room={room}
          currentUser={session?.user}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}