"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { format, isPast, differenceInDays } from "date-fns";
import type { User, Membership, MembershipPlan } from "@/generated/prisma";
import MembershipStatsCards from "./MembershipStatsCards";

interface MemberWithDetails extends User {
  memberships: Array<
    Membership & {
      plan: MembershipPlan | null;
    }
  >;
}

interface MembersListProps {
  members: MemberWithDetails[];
  onViewMember: (memberId: string) => void;
  onAddMember: () => void; // ✅ ADD THIS
}

export default function MembersList({ members, onViewMember, onAddMember }: MembersListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberships.some((m) =>
        m.plan?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getActiveMembership = (member: MemberWithDetails) => {
    return member.memberships.find((m) => m.status === "ACTIVE");
  };

  const getMembershipStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <ShieldCheckIcon className="w-3 h-3" />
            Active
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Expired
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getExpiryDisplay = (membership: Membership | undefined) => {
    if (!membership || !membership.endDate) {
      return (
        <span className="text-xs text-foreground/40 italic">
          No active plan
        </span>
      );
    }

    const endDate = new Date(membership.endDate);
    const isExpired = isPast(endDate);
    const daysRemaining = differenceInDays(endDate, new Date());

    if (isExpired) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-red-600 font-medium">
            {format(endDate, "MMM dd, yyyy")}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded">
            EXPIRED
          </span>
        </div>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-orange-600 font-medium">
            {format(endDate, "MMM dd, yyyy")}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded">
            {daysRemaining}d left
          </span>
        </div>
      );
    }

    if (daysRemaining <= 30) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-yellow-700 font-medium">
            {format(endDate, "MMM dd, yyyy")}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700 rounded">
            {daysRemaining}d left
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-green-700 font-medium">
          {format(endDate, "MMM dd, yyyy")}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
          {daysRemaining}d left
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 🆕 Stats Cards - Moved to Top */}
      <MembershipStatsCards members={members} />
      <div className="flex justify-end">
        <button
          onClick={onAddMember}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Add Member
        </button>
      </div>


      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-foreground/40" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email or plan..."
          className="block w-full pl-10 pr-3 py-2.5 border border-foreground/20 rounded-lg bg-white placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Plan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-foreground/5">
              {filteredMembers.map((member) => {
                const activeMembership = getActiveMembership(member);
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-foreground/5 transition-colors cursor-pointer group"
                    onClick={() => onViewMember(member.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {member.name}
                          </div>
                          <div className="text-xs text-foreground/60 flex items-center mt-0.5">
                            <EnvelopeIcon className="w-3 h-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeMembership?.plan ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {activeMembership.plan.name}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/40">
                          No active plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-foreground/40" />
                        {format(new Date(member.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 text-foreground/40" />
                        {getExpiryDisplay(activeMembership)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeMembership
                        ? getMembershipStatusBadge(activeMembership.status)
                        : getMembershipStatusBadge("INACTIVE")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-foreground/40 hover:text-primary transition-colors p-1 rounded hover:bg-foreground/5">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground/40 text-sm"
                  >
                    {searchTerm
                      ? "No members found matching your search."
                      : "No members yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}