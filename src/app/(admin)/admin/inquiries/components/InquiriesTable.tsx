'use client';

import { format } from 'date-fns';
import {
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InquiriesTableProps {
  inquiries: Inquiry[];
  pagination: Pagination;
  onViewInquiry: (inquiry: Inquiry) => void;
  onPageChange: (page: number) => void;
}

export default function InquiriesTable({
  inquiries,
  pagination,
  onViewInquiry,
  onPageChange,
}: InquiriesTableProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  const getReasonBadge = (reason: string) => {
    const badges = {
      INQUIRY: 'bg-blue-50 text-blue-700',
      FEEDBACK: 'bg-green-50 text-green-700',
      COMPLAINT: 'bg-red-50 text-red-700',
      SUPPORT: 'bg-purple-50 text-purple-700',
      OTHER: 'bg-gray-50 text-gray-700',
    };

    return badges[reason as keyof typeof badges] || badges.OTHER;
  };

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-foreground/10 p-12 text-center">
        <EnvelopeIcon className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No inquiries found
        </h3>
        <p className="text-foreground/60">
          There are no inquiries matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-foreground/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Reason & Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-foreground/10">
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="hover:bg-foreground/5 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-foreground">
                      {inquiry.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-foreground/60 mt-1">
                      <EnvelopeIcon className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">
                        {inquiry.email}
                      </span>
                    </div>
                    {inquiry.contactNumber && (
                      <div className="flex items-center gap-1 text-xs text-foreground/60 mt-0.5">
                        <PhoneIcon className="w-3 h-3" />
                        <span>{inquiry.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReasonBadge(inquiry.reason)}`}
                    >
                      {inquiry.reason}
                    </span>
                    {inquiry.type && (
                      <span className="text-xs text-foreground/60">
                        {inquiry.type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {inquiry.subject && (
                      <p className="text-sm font-medium text-foreground truncate">
                        {inquiry.subject}
                      </p>
                    )}
                    <p className="text-sm text-foreground/60 truncate">
                      {inquiry.message}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(inquiry.status)}`}
                  >
                    {inquiry.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {inquiry.assignedTo ? (
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {inquiry.assignedTo.name}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {inquiry.assignedTo.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground/40">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <p className="text-foreground">
                      {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {format(new Date(inquiry.createdAt), 'hh:mm a')}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewInquiry(inquiry)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-foreground/5 px-6 py-4 flex items-center justify-between border-t border-foreground/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-foreground/20 text-sm font-medium rounded-md text-foreground bg-white hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-foreground/20 text-sm font-medium rounded-md text-foreground bg-white hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-foreground/60">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-foreground/20 bg-white text-sm font-medium text-foreground/60 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (pagination.totalPages <= 7) return true;
                    if (page === 1 || page === pagination.totalPages)
                      return true;
                    if (
                      page >= pagination.page - 1 &&
                      page <= pagination.page + 1
                    )
                      return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="relative inline-flex items-center px-4 py-2 border border-foreground/20 bg-white text-sm font-medium text-foreground/60"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === page
                            ? 'z-10 bg-primary border-primary text-white'
                            : 'bg-white border-foreground/20 text-foreground/60 hover:bg-foreground/5'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-foreground/20 bg-white text-sm font-medium text-foreground/60 hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}