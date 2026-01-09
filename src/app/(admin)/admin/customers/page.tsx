// filepath: c:\Users\Jude\Documents\GitHub\kitaspaces-app\src\app\(admin)\admin\customers\page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CombinedCustomerData } from '@/types/database';
import { fetchCustomers } from '@/lib/api/customers';
import CustomerFilters from './components/CustomerFilters';
import CustomersTable from './components/CustomersTable';
import AddGuestModal from './components/AddGuestModal';

type CustomerStats = {
  totalUsers: number;
  totalCustomers: number;
  totalCombined: number;
};

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState<CombinedCustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'guest'>('all');
  const [stats, setStats] = useState<CustomerStats>({
    totalUsers: 0,
    totalCustomers: 0,
    totalCombined: 0,
  });
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCustomers({
        search: searchTerm,
        filter: filterType,
      });

      if (response.success && response.data) {
        setCustomers(response.data.customers);
        setStats(response.data.stats);
      } else {
        console.error('Failed to fetch customers:', response.error);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      loadCustomers();
    }
  }, [loadCustomers, status, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customers</h1>
              <p className="text-sm text-foreground/60 mt-1">
                Manage registered users and guest customers
              </p>
            </div>
            <button
              onClick={() => setIsAddGuestModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Guest
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Customers</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalCombined}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Registered Users</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Guest Customers</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <CustomerFilters
              searchTerm={searchTerm}
              filterType={filterType}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilterType}
            />
          </div>

          {/* Customers Table */}
          <CustomersTable customers={customers} loading={loading} />
        </div>
      </div>

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={isAddGuestModalOpen}
        onClose={() => setIsAddGuestModalOpen(false)}
        onSuccess={loadCustomers}
      />
    </div>
  );
}