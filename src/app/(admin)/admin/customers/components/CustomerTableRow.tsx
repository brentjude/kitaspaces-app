'use client';

import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: boolean;
  isMember: boolean;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: 'user' | 'customer';
  linkedUserId?: string | null;
}

interface CustomerTableRowProps {
  customer: Customer;
}

export default function CustomerTableRow({ customer }: CustomerTableRowProps) {
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Determine if this is a guest customer (no user account)
  const isGuest = customer.type === 'customer' && !customer.linkedUserId;

  return (
    <tr className="hover:bg-foreground/5 transition-colors">
      {/* Customer Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${
            isGuest 
              ? 'from-gray-100 to-gray-50 border-gray-200' 
              : 'from-orange-100 to-orange-50 border-orange-200'
          } border flex items-center justify-center text-primary font-bold text-sm`}>
            {isGuest ? (
              <UserIcon className="w-5 h-5 text-gray-500" />
            ) : (
              initials
            )}
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/customers/${customer.id}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {customer.name}
              </Link>
              {isGuest && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <UserIcon className="w-3 h-3 mr-1" />
                  Guest
                </span>
              )}
              {customer.isMember && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  Member
                </span>
              )}
            </div>
            <div className="text-xs text-foreground/50">
              ID: #{customer.id.substring(0, 8)}
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {customer.email && (
            <div className="flex items-center text-sm text-foreground/70">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-foreground/40" />
              <span className="truncate max-w-[200px]">{customer.email}</span>
            </div>
          )}
          {customer.contactNumber && (
            <div className="flex items-center text-sm text-foreground/70">
              <PhoneIcon className="w-4 h-4 mr-2 text-foreground/40" />
              {customer.contactNumber}
            </div>
          )}
          {!customer.email && !customer.contactNumber && (
            <span className="text-xs text-foreground/40">No contact info</span>
          )}
        </div>
      </td>

      {/* Company */}
      <td className="px-6 py-4 whitespace-nowrap">
        {customer.company ? (
          <div className="flex items-center text-sm text-foreground/70">
            <BuildingOfficeIcon className="w-4 h-4 mr-2 text-foreground/40" />
            <span className="truncate max-w-[150px]">{customer.company}</span>
          </div>
        ) : (
          <span className="text-xs text-foreground/40">-</span>
        )}
      </td>

      {/* Is Registered (Has User Account) */}
      <td className="px-6 py-4 whitespace-nowrap">
        {customer.isRegistered || customer.linkedUserId ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Guest
          </span>
        )}
      </td>

      {/* Activity */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-foreground">
            <span className="font-medium">{customer.eventRegistrations}</span>
            <span className="text-foreground/50 text-xs ml-1">events</span>
          </div>
          <div className="text-sm text-foreground">
            <span className="font-medium">{customer.totalPayments}</span>
            <span className="text-foreground/50 text-xs ml-1">payments</span>
          </div>
        </div>
      </td>

      {/* Joined Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
        {new Date(customer.joinedDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-foreground/40 hover:text-foreground p-1.5 hover:bg-foreground/5 rounded-lg transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}