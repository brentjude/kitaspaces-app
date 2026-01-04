"use client";

import Modal from "@/app/components/Modal";
import { MembershipPerk } from "@/types/dashboard";

interface RedemptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  perk: MembershipPerk | null;
  isRedeeming: boolean;
}

export default function RedemptionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  perk,
  isRedeeming,
}: RedemptionConfirmModalProps) {
  if (!perk) return null;

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

  const getRemainingInfo = () => {
    const info: string[] = [];

    if (perk.maxPerDay !== null) {
      const remaining = perk.maxPerDay - (perk.usedToday || 0) - 1;
      info.push(`${remaining} remaining today after redemption`);
    }

    if (perk.maxPerWeek !== null) {
      const remaining = perk.maxPerWeek - (perk.usedThisWeek || 0) - 1;
      info.push(`${remaining} remaining this week after redemption`);
    }

    if (perk.maxPerMonth !== null) {
      const remaining = perk.maxPerMonth - (perk.usedThisMonth || 0) - 1;
      info.push(`${remaining} remaining this month after redemption`);
    }

    return info;
  };

  const remainingInfo = getRemainingInfo();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Redemption"
      size="md"
      closeOnOverlayClick={!isRedeeming}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isRedeeming}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRedeeming}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isRedeeming ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Redeeming...
              </>
            ) : (
              "Confirm Redemption"
            )}
          </button>
        </>
      }
    >
      <div className="p-6">
        {/* Perk Info */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="text-4xl">{getPerkIcon(perk.type)}</div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{perk.name}</h4>
            {perk.description && (
              <p className="text-sm text-gray-600 mt-1">{perk.description}</p>
            )}
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            Are you sure you want to redeem this perk?
          </p>
        </div>

        {/* Usage Information */}
        {remainingInfo.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Usage Limits
            </h5>
            <ul className="space-y-1">
              {remainingInfo.map((info, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 flex items-start"
                >
                  <span className="text-primary mr-2">•</span>
                  {info}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning for last redemption */}
        {(perk.maxPerDay !== null && perk.usedToday === perk.maxPerDay - 1) ||
        (perk.maxPerWeek !== null &&
          perk.usedThisWeek === perk.maxPerWeek - 1) ||
        (perk.maxPerMonth !== null &&
          perk.usedThisMonth === perk.maxPerMonth - 1) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 mr-2 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Last Available Redemption
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This will be your last redemption for this period. You won't
                  be able to use this perk again until the limit resets.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Days of Week Info */}
        {perk.daysOfWeek && (
          <div className="mt-4 text-xs text-gray-500">
            <p>
              <span className="font-medium">Available:</span>{" "}
              {(() => {
                try {
                  const days = JSON.parse(perk.daysOfWeek) as string[];
                  if (days.length === 7) return "Every day";
                  const dayNames = [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ];
                  return days
                    .map((d) => dayNames[parseInt(d)])
                    .filter(Boolean)
                    .join(", ");
                } catch {
                  return "Every day";
                }
              })()}
            </p>
          </div>
        )}

        {/* Time Range Info */}
        {perk.validFrom && perk.validUntil && (
          <div className="mt-2 text-xs text-gray-500">
            <p>
              <span className="font-medium">Hours:</span> {perk.validFrom} -{" "}
              {perk.validUntil}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
