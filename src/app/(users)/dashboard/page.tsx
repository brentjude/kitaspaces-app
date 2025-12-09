'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { DashboardData, UserEventRegistration, PastEventRegistration, RedemptionEvent } from '@/types/dashboard';
import WelcomeSection from './components/WelcomeSection';
import MyTickets from './components/MyTickets';
import RedemptionEvents from './components/RedemptionEvents';
import PastEvents from './components/PastEvents';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function UserDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UserEventRegistration[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEventRegistration[]>([]);
  const [redemptionEvents, setRedemptionEvents] = useState<RedemptionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      // Redirect admin to admin dashboard
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
        return;
      }

      loadDashboard();
    }
  }, [status, session, router]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data
      const dashboardRes = await fetch('/api/user/dashboard');
      const dashboardJson = await dashboardRes.json();
      
      if (!dashboardRes.ok) throw new Error(dashboardJson.error);
      setDashboardData(dashboardJson.data);

      // Fetch events
      const eventsRes = await fetch('/api/user/events');
      const eventsJson = await eventsRes.json();
      
      if (!eventsRes.ok) throw new Error(eventsJson.error);
      setUpcomingEvents(eventsJson.data.upcoming);
      setPastEvents(eventsJson.data.past);

      // Fetch redemption events
      const redemptionsRes = await fetch('/api/user/redemptions');
      const redemptionsJson = await redemptionsRes.json();
      
      if (!redemptionsRes.ok) throw new Error(redemptionsJson.error);
      setRedemptionEvents(redemptionsJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (eventId: string) => {
    try {
      const response = await fetch('/api/user/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem event');
      }

      // Update redemption events
      setRedemptionEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, isRedeemed: true, redeemedAt: new Date() }
            : event
        )
      );

      alert('Event redeemed successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to redeem event');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              KITA Spaces
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <WelcomeSection 
          data={dashboardData} 
          upcomingEventsCount={upcomingEvents.length} 
        />

        <RedemptionEvents 
          events={redemptionEvents} 
          onRedeem={handleRedeem} 
        />

        <MyTickets events={upcomingEvents} />

        <PastEvents events={pastEvents} />
      </main>
    </div>
  );
}