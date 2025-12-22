"use client";

import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { CustomerDetailInfo } from "@/types/customer-detail";
import { format } from "date-fns";

interface CustomerInfoCardProps {
  customer: CustomerDetailInfo;
}

export default function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "user":
        return customer.isMember
          ? "bg-blue-50 text-blue-700 border-blue-100"
          : "bg-gray-50 text-gray-600 border-gray-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getMembershipStatusColor = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600";
      case "EXPIRED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  // ✅ Helper function to check if ID is in user format (YYYYNNN)
  const isUserIdFormat = (id: string) => {
    return /^\d{7}$/.test(id); // 7 digits: YYYY (4) + NNN (3)
  };

  // ✅ Get the actual user ID (YYYYNNN format)
  // For registered users with user ID format, use customer.id
  // Otherwise, use customer.userId if available
  const displayUserId = customer.isRegistered && isUserIdFormat(customer.id)
    ? customer.id  // For registered users, customer.id IS the user ID (2025001)
    : (customer.userId || null); // For guest customers linked to users (or null if not linked)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-primary overflow-hidden mb-4 ring-1 ring-foreground/10">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            customer.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-foreground">{customer.name}</h3>

        {/* ✅ Member ID Badge - Show for registered users with membership */}
        {customer.isRegistered && displayUserId && customer.isMember && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-orange-50 rounded-lg border border-primary/20">
            <IdentificationIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-bold text-primary">
              {displayUserId}
            </span>
          </div>
        )}

        {/* Role & Verified Badges */}
        <div className="flex items-center justify-center mt-2 gap-2">
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full uppercase tracking-wide border ${getRoleBadgeStyle(
              customer.role
            )}`}
          >
            {customer.role === "USER"
              ? customer.isMember
                ? "Member"
                : "User"
              : customer.role}
          </span>
          {customer.isRegistered && (
            <span className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              <ShieldCheckIcon className="w-3 h-3 mr-1" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-8 space-y-4 pt-6 border-t border-foreground/10">
        {/* ✅ User ID Row - Show for all registered users */}
        {customer.isRegistered && displayUserId && (
          <div className="flex items-center text-sm bg-foreground/5 rounded-lg p-3 -mx-3">
            <IdentificationIcon className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/60 mb-0.5">Member ID</p>
              <p className="font-mono font-bold text-foreground truncate">
                {displayUserId}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center text-sm text-foreground/70">
          <EnvelopeIcon className="w-4 h-4 mr-3 text-foreground/40 flex-shrink-0" />
          <span className="truncate">{customer.email || "No email provided"}</span>
        </div>
        <div className="flex items-center text-sm text-foreground/70">
          <PhoneIcon className="w-4 h-4 mr-3 text-foreground/40 flex-shrink-0" />
          {customer.contactNumber || "No phone number"}
        </div>
        <div className="flex items-center text-sm text-foreground/70">
          <BuildingOfficeIcon className="w-4 h-4 mr-3 text-foreground/40 flex-shrink-0" />
          {customer.company || "No company info"}
        </div>
        <div className="flex items-center text-sm text-foreground/70">
          <CalendarIcon className="w-4 h-4 mr-3 text-foreground/40 flex-shrink-0" />
          Joined {format(new Date(customer.joinedDate), "MMM dd, yyyy")}
        </div>
      </div>

      {/* Membership Info */}
      {customer.membershipType && (
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-3">
            Membership
          </h4>
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex justify-between items-center">
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-bold text-foreground text-sm truncate">
                {customer.membershipType}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">
                Status:{" "}
                <span
                  className={`capitalize font-medium ${getMembershipStatusColor(
                    customer.membershipStatus
                  )}`}
                >
                  {customer.membershipStatus}
                </span>
              </p>
              {customer.membershipEndDate && (
                <p className="text-xs text-foreground/60 mt-1">
                  Expires:{" "}
                  {format(new Date(customer.membershipEndDate), "MMM dd, yyyy")}
                </p>
              )}
            </div>
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <CreditCardIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-foreground/10">
        <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-3">
          Statistics
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-foreground/5 rounded-lg p-3">
            <p className="text-xs text-foreground/60">Events</p>
            <p className="text-2xl font-bold text-foreground">
              {customer.stats.totalEvents}
            </p>
          </div>
          <div className="bg-foreground/5 rounded-lg p-3">
            <p className="text-xs text-foreground/60">Payments</p>
            <p className="text-2xl font-bold text-foreground">
              {customer.stats.totalPayments}
            </p>
          </div>
          <div className="bg-foreground/5 rounded-lg p-3 col-span-2">
            <p className="text-xs text-foreground/60">Total Spent</p>
            <p className="text-2xl font-bold text-primary">
              ₱{customer.stats.totalSpent.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}