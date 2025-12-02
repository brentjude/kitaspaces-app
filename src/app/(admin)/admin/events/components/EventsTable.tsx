'use client';

import Link from 'next/link';
import type { EventWithRelations } from '@/types';
import EventActionsMenu from './EventActionsMenu';

interface EventsTableProps {
  events: EventWithRelations[];
  getEventStatus: (date: Date) => 'upcoming' | 'completed';
}

export default function EventsTable({ events, getEventStatus }: EventsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-foreground/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Event Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Attendees
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-foreground/10">
            {events.map((event) => (
              <EventTableRow
                key={event.id}
                event={event}
                status={getEventStatus(event.date)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface EventTableRowProps {
  event: EventWithRelations;
  status: 'upcoming' | 'completed';
}

function EventTableRow({ event, status }: EventTableRowProps) {
  const attendeesCount = event.registrations?.length || 0;
  const maxAttendees = event.maxAttendees;

  return (
    <tr className="hover:bg-foreground/5 transition-colors">
      {/* Event Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              event.title.charAt(0).toUpperCase()
            )}
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/events/${event.id}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {event.title}
              </Link>
              {event.isMemberOnly && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Member
                </span>
              )}
            </div>
            <div className="text-xs text-foreground/50 truncate max-w-[200px]">
              {event.description || 'No description'}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="flex items-center text-sm font-medium text-foreground">
            <svg
              className="w-4 h-4 mr-1.5 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            {event.isFree || event.price === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₱${event.price.toFixed(2)}`
            )}
          </div>
          {event.isFreeForMembers && event.price > 0 && (
            <span className="flex items-center text-xs text-blue-600 mt-0.5">
              <svg
                className="w-3 h-3 mr-1 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Free for members
            </span>
          )}
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-foreground">
          <svg
            className="w-4 h-4 mr-1.5 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        {event.startTime && (
          <div className="text-xs text-foreground/50 mt-1 pl-5">
            {event.startTime}
            {event.endTime && ` - ${event.endTime}`}
          </div>
        )}
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-foreground/70">
          <svg
            className="w-4 h-4 mr-1.5 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate max-w-[150px]">
            {event.location || 'TBA'}
          </span>
        </div>
      </td>

      {/* Attendees */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground">
          {attendeesCount}
          {maxAttendees && (
            <span className="text-foreground/50"> / {maxAttendees}</span>
          )}
        </div>
        {maxAttendees && (
          <div className="mt-1">
            <div className="w-full bg-foreground/10 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  attendeesCount >= maxAttendees
                    ? 'bg-red-500'
                    : attendeesCount >= maxAttendees * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(
                    (attendeesCount / maxAttendees) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            status === 'upcoming'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <EventActionsMenu 
          eventId={event.id} 
          eventTitle={event.title} 
        />
      </td>
    </tr>
  );
}