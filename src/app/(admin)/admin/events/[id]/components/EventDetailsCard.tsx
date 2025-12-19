"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  PencilSquareIcon,
  UsersIcon,
  ShieldCheckIcon,
  GiftIcon,
  TicketIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import EditEventModal from "./EditEventModal";
import type {
  Event,
  EventFreebie,
  EventRegistration,
} from "@/generated/prisma";

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
    return eventDate > now ? "upcoming" : "completed";
  };

  const status = getEventStatus();

  const getAttendeesDisplay = () => {
    const registrationCount = event.registrations.length;

    if (!event.maxAttendees || event.maxAttendees === 0) {
      return `${registrationCount} registered (No limit)`;
    }

    return `${registrationCount} / ${event.maxAttendees} attendees`;
  };

  // Calculate member discount details
  const hasMemberDiscount =
    !event.isFree &&
    event.price > 0 &&
    event.memberDiscount &&
    event.memberDiscount > 0;

  const getMemberPrice = () => {
    if (!hasMemberDiscount) return null;

    const price = event.price;
    const discount = event.memberDiscount || 0;

    if (event.memberDiscountType === "PERCENTAGE") {
      return price - (price * discount) / 100;
    }
    return price - discount;
  };

  const memberPrice = getMemberPrice();

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
                    status === "upcoming"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
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
                    {event.freebies.length}{" "}
                    {event.freebies.length === 1 ? "Perk" : "Perks"}
                  </span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="text-right ml-4">
              {event.isFree || event.price === 0 ? (
                <div className="text-2xl font-bold text-green-600">Free</div>
              ) : (
                <div className="space-y-1">
                  {/* Regular Price */}
                  <div className="flex items-center justify-end gap-2">
                    <TicketIcon className="w-4 h-4 text-foreground/40" />
                    <div className="text-2xl font-bold text-primary">
                      ₱{event.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Member Discount */}
                  {hasMemberDiscount && memberPrice !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">
                            Member Price:
                          </span>
                        </div>
                        <div className="text-sm font-bold text-blue-700">
                          ₱{memberPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Save{" "}
                          {event.memberDiscountType === "PERCENTAGE"
                            ? `${event.memberDiscount}%`
                            : `₱${event.memberDiscount?.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-foreground/70">
              <CalendarIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
              <span className="text-sm">
                {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-start gap-3 text-foreground/70">
                <ClockIcon className="w-5 h-5 mt-0.5 shrink-0 text-foreground/40" />
                <span className="text-sm">
                  {event.startTime &&
                    format(new Date(`2000-01-01T${event.startTime}`), "h:mm a")}
                  {event.startTime && event.endTime && " - "}
                  {event.endTime &&
                    format(new Date(`2000-01-01T${event.endTime}`), "h:mm a")}
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
              <span className="text-sm">{getAttendeesDisplay()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-foreground/70 mb-6">
            <h3 className="text-foreground font-semibold mb-2 text-sm">
              About this event
            </h3>
            <p className="whitespace-pre-wrap">
              {event.description || "No description provided."}
            </p>
          </div>

          {/* Freebies/Perks */}
          {event.freebies && event.freebies.length > 0 && (
            <div className="border-t border-foreground/10 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GiftIcon className="w-4 h-4 text-orange-600" />
                  Included Perks & Freebies
                </h3>

                {/* Freebie Availability Badge */}
                {event.hasCustomerFreebies ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <UserGroupIcon className="w-3.5 h-3.5" />
                    Available to All
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Members Only
                  </span>
                )}
              </div>

              {/* Freebie Info Banner */}
              {!event.hasCustomerFreebies && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900 mb-0.5">
                        Member-Exclusive Perks
                      </p>
                      <p className="text-xs text-blue-700">
                        These freebies are reserved for registered KITA Spaces
                        members only. Walk-in customers will not receive these
                        perks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {event.hasCustomerFreebies && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-green-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-900 mb-0.5">
                        Available to All Attendees
                      </p>
                      <p className="text-xs text-green-700">
                        Both registered members and walk-in customers can select
                        from these perks during registration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Freebie Cards */}
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
                      <span className="bg-orange-200 text-orange-900 text-xs font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0">
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

              <div className="mt-3 text-xs text-foreground/50 italic flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Each attendee can select from available perks during
                  registration
                </span>
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