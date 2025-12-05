'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/database';
import CalendarHeader from './components/CalendarHeader';
import CalendarFilters from './components/CalendarFilters';
import CalendarGrid from './components/CalendarGrid';
import CalendarLegend from './components/CalendarLegend';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showMemberOnly, setShowMemberOnly] = useState(false);
  const [showRedemptionOnly, setShowRedemptionOnly] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        ...(showFreeOnly && { showFreeOnly: 'true' }),
        ...(showMemberOnly && { showMemberOnly: 'true' }),
        ...(showRedemptionOnly && { showRedemptionOnly: 'true' }),
      });

      const response = await fetch(`/api/admin/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
      } else {
        console.error('Failed to fetch events:', data.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, showFreeOnly, showMemberOnly, showRedemptionOnly]);

  const addMonths = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + amount);
    return d;
  };

  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleFilterChange = (filters: {
    showFreeOnly: boolean;
    showMemberOnly: boolean;
    showRedemptionOnly: boolean;
  }) => {
    setShowFreeOnly(filters.showFreeOnly);
    setShowMemberOnly(filters.showMemberOnly);
    setShowRedemptionOnly(filters.showRedemptionOnly);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
         

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Calendar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <CalendarHeader
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                />
                <CalendarFilters
                  showFreeOnly={showFreeOnly}
                  showMemberOnly={showMemberOnly}
                  showRedemptionOnly={showRedemptionOnly}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex items-center justify-center min-h-[600px]">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-2 text-sm text-foreground/60">Loading events...</p>
                  </div>
                </div>
              ) : (
                <CalendarGrid currentDate={currentDate} events={events} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CalendarLegend />
              
              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">This Month</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Total Events</span>
                    <span className="text-sm font-semibold text-foreground">{events.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Free Events</span>
                    <span className="text-sm font-semibold text-green-600">
                      {events.filter(e => e.isFree).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Paid Events</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {events.filter(e => !e.isFree).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Total Registrations</span>
                    <span className="text-sm font-semibold text-primary">
                      {events.reduce((sum, e) => sum + e.registrationCount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}