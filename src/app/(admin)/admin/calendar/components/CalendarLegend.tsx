"use client";

import {
  ShieldCheckIcon,
  GiftIcon,
  CalendarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function CalendarLegend() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Legend</h3>
      <div className="space-y-3">
        {/* Event Types */}
        <div>
          <p className="text-xs font-medium text-foreground/50 mb-2 uppercase tracking-wide">
            Event Types
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-orange-600" />
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded" />
              <span className="text-xs text-foreground/70">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-blue-600" />
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded" />
              <span className="text-xs text-foreground/70">Room Bookings</span>
            </div>
          </div>
        </div>

        {/* Event Properties */}
        <div>
          <p className="text-xs font-medium text-foreground/50 mb-2 uppercase tracking-wide">
            Event Properties
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
              <span className="text-xs text-foreground/70">Free Event</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-foreground/60" />
              <span className="text-xs text-foreground/70">Member Only</span>
            </div>
            <div className="flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-foreground/60" />
              <span className="text-xs text-foreground/70">
                Daily Use Event
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
