'use client';

import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';

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

interface ExpiringMembershipsCardProps {
  memberships: ExpiringMembership[];
}

export default function ExpiringMembershipsCard({ memberships }: ExpiringMembershipsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-5 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-primary" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            Expiring Memberships
          </h2>
        </div>
        <Link
          href="/admin/memberships"
          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {memberships.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-foreground/40">
            <ClockIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">No expiring memberships</p>
          </div>
        ) : (
          memberships.map((membership) => (
            <Link
              key={membership.id}
              href={`/admin/customers/${membership.userId}`}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-orange-600">
                  {membership.userName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {membership.userName}
                  </p>
                  <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-purple-100 text-purple-700 rounded whitespace-nowrap">
                    {membership.planName}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/60 truncate">
                  {membership.userEmail}
                </p>
                <p className="text-[10px] sm:text-xs text-foreground/50">
                  Expires: {membership.formattedEndDate}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                    membership.daysLeft === 0
                      ? 'bg-red-100 text-red-700'
                      : membership.daysLeft <= 7
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {membership.daysLeft === 0
                    ? 'Today'
                    : membership.daysLeft === 1
                    ? '1 day'
                    : `${membership.daysLeft} days`}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}