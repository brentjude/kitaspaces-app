"use client";

import { MembershipPerk } from "@/types/dashboard";
import {
  GiftIcon,
  ClockIcon,
  CalendarIcon,
  XCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import MeetingRoomPerkModal from "./MeetingRoomPerkModal";

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
  const [selectedMeetingRoomPerk, setSelectedMeetingRoomPerk] =
    useState<MembershipPerk | null>(null);

  if (!perks || perks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <GiftIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No perks available</p>
      </div>
    );
  }

  const handleRedeem = async (perk: MembershipPerk) => {
    if (perk.type === "MEETING_ROOM_HOURS") {
      setSelectedMeetingRoomPerk(perk);
      return;
    }

    setRedeeming(perk.id);
    try {
      await onRedeem(perk.id);
    } finally {
      setRedeeming(null);
    }
  };

  const getPerkIcon = (type: string) => {
    const icons: Record<string, string> = {
      CUSTOM: "💎",
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
    if (!daysJson) return "Available Daily";

    try {
      const days = JSON.parse(daysJson) as string[];

      if (days.length === 7) {
        return "Available Daily";
      }

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const sortedDays = days.map((d) => parseInt(d)).sort((a, b) => a - b);
      return sortedDays.map((d) => dayNames[d]).join(", ");
    } catch {
      return "Available Daily";
    }
  };

  const getNextAvailableDay = (daysJson: string | null): Date | null => {
    if (!daysJson) return null;

    try {
      const allowedDays = JSON.parse(daysJson) as string[];
      if (allowedDays.length === 7) return null;

      const now = new Date();
      const currentDay = now.getDay();

      const allowedDayNumbers = allowedDays
        .map((d) => parseInt(d))
        .sort((a, b) => a - b);

      let daysToAdd = 1;
      for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + daysToAdd) % 7;
        if (allowedDayNumbers.includes(checkDay)) {
          const nextDate = new Date(now);
          nextDate.setDate(now.getDate() + daysToAdd);
          return nextDate;
        }
        daysToAdd++;
      }

      return null;
    } catch {
      return null;
    }
  };

  const formatAvailabilityMessage = (perk: MembershipPerk): string => {
    if (!perk.nextAvailableDate) {
      return perk.unavailableReason || "Not available";
    }

    // ✅ Handle both Date objects and ISO strings
    const nextDate =
      typeof perk.nextAvailableDate === "string"
        ? new Date(perk.nextAvailableDate)
        : perk.nextAvailableDate;

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `Available ${months[nextDate.getMonth()]} ${nextDate.getDate()}`;
  };

  const handleMeetingRoomSuccess = async () => {
    window.location.reload();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map((perk) => {
          const isAvailable = perk.isAvailable;
          const isMeetingRoom = perk.type === "MEETING_ROOM_HOURS";
          const hasUnlimitedDaily = perk.maxPerDay === null;
          const hasUnlimitedWeekly = perk.maxPerWeek === null;
          const hasUnlimitedMonthly = perk.maxPerMonth === null;

          const nextAvailableDay = !isAvailable
            ? getNextAvailableDay(perk.daysOfWeek)
            : null;
          const displayNextDate = perk.nextAvailableDate || nextAvailableDay;

          return (
            <div
              key={perk.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                isAvailable
                  ? "border-gray-200 hover:border-primary hover:shadow-sm"
                  : "border-gray-200 bg-gray-50/30 opacity-60"
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
                {/* Meeting Room Hours */}
                {isMeetingRoom && (
                  <div
                    className={`border rounded-lg p-3 mb-2 ${
                      isAvailable
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isAvailable ? "text-blue-900" : "text-gray-600"
                          }`}
                        >
                          {perk.isRecurring ? "Today's Hours" : "Total Hours"}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            isAvailable ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {perk.quantity - (perk.usedToday || 0)} /{" "}
                          {perk.quantity} {perk.unit}
                        </p>
                      </div>
                      <BuildingOfficeIcon
                        className={`w-6 h-6 ${
                          isAvailable ? "text-blue-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {perk.usedToday > 0 && (
                      <p
                        className={`text-xs mt-1 ${
                          isAvailable ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        Used {perk.isRecurring ? "today" : "so far"}:{" "}
                        {perk.usedToday} {perk.unit}
                      </p>
                    )}
                    {perk.isRecurring && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resets {perk.maxPerDay !== null ? "daily" : "monthly"}
                      </p>
                    )}
                  </div>
                )}

                {/* Days of Week */}
                {perk.daysOfWeek && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="truncate text-xs">
                      {formatDays(perk.daysOfWeek)}
                    </span>
                  </div>
                )}

                {/* Time Range */}
                {perk.validFrom && perk.validUntil && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                    <span className="text-xs">
                      {perk.validFrom} - {perk.validUntil}
                    </span>
                  </div>
                )}

                {/* Usage Info - Only show non-meeting room perks */}
                {!isMeetingRoom && (
                  <>
                    {/* Daily Usage */}
                    {perk.maxPerDay !== null && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span>
                          {perk.usedToday || 0}/{perk.maxPerDay} used today
                        </span>
                      </div>
                    )}

                    {/* Weekly Usage */}
                    {perk.maxPerWeek !== null && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span>
                          {perk.usedThisWeek || 0}/{perk.maxPerWeek} used this
                          week
                        </span>
                      </div>
                    )}

                    {/* ✅ Monthly Usage - Only show if maxPerMonth is NOT null */}
                    {perk.maxPerMonth !== null &&
                      perk.maxPerMonth !== undefined && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {perk.usedThisMonth || 0}/{perk.maxPerMonth} used
                            this month
                          </span>
                        </div>
                      )}

                    {/* Unlimited Indicator */}
                    {hasUnlimitedDaily &&
                      hasUnlimitedWeekly &&
                      hasUnlimitedMonthly && (
                        <div className="flex items-center text-xs text-green-600">
                          <span>✓ Unlimited use</span>
                        </div>
                      )}
                  </>
                )}
              </div>

              {/* Action Button */}
              {isAvailable ? (
                <button
                  onClick={() => handleRedeem(perk)}
                  disabled={redeeming === perk.id}
                  className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isMeetingRoom && (
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  )}
                  {redeeming === perk.id
                    ? "Redeeming..."
                    : isMeetingRoom
                      ? "Book Meeting Room"
                      : "Redeem Now"}
                </button>
              ) : displayNextDate ? (
                <div className="w-full py-2 px-4 bg-purple-50 text-purple-600 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {formatAvailabilityMessage(perk)}
                </div>
              ) : (
                <div className="w-full py-2 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg text-sm text-center flex items-center justify-center">
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  {perk.unavailableReason || "Not available"}
                </div>
              )}

              {/* Last Used */}
              {perk.lastUsedAt && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Last used:{" "}
                  {new Date(
                    typeof perk.lastUsedAt === "string"
                      ? perk.lastUsedAt
                      : perk.lastUsedAt
                  ).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Meeting Room Modal */}
      {selectedMeetingRoomPerk && (
        <MeetingRoomPerkModal
          isOpen={true}
          onClose={() => setSelectedMeetingRoomPerk(null)}
          perk={selectedMeetingRoomPerk}
          onSuccess={handleMeetingRoomSuccess}
        />
      )}
    </>
  );
}
