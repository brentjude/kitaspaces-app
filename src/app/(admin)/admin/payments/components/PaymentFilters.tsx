'use client';

import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { PaymentStats } from '@/types/payment';

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'all' | 'event' | 'membership';
  onTypeFilterChange: (value: 'all' | 'event' | 'membership') => void;
  statusFilter: 'all' | 'paid' | 'pending' | 'failed' | 'refunded';
  onStatusFilterChange: (value: 'all' | 'paid' | 'pending' | 'failed' | 'refunded') => void;
  stats: PaymentStats;
}

export default function PaymentFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  stats,
}: PaymentFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manage transaction history for events and memberships
          </p>
        </div>
        <div className="bg-white px-4 py-3 border border-foreground/10 rounded-lg shadow-sm flex flex-col items-end">
          <span className="text-xs text-foreground/60 uppercase font-semibold">
            Total Revenue
          </span>
          <span className="text-2xl font-bold text-primary">
            ₱{stats.totalRevenue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-foreground/10 shadow-sm">
          <p className="text-xs text-foreground/60 font-semibold uppercase">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalPaid}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-foreground/10 shadow-sm">
          <p className="text-xs text-foreground/60 font-semibold uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.totalPending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-foreground/10 shadow-sm">
          <p className="text-xs text-foreground/60 font-semibold uppercase">Event Revenue</p>
          <p className="text-xl font-bold text-foreground mt-1">
            ₱{stats.eventRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-foreground/10 shadow-sm">
          <p className="text-xs text-foreground/60 font-semibold uppercase">
            Membership Revenue
          </p>
          <p className="text-xl font-bold text-foreground mt-1">
            ₱{stats.membershipRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-foreground/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-foreground/40" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, transaction ID..."
            className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-lg leading-5 bg-white placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition duration-150 ease-in-out"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-1">
          <select
            className="block w-full pl-3 pr-8 py-2 text-sm border-foreground/20 focus:outline-none focus:ring-primary/20 focus:border-primary rounded-lg bg-white"
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(e.target.value as 'all' | 'event' | 'membership')
            }
          >
            <option value="all">All Types</option>
            <option value="event">Events</option>
            <option value="membership">Memberships</option>
          </select>

          <select
            className="block w-full pl-3 pr-8 py-2 text-sm border-foreground/20 focus:outline-none focus:ring-primary/20 focus:border-primary rounded-lg bg-white"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(
                e.target.value as 'all' | 'paid' | 'pending' | 'failed' | 'refunded'
              )
            }
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button className="flex items-center px-4 py-2 border border-foreground/20 shadow-sm text-sm font-medium rounded-lg text-foreground bg-white hover:bg-foreground/5 transition-colors whitespace-nowrap">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>
    </div>
  );
}