"use client";

import { useState } from "react";
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { RedemptionEvent } from "@/types/dashboard";

interface RedemptionEventsProps {
  events: RedemptionEvent[];
  onRedeem: (eventId: string) => Promise<void>;
}

export default function RedemptionEvents({
  events,
  onRedeem,
}: RedemptionEventsProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (eventId: string) => {
    setRedeeming(eventId);
    try {
      await onRedeem(eventId);
    } finally {
      setRedeeming(null);
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const isToday = event.canRedeem;
          const isPast = new Date(event.date) < new Date() && !isToday;
          const isFuture = new Date(event.date) > new Date() && !isToday;

          return (
            <div
              key={event.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                event.isRedeemed
                  ? "border-green-200 bg-green-50/30"
                  : isPast
                  ? "border-gray-200 bg-gray-50/30 opacity-60"
                  : isFuture
                  ? "border-blue-200 bg-blue-50/30"
                  : "border-gray-200 hover:border-primary hover:shadow-sm"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                    {event.title}
                  </h3>
                  {event.category && (
                    <span
                      className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${event.category.color}20`,
                        color: event.category.color || "#FF8E49",
                      }}
                    >
                      {event.category.icon} {event.category.name}
                    </span>
                  )}
                </div>

                {event.isRedeemed && (
                  <CheckCircleIcon className="w-6 h-6 text-green-600 shrink-0 ml-2" />
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {isToday && (
                      <span className="ml-2 text-xs font-bold text-green-600">
                        • Today
                      </span>
                    )}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {event.isRedeemed ? (
                <div className="w-full py-2 px-4 bg-green-100 text-green-700 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Already Redeemed
                </div>
              ) : isPast ? (
                <div className="w-full py-2 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Expired
                </div>
              ) : isFuture ? (
                <div className="w-full py-2 px-4 bg-blue-50 text-blue-600 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Available on Event Date
                </div>
              ) : (
                <button
                  onClick={() => handleRedeem(event.id)}
                  disabled={redeeming === event.id}
                  className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeeming === event.id ? "Redeeming..." : "Redeem Now"}
                </button>
              )}

              {/* Status Messages */}
              {event.isRedeemed && event.redeemedAt && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Redeemed on {new Date(event.redeemedAt).toLocaleDateString()}
                </p>
              )}

              {isFuture && (
                <p className="text-xs text-blue-600 mt-2 text-center">
                  Come back on {new Date(event.date).toLocaleDateString()} to
                  redeem
                </p>
              )}

              {isPast && !event.isRedeemed && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This redemption has expired
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
