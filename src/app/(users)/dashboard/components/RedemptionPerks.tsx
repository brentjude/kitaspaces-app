"use client";

import { MembershipPerk } from "@/types/dashboard";
import {
  GiftIcon,
  ClockIcon,
  CalendarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface RedemptionPerksProps {
  perks: MembershipPerk[];
  membershipName: string;
  onRedeem: (perkId: string) => Promise<void>;
}

export default function RedemptionPerks({
  perks,
  onRedeem,
}: RedemptionPerksProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  if (!perks || perks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <GiftIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No perks available</p>
      </div>
    );
  }

  const handleRedeem = async (perkId: string) => {
    setRedeeming(perkId);
    try {
      await onRedeem(perkId);
    } finally {
      setRedeeming(null);
    }
  };

  const getPerkIcon = (type: string) => {
    const icons: Record<string, string> = {
      CUSTOM: "🍵",
      COFFEE_VOUCHERS: "☕",
      MEETING_ROOM_HOURS: "🏢",
      PRINTING_CREDITS: "🖨️",
      EVENT_DISCOUNT: "🎟️",
      LOCKER_ACCESS: "🔐",
      GUEST_PASSES: "👥",
      PARKING_SLOTS: "🚗",
    };
    return icons[type] || "🎁";
  };

  const formatDays = (daysJson: string | null) => {
    if (!daysJson) return null;
    try {
      const days = JSON.parse(daysJson) as string[];
      return days.join(", ");
    } catch {
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {perks.map((perk) => {
        const isAvailable = perk.isAvailable;
        const isPast = !isAvailable && !perk.nextAvailableDate;

        return (
          <div
            key={perk.id}
            className={`bg-white rounded-xl border p-5 transition-all ${
              isAvailable
                ? "border-gray-200 hover:border-primary hover:shadow-sm"
                : isPast
                ? "border-gray-200 bg-gray-50/30 opacity-60"
                : "border-purple-200 bg-purple-50/30"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{getPerkIcon(perk.type)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                    {perk.name}
                  </h3>
                  {perk.description && (
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {perk.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Perk Details */}
            <div className="space-y-2 mb-4">
              {perk.daysOfWeek && (
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                  <span className="truncate text-xs">
                    {formatDays(perk.daysOfWeek)}
                  </span>
                </div>
              )}
              {perk.validFrom && perk.validUntil && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                  <span className="text-xs">
                    {perk.validFrom} - {perk.validUntil}
                  </span>
                </div>
              )}
              {perk.maxPerDay && (
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    {perk.usedToday}/{perk.maxPerDay} used today
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {isAvailable ? (
              <button
                onClick={() => handleRedeem(perk.id)}
                disabled={redeeming === perk.id}
                className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {redeeming === perk.id ? "Redeeming..." : "Redeem Now"}
              </button>
            ) : perk.nextAvailableDate ? (
              <div className="w-full py-2 px-4 bg-purple-50 text-purple-600 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Available{" "}
                {new Date(perk.nextAvailableDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            ) : (
              <div className="w-full py-2 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                <XCircleIcon className="w-4 h-4 mr-2" />
                {perk.unavailableReason}
              </div>
            )}

            {/* Last Used */}
            {perk.lastUsedAt && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Last used:{" "}
                {new Date(perk.lastUsedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
