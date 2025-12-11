"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import PaymentDetailsModal from "./PaymentDetailsModal";
import type {
  EventRegistration,
  Payment,
  EventPax,
  CustomerEventRegistration,
  CustomerPayment,
  CustomerEventPax,
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
      freebies: Array<{
        freebie: {
          id: string;
          name: string;
          description: string | null;
        };
        quantity: number;
      }>;
    }
  >;
}

interface CustomerRegistrationFull extends CustomerEventRegistration {
  payment: CustomerPayment | null;
  pax: Array<
    CustomerEventPax & {
      freebies: Array<{
        freebie: {
          id: string;
          name: string;
          description: string | null;
        };
        quantity: number;
      }>;
    }
  >;
}

interface EventRegistrantsListProps {
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    registrations: RegistrationWithUser[];
    customerRegistrations: CustomerRegistrationFull[];
    freebies: Array<{
      id: string;
      name: string;
      description: string | null;
    }>;
  };
  allUsers: UserSelect[];
}

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
  paymentStatus: "FREE" | "PENDING" | "COMPLETED" | "FAILED" | null;
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
    }>;
  }>;
  createdAt: Date;
  data: RegistrationWithUser | CustomerRegistrationFull;
};

export default function EventRegistrantsList({
  event,
  allUsers,
}: EventRegistrantsListProps) {
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<CombinedRegistration | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Combine user and customer registrations
  const combinedRegistrations: CombinedRegistration[] = [
    // User registrations
    ...event.registrations.map((reg) => ({
      id: reg.id,
      type: "user" as const,
      mainGuest: {
        name: reg.user.name,
        email: reg.user.email,
        isMember: reg.user.isMember,
      },
      numberOfPax: reg.numberOfPax,
      paymentStatus: event.isFree
        ? ("FREE" as const)
        : reg.payment?.status || null,
      payment: reg.payment,
      pax: reg.pax.map((p) => ({
        name: p.name,
        email: p.email,
        freebies: p.freebies,
      })),
      createdAt: reg.createdAt,
      data: reg,
    })),
    // Customer registrations
    ...event.customerRegistrations.map((reg) => ({
      id: reg.id,
      type: "customer" as const,
      mainGuest: {
        name: reg.attendeeName,
        email: reg.attendeeEmail,
        phone: reg.attendeePhone,
      },
      numberOfPax: reg.numberOfPax,
      paymentStatus: event.isFree
        ? ("FREE" as const)
        : reg.payment?.status || null,
      payment: reg.payment,
      pax: reg.pax.map((p) => ({
        name: p.name,
        email: p.email,
        freebies: p.freebies,
      })),
      createdAt: reg.createdAt,
      data: reg,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Filter users not already registered
  const filteredUsers = allUsers
    .filter(
      (user) =>
        (user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) &&
        !event.registrations.some((reg) => reg.userId === user.id)
    )
    .slice(0, 5);

  const handleAddRegistrant = async (user: UserSelect) => {
    setIsAdding(true);
    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            numberOfPax: 1,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add registrant");

      window.location.reload();
    } catch (error) {
      console.error("Error adding registrant:", error);
      alert("Failed to add registrant");
    } finally {
      setIsAdding(false);
      setUserSearchTerm("");
    }
  };

  const getPaymentStatusBadge = (registration: CombinedRegistration) => {
    if (event.isFree || event.price === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Free
        </span>
      );
    }

    if (!registration.payment) {
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

    if (registration.payment.status === "COMPLETED") {
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
        {registration.payment.status}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex flex-col h-full max-h-[800px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-foreground">Registrants</h2>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {event.registrations.length} Users
            </span>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {event.customerRegistrations.length} Guests
            </span>
            <span className="bg-foreground/5 text-foreground/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {combinedRegistrations.length} Total
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-foreground/10 bg-gray-50/50 shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search user to add..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              disabled={isAdding}
            />

            {/* Search Results Dropdown */}
            {userSearchTerm && filteredUsers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-foreground/10 max-h-48 overflow-y-auto z-10">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddRegistrant(user)}
                    disabled={isAdding}
                    className="w-full text-left px-4 py-2 hover:bg-foreground/5 flex items-center justify-between group disabled:opacity-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {user.name}
                      </div>
                      <div className="text-xs text-foreground/60">
                        {user.email}
                      </div>
                    </div>
                    <UserPlusIcon className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {userSearchTerm && filteredUsers.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-foreground/10 p-4 text-center text-xs text-foreground/60 z-10">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Registrants List */}
        <div className="flex-1 overflow-y-auto">
          {combinedRegistrations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-foreground/40">
              <UserPlusIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground/60">
                No registered attendees yet
              </p>
              <p className="text-xs mt-1">
                Use the search bar above to add attendees manually.
              </p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs font-medium text-foreground/60 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Guest</th>
                  <th className="px-4 py-3 text-center">Pax</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {combinedRegistrations.map((registration) => (
                  <tr
                    key={registration.id}
                    className="hover:bg-foreground/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary/20 to-orange-100 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {registration.mainGuest.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-foreground truncate max-w-[150px]">
                              {registration.mainGuest.name}
                            </div>
                            {registration.type === "customer" && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded">
                                GUEST
                              </span>
                            )}
                            {registration.type === "user" &&
                              registration.mainGuest.isMember && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded">
                                  MEMBER
                                </span>
                              )}
                          </div>
                          <div className="text-xs text-foreground/60 truncate max-w-[150px]">
                            {registration.mainGuest.email ||
                              registration.mainGuest.phone ||
                              "No contact"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-foreground/10 text-foreground rounded-full">
                        {registration.numberOfPax}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentStatusBadge(registration)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className="text-foreground/40 hover:text-foreground/60 p-1 rounded hover:bg-foreground/5"
                        title="View Details"
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
    </>
  );
}
