'use client';

import { CalendarIcon } from '@heroicons/react/24/outline';
import { PastEventRegistration } from '@/types/dashboard';

interface PastEventsProps {
  events: PastEventRegistration[];
}

export default function PastEvents({ events }: PastEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 opacity-60">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Past Events</h2>
      <div className="space-y-4">
        {events.map((registration) => (
          <div
            key={registration.registrationId}
            className="flex items-center bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-lg mr-4 flex-shrink-0">
              {new Date(registration.event.date).getDate()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {registration.event.title}
              </h4>
              <p className="text-sm text-gray-500">
                {new Date(registration.event.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}