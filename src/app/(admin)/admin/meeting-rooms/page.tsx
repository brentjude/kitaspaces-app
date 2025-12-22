'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MeetingRoomsList from './components/MeetingRoomsList';
import { MeetingRoom } from '@/types/database';
import { 
  PresentationChartBarIcon, 
  CalendarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MeetingRoomsPage() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');
  const [bookingCount, setBookingCount] = useState(0);

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

  const tabs = [
    {
      id: 'rooms' as const,
      label: 'Rooms',
      icon: <PresentationChartBarIcon className="w-5 h-5" />,
      count: rooms.length,
    },
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: <CalendarIcon className="w-5 h-5" />,
      count: bookingCount,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Meeting Room Management</h2>
              <p className="text-foreground/60 text-sm mt-1">
                Manage bookable spaces and view customer reservations.
              </p>
            </div>
            
            {/* Calendar Button - Only show on bookings tab */}
            {activeTab === 'bookings' && (
              <Link
                href="/admin/calendar"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Calendar View
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-foreground/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>
                    {tab.label} ({tab.count})
                  </span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <MeetingRoomsList 
            rooms={rooms}
            onRoomsChange={fetchRooms}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBookingCountChange={setBookingCount}
          />
        </div>
      </div>
    </div>
  );
}