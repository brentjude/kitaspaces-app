"use client";

import { Event } from "@/types/database";
import { AttendeeFormData } from "@/types/registration";

interface OrderSummaryProps {
  attendees: AttendeeFormData[];
  event: Event;
  isFreeEvent: boolean;
  total: number;
  isMemberDiscountApplied?: boolean;
  originalPrice?: number;
}

export default function OrderSummary({
  attendees,
  event,
  isFreeEvent,
  total,
  isMemberDiscountApplied,
  originalPrice,
}: OrderSummaryProps) {
  const discountAmount = originalPrice && isMemberDiscountApplied ? originalPrice - total : 0;

  return (
    <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10">
      <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Event</span>
          <span className="font-medium text-foreground">{event.title}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Date</span>
          <span className="font-medium text-foreground">
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Number of Attendees</span>
          <span className="font-medium text-foreground">
            {attendees.length}
          </span>
        </div>

        {!isFreeEvent && (
          <>
            <div className="border-t border-foreground/10 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">
                  Price per attendee
                </span>
                <span className="font-medium text-foreground">
                  {isMemberDiscountApplied && originalPrice ? (
                    <span>
                      <span className="line-through text-foreground/40 mr-2">
                        ₱{(originalPrice / attendees.length).toFixed(2)}
                      </span>
                      ₱{(total / attendees.length).toFixed(2)}
                    </span>
                  ) : (
                    `₱${event.price.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            {isMemberDiscountApplied && discountAmount > 0 && (
              <div className="flex justify-between text-sm bg-blue-50 -mx-6 px-6 py-2 border-y border-blue-100">
                <span className="text-blue-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Member Discount Applied
                </span>
                <span className="font-bold text-blue-700">
                  -₱{discountAmount.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-foreground/20 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-foreground">Total</span>
          <div className="text-right">
            {isFreeEvent ? (
              <span className="text-2xl font-bold text-green-600">Free</span>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  ₱{total.toFixed(2)}
                </div>
                {isMemberDiscountApplied && (
                  <div className="text-xs text-green-600 font-medium">
                    You saved ₱{discountAmount.toFixed(2)}!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="mt-4 pt-4 border-t border-foreground/10">
        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">
          Attendees
        </p>
        <ul className="space-y-2">
          {attendees.map((attendee, index) => (
            <li
              key={attendee.id}
              className="flex items-center text-sm text-foreground/70"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mr-2">
                {index + 1}
              </span>
              <span>
                {attendee.name || "Guest"} ({attendee.email || "No email"})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}