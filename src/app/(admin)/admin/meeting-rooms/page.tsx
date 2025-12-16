'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MeetingRoomsList from './components/MeetingRoomsList';
import { MeetingRoom } from '@/types/database';

export default function MeetingRoomsPage() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protect route
  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/meeting-rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading meeting rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      
      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        <MeetingRoomsList 
          rooms={rooms}
          onRoomsChange={fetchRooms}
        />
      </main>
    </div>
  );
}