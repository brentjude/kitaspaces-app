'use client';

import { PaymentStats } from '@/types/payment';
import { 
  MagnifyingGlassIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'all' | 'event' | 'membership' | 'room';
  onTypeFilterChange: (value: 'all' | 'event' | 'membership' | 'room') => void;
  statusFilter: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  onStatusFilterChange: (value: 'all' | 'pending' | 'completed' | 'failed' | 'refunded') => void;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
        <p className="text-foreground/60 mt-2">
          Track and manage all payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Total Revenue</h3>
            <BanknotesIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            ₱{stats.totalRevenue.toFixed(2)}
          </p>
          <div className="mt-2 text-xs text-green-700">
            Events: ₱{stats.eventRevenue.toFixed(2)} | 
            Memberships: ₱{stats.membershipRevenue.toFixed(2)} |
            Rooms: ₱{(stats.roomBookingRevenue || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Completed</h3>
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.totalPaid}</p>
          <p className="text-xs text-blue-700 mt-2">Successful transactions</p>
        </div>

        <div className="bg-linear-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-900">Pending</h3>
            <ClockIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.totalPending}</p>
          <p className="text-xs text-yellow-700 mt-2">Awaiting confirmation</p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900">Refunded</h3>
            <ArrowPathIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.totalRefunded}</p>
          <p className="text-xs text-purple-700 mt-2">Refunded payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by name, email, or reference..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as typeof typeFilter)}
            className="px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="event">Events</option>
            <option value="membership">Memberships</option>
            <option value="room">Room Bookings</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>
    </div>
  );
}