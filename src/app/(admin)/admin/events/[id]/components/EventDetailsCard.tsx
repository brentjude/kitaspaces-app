'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  UsersIcon,
  ShieldCheckIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import EditEventModal from './EditEventModal';
import type { Event, EventFreebie, EventRegistration } from '@prisma/client';

interface EventWithRelations extends Event {
  registrations: EventRegistration[];
  freebies: EventFreebie[];
}

interface EventDetailsCardProps {
  event: EventWithRelations;
  hasPaidRegistrations: boolean;
}

export default function EventDetailsCard({
  event,
  hasPaidRegistrations,
}: EventDetailsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getEventStatus = () => {
    const now = new Date();
    const eventDate = new Date(event.date);
    return eventDate > now ? 'upcoming' : 'completed';
  };

  const status = getEventStatus();

  const getAttendeesDisplay = () => {
    const registrationCount = event.registrations.length;
    
    if (!event.maxAttendees || event.maxAttendees === 0) {
      return `${registrationCount} registered (No limit)`;
    }
    
    return `${registrationCount} / ${event.maxAttendees} attendees`;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden h-fit">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64 bg-gray-100">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-tr from-primary/20 to-orange-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30 select-none">
                KITA
              </span>
            </div>
          )}

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur text-foreground/70 hover:text-primary p-2 rounded-lg shadow-sm border border-foreground/10 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                    status === 'upcoming'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status}
                </span>
                {event.isMemberOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <ShieldCheckIcon className="w-3 h-3" />
                    Member Only
                  </span>
                )}
                {event.isRedemptionEvent && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Daily Use Event
                  </span>
                )}
                {event.freebies && event.freebies.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <GiftIcon className="w-3 h-3" />
                    {event.freebies.length} {event.freebies.length === 1 ? 'Perk' : 'Perks'}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-primary">
                {event.isFree || event.price === 0
                  ? 'Free'
                  : `₱${event.price.toFixed(2)}`}
              </div>
              {event.isFreeForMembers && event.price > 0 && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  Free for members
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-foreground/70">
              <CalendarIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
              <span className="text-sm">
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-start gap-3 text-foreground/70">
                <ClockIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
                <span className="text-sm">
                  {event.startTime && format(new Date(`2000-01-01T${event.startTime}`), 'h:mm a')}
                  {event.startTime && event.endTime && ' - '}
                  {event.endTime && format(new Date(`2000-01-01T${event.endTime}`), 'h:mm a')}
                </span>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3 text-foreground/70">
                <MapPinIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {/* Always show attendees info */}
            <div className="flex items-start gap-3 text-foreground/70">
              <UsersIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
              <span className="text-sm">
                {getAttendeesDisplay()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-foreground/70 mb-6">
            <h3 className="text-foreground font-semibold mb-2 text-sm">
              About this event
            </h3>
            <p className="whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Freebies/Perks */}
          {event.freebies && event.freebies.length > 0 && (
            <div className="border-t border-foreground/10 pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <GiftIcon className="w-4 h-4 text-orange-600" />
                Included Perks & Freebies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.freebies.map((freebie) => (
                  <div
                    key={freebie.id}
                    className="bg-orange-50 p-4 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-foreground text-sm flex-1">
                        {freebie.name}
                      </div>
                      <span className="bg-orange-200 text-orange-900 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                        ×{freebie.quantity}
                      </span>
                    </div>
                    {freebie.description && (
                      <div className="text-foreground/60 text-xs mt-1 line-clamp-2">
                        {freebie.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-foreground/50 italic">
                * Each attendee can select from available perks during registration
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        hasPaidRegistrations={hasPaidRegistrations}
      />
    </>
  );
}