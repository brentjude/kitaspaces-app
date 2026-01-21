'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import InquiriesTable from './components/InquiriesTable';
import InquiryFilters from './components/InquiryFilters';
import InquiryDetailModal from './components/InquiryDetailModal';
import InquiryStats from './components/InquiryStats';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  reason: string;
  type: string | null;
  subject: string | null;
  message: string;
  status: string;
  source: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  respondedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiryStats {
  PENDING: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

interface Filters {
  status: string;
  reason: string;
  type: string;
  search: string;
  page: number;
  limit: number;
}

export default function InquiriesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats>({
    PENDING: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  });
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    reason: '',
    type: '',
    search: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Protect route
  if (sessionStatus === 'unauthenticated' || (sessionStatus === 'authenticated' && session?.user?.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.reason) params.append('reason', filters.reason);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/admin/inquiries?${params}`);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data.inquiries);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchInquiries();
    }
  }, [filters, sessionStatus]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      // Handle page separately to ensure it's always a number
      if (key === 'page') {
        newFilters.page = typeof value === 'number' ? value : parseInt(value, 10);
      } else if (key === 'limit') {
        newFilters.limit = typeof value === 'number' ? value : parseInt(value, 10);
        newFilters.page = 1; // Reset to page 1 when changing other filters
      } else {
        // For string keys (status, reason, type, search)
        newFilters[key] = value as string;
        newFilters.page = 1; // Reset to page 1 when changing filters
      }
      
      return newFilters;
    });
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchInquiries();
    setIsModalOpen(false);
    setSelectedInquiry(null);
  };

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Inquiries Management</h2>
              <p className="text-foreground/60 text-sm mt-1">
                Manage customer inquiries and feedback from the website
              </p>
            </div>
          </div>

          {/* Stats */}
          <InquiryStats stats={stats} />

          {/* Filters */}
          <InquiryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Table */}
          <InquiriesTable
            inquiries={inquiries}
            pagination={pagination}
            onViewInquiry={handleViewInquiry}
            onPageChange={(page) => handleFilterChange('page', page)}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInquiry(null);
          }}
          inquiry={selectedInquiry}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}