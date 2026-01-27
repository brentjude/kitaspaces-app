"use client";

import { useEffect, useState } from "react";
import AdminStatsCard from "@/app/(admin)/components/AdminStatsCard";
import UpcomingBirthdaysCard from "../components/UpcomingBirthdaysCard";
import ExpiringMembershipsCard from "../components/ExpiringMembershipCard";
import Link from "next/link";

interface DashboardStats {
  totalUsers: { value: number; change: number; trend: "up" | "down" };
  upcomingEvents: { value: number; change: number; trend: "up" | "down" };
  totalRevenue: {
    value: number;
    formatted: string;
    change: number;
    trend: "up" | "down";
  };
  activeMembers: { value: number };
  pendingPayments: { value: number };
  todayBookings: { value: number };
  totalMeetingRooms: { value: number };
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  isMember: boolean;
  role: string;
  createdAt: string;
  timeAgo: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  location: string | null;
  price: number;
  isFree: boolean;
  attendees: number;
  formattedDate: string;
}

interface BirthdayUser {
  id: string;
  name: string;
  company: string | null;
  birthdate: string;
  daysUntil: number;
  formattedDate: string;
}

interface ExpiringMembership {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  endDate: string;
  daysLeft: number;
  formattedEndDate: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentUsers: RecentUser[];
  upcomingEvents: UpcomingEvent[];
  upcomingBirthdays: BirthdayUser[];
  expiringMemberships: ExpiringMembership[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="text-red-500 text-base sm:text-lg font-semibold mb-2">
            Error loading dashboard
          </div>
          <p className="text-sm text-foreground/60 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <AdminStatsCard
            title="Total Users"
            value={data.stats.totalUsers.value.toLocaleString()}
            change={{
              value: data.stats.totalUsers.change,
              trend: data.stats.totalUsers.trend,
            }}
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />

          <AdminStatsCard
            title="Upcoming Events"
            value={data.stats.upcomingEvents.value}
            change={{
              value: data.stats.upcomingEvents.change,
              trend: data.stats.upcomingEvents.trend,
            }}
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />

          <AdminStatsCard
            title="Total Revenue"
            value={data.stats.totalRevenue.formatted}
            change={{
              value: data.stats.totalRevenue.change,
              trend: data.stats.totalRevenue.trend,
            }}
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Priority Content Grid - Birthdays & Memberships First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Upcoming Birthdays - Priority 1 */}
          <UpcomingBirthdaysCard birthdays={data.upcomingBirthdays} />

          {/* Expiring Memberships - Priority 2 */}
          <ExpiringMembershipsCard memberships={data.expiringMemberships} />
        </div>

        {/* Secondary Content Grid - Recent Users & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* Recent Customers */}
          <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                Recent Customers
              </h2>
              <Link
                href="/admin/customers"
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.recentUsers.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-foreground/40">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm">No recent customers</p>
                </div>
              ) : (
                data.recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/customers/${user.id}`}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        {user.isMember && (
                          <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-orange-100 text-orange-700 rounded whitespace-nowrap">
                            MEMBER
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground/60 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-foreground/50 shrink-0">
                      {user.timeAgo}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                Upcoming Events
              </h2>
              <Link
                href="/admin/events"
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.upcomingEvents.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-foreground/40">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm">No upcoming events</p>
                </div>
              ) : (
                data.upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {event.title}
                        </p>
                        {event.isFree && (
                          <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-blue-100 text-blue-700 rounded whitespace-nowrap">
                            FREE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-foreground/60">
                        {event.formattedDate}
                      </p>
                      {event.location && (
                        <p className="text-[10px] sm:text-xs text-foreground/40 truncate mt-0.5">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-foreground/60 shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {event.attendees}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}