'use client';

import { TicketIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { UserEventRegistration } from '@/types/dashboard';
import Link from 'next/link';

interface MyTicketsProps {
  events: UserEventRegistration[];
}

export default function MyTickets({ events }: MyTicketsProps) {
  if (events.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TicketIcon className="w-6 h-6 mr-2 text-primary" /> My Tickets
        </h2>
        
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
          <p className="text-gray-500 mt-1 mb-6">
            Explore our community events and book your first spot.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            Browse Events →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <TicketIcon className="w-6 h-6 mr-2 text-primary" /> My Tickets
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((registration) => {
          const { event } = registration;
          const statusConfig = {
            COMPLETED: { label: 'Confirmed', class: 'bg-green-100/90 text-green-700' },
            FREE: { label: 'Free Ticket', class: 'bg-blue-100/90 text-blue-700' },
            PENDING: { label: 'Payment Pending', class: 'bg-yellow-100/90 text-yellow-700' },
          };
          
          const status = statusConfig[registration.paymentStatus];

          return (
            <div
              key={registration.registrationId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:border-orange-200 hover:shadow-md transition-all"
            >
              {/* Event Image */}
              <div className="h-32 bg-orange-50 relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-white flex items-center justify-center">
                    <span className="text-3xl font-bold text-orange-200">KITA</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm ${status.class}`}>
                    {status.label}
                  </span>
                </div>

                {/* Category Badge */}
                {event.category && (
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm text-white"
                      style={{ backgroundColor: event.category.color || '#FF8E49' }}
                    >
                      {event.category.icon} {event.category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                  {event.title}
                </h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  
                  {event.startTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {event.location}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Order ID: #{registration.registrationId.substring(0, 8)}
                  </span>
                  {registration.numberOfPax > 1 && (
                    <span className="text-xs text-gray-500 font-medium">
                      {registration.numberOfPax} pax
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}