"use client";

import {
  ArrowRightIcon,
  UserIcon as UserCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardData } from "@/types/dashboard";
import Link from "next/link";

interface WelcomeSectionProps {
  data: DashboardData;
  upcomingEventsCount: number;
}

export default function WelcomeSection({
  data,
  upcomingEventsCount,
}: WelcomeSectionProps) {
  const { user, membership, recentPayment } = data;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      {/* User Info Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserCircleIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Member ID:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {user.id}
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/events"
          className="hidden sm:flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          Browse Events <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Membership Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Membership Type */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">
            Membership Type
          </p>
          {membership ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {membership.type === "MONTHLY" ? "Monthly" : "Daily Pass"}
              </p>
              {membership.planName && (
                <p className="text-sm text-gray-600 mt-1">
                  {membership.planName}
                </p>
              )}
            </>
          ) : recentPayment ? (
            <>
              <p className="text-2xl font-bold text-gray-900">Daily Pass</p>
              <p className="text-sm text-gray-600 mt-1">
                Last visit:{" "}
                {new Date(recentPayment.paidAt || "").toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-lg text-gray-500">No active membership</p>
          )}
        </div>

        {/* Status */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            Status
          </p>
          {membership ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
              {membership.endDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Until {new Date(membership.endDate).toLocaleDateString()}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                <p className="text-2xl font-bold text-gray-900">Inactive</p>
              </div>
              <Link
                href="/membership"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                Get a membership →
              </Link>
            </>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Upcoming Events
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {upcomingEventsCount}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {upcomingEventsCount === 0
              ? "No events scheduled"
              : "Events scheduled"}
          </p>
        </div>
      </div>

      {/* Mobile Browse Button */}
      <Link
        href="/events"
        className="sm:hidden flex items-center justify-center w-full mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-sm transition-colors"
      >
        Browse Events <ArrowRightIcon className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}
