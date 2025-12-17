"use client";

import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CustomerActivity } from "@/types/customer-detail";
import { format } from "date-fns";

interface ActivityHistoryProps {
  activities: CustomerActivity[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function ActivityHistory({
  activities,
  loading,
  pagination,
  onPageChange,
}: ActivityHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <ArrowPathIcon className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10">
        <div className="px-6 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">
            Loading activities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 flex flex-col h-full">
      <div className="px-6 py-4 border-b border-foreground/10 flex justify-between items-center">
        <h3 className="font-bold text-foreground flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-foreground/40" /> Activity
          History
        </h3>
        <span className="text-xs text-foreground/60">
          {pagination.total} total activities
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-foreground/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-foreground/10">
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-foreground/60 text-sm"
                >
                  No activity history found
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-foreground/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {activity.actionLabel}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/70 max-w-md truncate">
                    {activity.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1.5 text-foreground/40" />
                      {format(new Date(activity.date), "MMM dd, yyyy HH:mm")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(activity.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-foreground/10 flex justify-between items-center">
          <div className="text-sm text-foreground/60">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
