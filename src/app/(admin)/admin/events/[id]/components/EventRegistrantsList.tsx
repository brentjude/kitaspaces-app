"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  GiftIcon,
  UserGroupIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import PaymentDetailsModal from "./PaymentDetailsModal";
import AddRegistrantModal from "./AddRegistrantModal";
import type {
  EventRegistration,
  Payment,
  EventPax,
  PaxFreebie,
  CustomerEventRegistration,
  CustomerPayment,
  CustomerEventPax,
  CustomerPaxFreebie,
  PaymentStatus,
} from "@/generated/prisma";

interface UserSelect {
  id: string;
  name: string;
  email: string;
  isMember: boolean;
}

interface RegistrationWithUser extends EventRegistration {
  user: UserSelect;
  payment: Payment | null;
  pax: Array<
    EventPax & {
      freebies: Array<
        PaxFreebie & {
          freebie: {
            id: string;
            name: string;
            description: string | null;
          };
        }
      >;
    }
  >;
}

interface CustomerRegistrationFull extends CustomerEventRegistration {
  payment: CustomerPayment | null;
  pax: Array<
    CustomerEventPax & {
      freebies: Array<
        CustomerPaxFreebie & {
          freebie: {
            id: string;
            name: string;
            description: string | null;
          };
        }
      >;
    }
  >;
}

interface EventRegistrantsListProps {
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    isFreeForMembers: boolean;
    registrations: RegistrationWithUser[];
    customerRegistrations: CustomerRegistrationFull[];
    freebies: Array<{
      id: string;
      name: string;
      description: string | null;
      quantity: number;
    }>;
  };
  allUsers: UserSelect[];
  paymentSettings: {
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    qrCodeUrl: string | null;
    qrCodeNumber: string | null;
  } | null;
}

type PaxRow = {
  id: string;
  paxName: string;
  paxEmail: string | null;
  type: "user" | "customer";
  isPrimaryPayer: boolean;
  isMember?: boolean;
  registrationId: string;
  numberOfPax: number;
  paymentStatus:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
    | "FREE"
    | null;
  payment: Payment | CustomerPayment | null;
  freebies: Array<{
    freebie: {
      id: string;
      name: string;
      description: string | null;
    };
    quantity: number;
    option: string | null;
  }>;
  createdAt: Date;
  registration: RegistrationWithUser | CustomerRegistrationFull;
};

type CombinedRegistration = {
  id: string;
  type: "user" | "customer";
  mainGuest: {
    name: string;
    email: string | null;
    phone?: string | null;
    isMember?: boolean;
  };
  numberOfPax: number;
  paymentStatus:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED"
    | "FREE"
    | null;
  payment: Payment | CustomerPayment | null;
  pax: Array<{
    name: string;
    email: string | null;
    freebies: Array<{
      freebie: {
        id: string;
        name: string;
        description: string | null;
      };
      quantity: number;
      option: string | null;
    }>;
  }>;
  createdAt: Date;
  data: RegistrationWithUser | CustomerRegistrationFull;
};

export default function EventRegistrantsList({
  event,
  allUsers,
  paymentSettings,
}: EventRegistrantsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<CombinedRegistration | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Expand all pax into individual rows
  const allPaxRows: PaxRow[] = [
    // User registrations -> expand all pax
    ...event.registrations.flatMap((reg) =>
      reg.pax.map((pax, index) => ({
        id: pax.id,
        paxName: pax.name,
        paxEmail: pax.email,
        type: "user" as const,
        isPrimaryPayer: index === 0,
        isMember: reg.user.isMember,
        registrationId: reg.id,
        numberOfPax: reg.numberOfPax,
        paymentStatus: (event.isFree || event.price === 0
          ? "FREE"
          : reg.payment?.status || null) as
          | "PENDING"
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED"
          | "FREE"
          | null,
        payment: reg.payment,
        freebies: pax.freebies.map((f) => ({
          freebie: f.freebie,
          quantity: f.quantity,
          option: f.option,
        })),
        createdAt: reg.createdAt,
        registration: reg,
      }))
    ),
    // Customer registrations -> expand all pax
    ...event.customerRegistrations.flatMap((reg) =>
      reg.pax.map((pax, index) => ({
        id: pax.id,
        paxName: pax.name,
        paxEmail: pax.email,
        type: "customer" as const,
        isPrimaryPayer: index === 0,
        registrationId: reg.id,
        numberOfPax: reg.numberOfPax,
        paymentStatus: (event.isFree || event.price === 0
          ? "FREE"
          : reg.payment?.status || null) as
          | "PENDING"
          | "COMPLETED"
          | "FAILED"
          | "REFUNDED"
          | "FREE"
          | null,
        payment: reg.payment,
        freebies: pax.freebies.map((f) => ({
          freebie: f.freebie,
          quantity: f.quantity,
          option: f.option,
        })),
        createdAt: reg.createdAt,
        registration: reg,
      }))
    ),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Filter pax rows based on search and status
  const filteredPaxRows = allPaxRows.filter((paxRow) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      paxRow.paxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paxRow.paxEmail &&
        paxRow.paxEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && paxRow.paymentStatus === "COMPLETED") ||
      (statusFilter === "pending" && paxRow.paymentStatus === "PENDING") ||
      (statusFilter === "free" && paxRow.paymentStatus === "FREE") ||
      (statusFilter === "users" && paxRow.type === "user") ||
      (statusFilter === "guests" && paxRow.type === "customer");

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalPaxCount = allPaxRows.length;
  const totalUserPax = allPaxRows.filter((p) => p.type === "user").length;
  const totalGuestPax = allPaxRows.filter((p) => p.type === "customer").length;
  const totalPaid = allPaxRows.filter(
    (p) => p.paymentStatus === "COMPLETED"
  ).length;
  const totalPending = allPaxRows.filter(
    (p) => p.paymentStatus === "PENDING"
  ).length;

  const handleViewPayment = (paxRow: PaxRow) => {
    const reg = paxRow.registration;

    const combinedReg: CombinedRegistration = {
      id: paxRow.registrationId,
      type: paxRow.type,
      mainGuest:
        paxRow.type === "user"
          ? {
              name: (reg as RegistrationWithUser).user.name,
              email: (reg as RegistrationWithUser).user.email,
              isMember: (reg as RegistrationWithUser).user.isMember,
            }
          : {
              name: (reg as CustomerRegistrationFull).attendeeName,
              email: (reg as CustomerRegistrationFull).attendeeEmail,
              phone: (reg as CustomerRegistrationFull).attendeePhone,
            },
      numberOfPax: paxRow.numberOfPax,
      paymentStatus: paxRow.paymentStatus,
      payment: paxRow.payment,
      pax:
        paxRow.type === "user"
          ? (reg as RegistrationWithUser).pax.map((p) => ({
              name: p.name,
              email: p.email,
              freebies: p.freebies.map((f) => ({
                freebie: f.freebie,
                quantity: f.quantity,
                option: f.option,
              })),
            }))
          : (reg as CustomerRegistrationFull).pax.map((p) => ({
              name: p.name,
              email: p.email,
              freebies: p.freebies.map((f) => ({
                freebie: f.freebie,
                quantity: f.quantity,
                option: f.option,
              })),
            })),
      createdAt: paxRow.createdAt,
      data: reg,
    };

    setSelectedRegistration(combinedReg);
  };

  const getPaymentStatusBadge = (paxRow: PaxRow) => {
    if (event.isFree || event.price === 0 || paxRow.paymentStatus === "FREE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Free
        </span>
      );
    }

    if (!paxRow.payment) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Pending
        </span>
      );
    }

    if (paxRow.payment.status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Paid
        </span>
      );
    }

    if (paxRow.payment.status === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Failed
        </span>
      );
    }

    if (paxRow.payment.status === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refunded
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {paxRow.payment.status}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex flex-col h-full max-h-[800px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-foreground/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Attendees</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <UserPlusIcon className="w-4 h-4" />
              Add Attendee
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {totalUserPax} Users
            </span>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {totalGuestPax} Guests
            </span>
            <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {totalPaid} Paid
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {totalPending} Pending
            </span>
            <span className="bg-foreground/5 text-foreground/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {totalPaxCount} Total
            </span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-foreground/10 bg-gray-50/50 shrink-0 space-y-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search attendees by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-foreground/40" />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("users")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "users"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setStatusFilter("guests")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "guests"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                Guests
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "paid"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "pending"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("free")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === "free"
                    ? "bg-primary text-white"
                    : "bg-white text-foreground/60 hover:bg-foreground/5"
                }`}
              >
                Free
              </button>
            </div>
          </div>

          {/* Results count */}
          {searchTerm && (
            <p className="text-xs text-foreground/60">
              Showing {filteredPaxRows.length} of {totalPaxCount} attendees
            </p>
          )}
        </div>

        {/* Pax List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPaxRows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-foreground/40">
              <UserPlusIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground/60">
                {searchTerm || statusFilter !== "all"
                  ? "No attendees found"
                  : "No attendees yet"}
              </p>
              <p className="text-xs mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : 'Click "Add Attendee" to register someone'}
              </p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs font-medium text-foreground/60 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Attendee</th>
                  <th className="px-4 py-3 text-left">Freebies</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {filteredPaxRows.map((paxRow) => (
                  <tr
                    key={paxRow.id}
                    className="hover:bg-foreground/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary/20 to-orange-100 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {paxRow.paxName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-foreground truncate max-w-[180px]">
                              {paxRow.paxName}
                            </div>
                            {paxRow.isPrimaryPayer && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded">
                                PAYER
                              </span>
                            )}
                            {paxRow.type === "customer" && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded">
                                GUEST
                              </span>
                            )}
                            {paxRow.type === "user" && paxRow.isMember && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded">
                                MEMBER
                              </span>
                            )}
                            {paxRow.numberOfPax > 1 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded">
                                <UserGroupIcon className="w-3 h-3" />
                                {paxRow.numberOfPax}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-foreground/60 truncate max-w-[180px]">
                            {paxRow.paxEmail || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {paxRow.freebies.length > 0 ? (
                          paxRow.freebies.map((fb, idx) => (
                            <div
                              key={`${paxRow.id}-${fb.freebie.id}-${idx}`}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200"
                            >
                              <GiftIcon className="w-3 h-3" />
                              <span className="font-medium">
                                {fb.freebie.name}
                              </span>
                              {fb.option && (
                                <span className="text-green-900 font-bold">
                                  ({fb.option})
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-foreground/40">
                            No freebies
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentStatusBadge(paxRow)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewPayment(paxRow)}
                        className="text-foreground/40 hover:text-foreground/60 p-1 rounded hover:bg-foreground/5"
                        title="View Payment Details"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedRegistration && (
        <PaymentDetailsModal
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          registration={selectedRegistration}
          event={event}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Add Registrant Modal */}
      {showAddModal && (
        <AddRegistrantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          event={event}
          allUsers={allUsers}
          paymentSettings={paymentSettings}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
