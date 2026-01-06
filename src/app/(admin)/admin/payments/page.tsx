'use client';

import { useState, useEffect } from 'react';
import { PaymentRecord, PaymentFilters as Filters } from '@/types/payment';
import { PaymentStatus } from '@/generated/prisma';
import PaymentFilters from './components/PaymentFilters';
import PaymentsTable from './components/PaymentsTable';
import PaymentDetailsModal from './components/PaymentDetailsModal';
import Pagination from './components/Pagination';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalRefunded: 0,
    eventRevenue: 0,
    membershipRevenue: 0,
    roomBookingRevenue: 0, // ✅ Added missing property
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    typeFilter: 'all',
    statusFilter: 'all',
    page: 1,
    limit: 10,
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        typeFilter: filters.typeFilter,
        statusFilter: filters.statusFilter,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch payments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const handleStatusUpdate = async (
    paymentId: string,
    status: PaymentStatus,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/payment/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPayments();
        alert('Payment status updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6 p-8">
      <PaymentFilters
        searchTerm={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        typeFilter={filters.typeFilter}
        onTypeFilterChange={(value) =>
          setFilters((prev) => ({ ...prev, typeFilter: value, page: 1 }))
        }
        statusFilter={filters.statusFilter}
        onStatusFilterChange={(value) =>
          setFilters((prev) => ({ ...prev, statusFilter: value, page: 1 }))
        }
        stats={stats}
      />

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading payments...</p>
        </div>
      ) : (
        <>
          <PaymentsTable payments={payments} onViewDetails={handleViewDetails} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}