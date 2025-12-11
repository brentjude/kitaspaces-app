"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  DashboardData,
  UserEventRegistration,
  PastEventRegistration,
  RedemptionEvent,
  UserPerksData,
} from "@/types/dashboard";
import WelcomeSection from "./components/WelcomeSection";
import MyTickets from "./components/MyTickets";
import RedemptionEvents from "./components/RedemptionEvents";
import RedemptionPerks from "./components/RedemptionPerks";
import PastEvents from "./components/PastEvents";
import {
  ArrowLeftIcon,
  GiftIcon,
  TicketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type TabType = "redemptions" | "perks" | "tickets";

export default function UserDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("redemptions");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [upcomingEvents, setUpcomingEvents] = useState<UserEventRegistration[]>(
    []
  );
  const [pastEvents, setPastEvents] = useState<PastEventRegistration[]>([]);
  const [redemptionEvents, setRedemptionEvents] = useState<RedemptionEvent[]>(
    []
  );
  const [perksData, setPerksData] = useState<UserPerksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      // Redirect admin to admin dashboard
      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
        return;
      }

      loadDashboard();
    }
  }, [status, session, router]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [dashboardRes, eventsRes, redemptionsRes, perksRes] =
        await Promise.all([
          fetch("/api/user/dashboard"),
          fetch("/api/user/events"),
          fetch("/api/user/redemptions"),
          fetch("/api/user/perks"),
        ]);

      // Dashboard data
      const dashboardJson = await dashboardRes.json();
      if (!dashboardRes.ok) throw new Error(dashboardJson.error);
      setDashboardData(dashboardJson.data);

      // Events data
      const eventsJson = await eventsRes.json();
      if (!eventsRes.ok) throw new Error(eventsJson.error);
      setUpcomingEvents(eventsJson.data.upcoming);
      setPastEvents(eventsJson.data.past);

      // Redemption events data
      const redemptionsJson = await redemptionsRes.json();
      if (!redemptionsRes.ok) throw new Error(redemptionsJson.error);
      setRedemptionEvents(redemptionsJson.data);

      // Perks data
      const perksJson = await perksRes.json();
      if (perksRes.ok && perksJson.success) {
        setPerksData(perksJson.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemEvent = async (eventId: string) => {
    try {
      const response = await fetch("/api/user/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to redeem event");
      }

      // Update redemption events
      setRedemptionEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, isRedeemed: true, redeemedAt: new Date() }
            : event
        )
      );

      alert("Event redeemed successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to redeem event");
    }
  };

  const handleRedeemPerk = async (perkId: string) => {
    const response = await fetch(`/api/user/perks/${perkId}/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: "Redeemed from dashboard" }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to redeem perk");
    }

    // Reload perks data
    const perksRes = await fetch("/api/user/perks");
    const perksJson = await perksRes.json();
    if (perksRes.ok && perksJson.success) {
      setPerksData(perksJson.data);
    }

    alert(data.data.message || "Perk redeemed successfully!");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">
            {error || "Failed to load dashboard"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "redemptions" as TabType,
      label: "Daily Perks",
      icon: <GiftIcon className="w-5 h-5" />,
      count: redemptionEvents.length,
    },
    {
      id: "perks" as TabType,
      label: "Member Perks",
      icon: <SparklesIcon className="w-5 h-5" />,
      count: perksData?.perks.length || 0,
    },
    {
      id: "tickets" as TabType,
      label: "My Tickets",
      icon: <TicketIcon className="w-5 h-5" />,
      count: upcomingEvents.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              KITA Spaces
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <WelcomeSection
          data={dashboardData}
          upcomingEventsCount={upcomingEvents.length}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "redemptions" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Daily Redemption Events
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Free perks available on specific days
                    </p>
                  </div>
                </div>
                <RedemptionEvents
                  events={redemptionEvents}
                  onRedeem={handleRedeemEvent}
                />
              </div>
            )}

            {activeTab === "perks" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {perksData?.membership?.planName || "Membership Perks"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Recurring perks included in your membership plan
                    </p>
                  </div>
                </div>
                {perksData &&
                perksData.perks.length > 0 &&
                perksData.membership ? (
                  <RedemptionPerks
                    perks={perksData.perks}
                    membershipName={perksData.membership.planName}
                    onRedeem={handleRedeemPerk}
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <SparklesIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                      {perksData && !perksData.membership
                        ? "No active membership found"
                        : "No membership perks available"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tickets" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Upcoming Events
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Your registered events and tickets
                    </p>
                  </div>
                </div>
                <MyTickets events={upcomingEvents} />
              </div>
            )}
          </div>
        </div>

        {/* Past Events */}
        <PastEvents events={pastEvents} />
      </main>
    </div>
  );
}
