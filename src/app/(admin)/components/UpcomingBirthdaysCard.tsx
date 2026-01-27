'use client';

import Link from 'next/link';
import { CakeIcon } from '@heroicons/react/24/outline';

interface BirthdayUser {
  id: string;
  name: string;
  company: string | null;
  birthdate: string;
  daysUntil: number;
  formattedDate: string;
}

interface UpcomingBirthdaysCardProps {
  birthdays: BirthdayUser[];
}

export default function UpcomingBirthdaysCard({ birthdays }: UpcomingBirthdaysCardProps) {
  return (
    <div className="bg-white rounded-lg border border-foreground/10 p-4 sm:p-5 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <CakeIcon className="w-5 h-5 text-primary" />
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            Upcoming Birthdays
          </h2>
        </div>
        <Link
          href="/admin/customers"
          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {birthdays.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-foreground/40">
            <CakeIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">No upcoming birthdays</p>
          </div>
        ) : (
          birthdays.map((user) => (
            <Link
              key={user.id}
              href={`/admin/customers/${user.id}`}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <CakeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                {user.company && (
                  <p className="text-[10px] sm:text-xs text-foreground/60 truncate">
                    {user.company}
                  </p>
                )}
                <p className="text-[10px] sm:text-xs text-foreground/50">
                  {user.formattedDate}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                    user.daysUntil === 0
                      ? 'bg-pink-100 text-pink-700'
                      : user.daysUntil <= 3
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.daysUntil === 0
                    ? 'Today'
                    : user.daysUntil === 1
                    ? 'Tomorrow'
                    : `${user.daysUntil} days`}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}