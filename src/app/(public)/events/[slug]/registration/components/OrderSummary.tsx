"use client";

import { Event } from "@/types/database";
import { AttendeeFormData } from "@/types/registration";

interface OrderSummaryProps {
  attendees: AttendeeFormData[];
  event: Event;
  isFreeEvent: boolean;
  total: number;
}

export default function OrderSummary({
  attendees,
  event,
  isFreeEvent,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10">
      <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
      <div className="space-y-3">
        {attendees.map((attendee, idx) => (
          <div key={attendee.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="text-foreground/60">
                {attendee.name || `Guest ${idx + 1}`}
              </span>
              {Object.keys(attendee.selectedFreebies).length > 0 && (
                <div className="text-xs text-foreground/40 pl-2 mt-1">
                  {Object.entries(attendee.selectedFreebies).map(
                    ([, option]) => (
                      <div key={option}>• {option}</div>
                    )
                  )}
                </div>
              )}
            </div>
            <span className="font-medium text-foreground">
              {isFreeEvent ? "Free" : `₱${event.price}`}
            </span>
          </div>
        ))}
        <div className="border-t border-foreground/10 pt-3 flex justify-between items-center mt-2">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-xl text-primary">
            {isFreeEvent ? "Free" : `₱${total.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      {event.isFreeForMembers && !isFreeEvent && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800">
            This event is free for members. Non-members pay ₱{event.price} per
            person.
          </p>
        </div>
      )}
    </div>
  );
}
