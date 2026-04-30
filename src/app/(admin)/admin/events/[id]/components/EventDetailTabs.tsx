"use client";

import { useState } from "react";
import { UsersIcon, LinkIcon } from "@heroicons/react/24/outline";
import EventReferralsList from "./EventReferralsList";

interface EventReferral {
  id: string;
  name: string;
  code: string;
  createdAt: Date | string;
}

interface EventDetailTabsProps {
  event: {
    id: string;
    slug: string;
    hasReferral: boolean;
    referrals: EventReferral[];
  };
  referralUsageCodes: string[];
  participantsPanel: React.ReactNode;
}

type Tab = "participants" | "referrals";

export default function EventDetailTabs({
  event,
  referralUsageCodes,
  participantsPanel,
}: EventDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("participants");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-foreground/5 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-1 justify-center ${
            activeTab === "participants"
              ? "bg-background text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          Participants
        </button>
        <button
          onClick={() => setActiveTab("referrals")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-1 justify-center ${
            activeTab === "referrals"
              ? "bg-background text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Referrals
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "participants" ? (
        participantsPanel
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-4 sm:p-6">
          <EventReferralsList
            event={event}
            referralUsageCodes={referralUsageCodes}
          />
        </div>
      )}
    </div>
  );
}
