"use client";

import {
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { differenceInDays } from "date-fns";
import type { User, Membership, MembershipPlan } from "@/generated/prisma";

interface MemberWithDetails extends User {
  memberships: Array<
    Membership & {
      plan: MembershipPlan | null;
    }
  >;
}

interface MembershipStatsCardsProps {
  members: MemberWithDetails[];
}

// ✅ Use default export
export default function MembershipStatsCards({
  members,
}: MembershipStatsCardsProps) {
  // Calculate stats
  const totalMembers = members.length;

  const activeMembers = members.filter((m) =>
    m.memberships.some((mem) => mem.status === "ACTIVE")
  ).length;

  const expiringMembers = members.filter((m) => {
    const activeMem = m.memberships.find((mem) => mem.status === "ACTIVE");
    if (!activeMem?.endDate) return false;
    const daysRemaining = differenceInDays(
      new Date(activeMem.endDate),
      new Date()
    );
    return daysRemaining > 0 && daysRemaining <= 30;
  }).length;

  const pendingMembers = members.filter((m) =>
    m.memberships.some((mem) => mem.status === "PENDING")
  ).length;

  const stats = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: UserGroupIcon,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
    },
    {
      label: "Active",
      value: activeMembers,
      icon: ShieldCheckIcon,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Expiring Soon",
      value: expiringMembers,
      icon: ClockIcon,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      valueColor: "text-orange-600",
    },
    {
      label: "Pending",
      value: pendingMembers,
      icon: CalendarIcon,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-foreground/10 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground/60 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.valueColor}`}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}