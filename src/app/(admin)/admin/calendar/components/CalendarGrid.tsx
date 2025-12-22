'use client';

import Link from 'next/link';
import { CalendarEvent } from '@/types/database';
import { 
  ShieldCheckIcon, 
  GiftIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export default function CalendarGrid({ currentDate, events }: CalendarGridProps) {
  const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isSameMonth = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
  };

  const monthStart = getStartOfMonth(currentDate);
  const monthEnd = getEndOfMonth(currentDate);

  // Generate days
  const days: Date[] = [];
  const dayIterator = new Date(monthStart);
  while (dayIterator <= monthEnd) {
    days.push(new Date(dayIterator));
    dayIterator.setDate(dayIterator.getDate() + 1);
  }

  // Padding for start of month
  const startDay = monthStart.getDay();
  const blanks = Array(startDay).fill(null);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex-1 min-h-[600px] flex flex-col">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-foreground/10">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-foreground/60 uppercase tracking-wide bg-foreground/5 first:rounded-tl-xl last:rounded-tr-xl"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {blanks.map((_, i) => (
          <div
            key={`blank-${i}`}
            className="bg-foreground/5 border-b border-r border-foreground/10 min-h-[100px]"
          />
        ))}

        {days.map((day) => {
          const dayEvents = events.filter((e) =>
            isSameDay(new Date(e.date), day)
          );
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toString()}
              className={`border-b border-r border-foreground/10 p-2 min-h-[100px] hover:bg-foreground/5 transition-colors relative group ${
                !isCurrentMonth ? 'bg-foreground/5 text-foreground/40' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-primary text-white'
                      : 'text-foreground/70'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[calc(100%-2rem)] overflow-y-auto">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className={`block px-2 py-1.5 text-xs font-medium rounded border cursor-pointer transition-colors ${
                      event.isFree
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
                    }`}
                    title={`${event.title} - ${event.startTime || 'All day'}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="truncate flex-1">{event.title}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {event.isMemberOnly && (
                          <ShieldCheckIcon className="w-3 h-3" />
                        )}
                        {event.isRedemptionEvent && (
                          <GiftIcon className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                    {event.startTime && (
                      <div className="text-[10px] opacity-75">
                        {event.startTime}
                      </div>
                    )}
                    {event.maxAttendees && (
                      <div className="flex items-center gap-1 text-[10px] opacity-75 mt-0.5">
                        <UsersIcon className="w-2.5 h-2.5" />
                        <span>
                          {event.registrationCount} / {event.maxAttendees}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}