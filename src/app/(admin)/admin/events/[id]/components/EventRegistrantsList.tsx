'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import PaymentStatusModal from './PaymentStatusModal';
import type { EventRegistration, User, Payment } from '@/generated/prisma';

interface UserSelect {
  id: string;
  name: string;
  email: string;
  isMember: boolean;
}

interface RegistrationWithUser extends EventRegistration {
  user: UserSelect;
  payment: Payment | null;
}

interface EventRegistrantsListProps {
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    registrations: RegistrationWithUser[];
  };
  allUsers: UserSelect[];
}

export default function EventRegistrantsList({
  event,
  allUsers,
}: EventRegistrantsListProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationWithUser | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      const response = await fetch(`/api/admin/events/${event.id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          numberOfPax: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add registrant');

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error adding registrant:', error);
      alert('Failed to add registrant');
    } finally {
      setIsAdding(false);
      setUserSearchTerm('');
    }
  };

  const getPaymentStatusBadge = (registration: RegistrationWithUser) => {
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
          <svg
            className="w-3 h-3 animate-spin"
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

    if (registration.payment.status === 'COMPLETED') {
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
        <svg
          className="w-3 h-3 animate-spin"
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
          <span className="bg-foreground/5 text-foreground/70 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {event.registrations.length} Total
          </span>
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
          {event.registrations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-foreground/40">
              <UserPlusIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground/60">
                No registered users yet
              </p>
              <p className="text-xs mt-1">
                Use the search bar above to add attendees manually.
              </p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs font-medium text-foreground/60 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {event.registrations.map((registration) => (
                  <tr
                    key={registration.id}
                    className="hover:bg-foreground/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-linear-to-tr from-primary/20 to-orange-100 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                          {registration.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate max-w-[150px]">
                            {registration.user.name}
                          </div>
                          <div className="text-xs text-foreground/60 truncate max-w-[150px]">
                            {registration.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getPaymentStatusBadge(registration)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className="text-foreground/40 hover:text-foreground/60 p-1 rounded hover:bg-foreground/5"
                        title="Manage Payment"
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

      {/* Payment Status Modal */}
      {selectedRegistration && (
        <PaymentStatusModal
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          registration={selectedRegistration}
          event={event}
        />
      )}
    </>
  );
}