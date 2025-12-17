"use client";

import { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ActivityLogsTable from "./ActivityLogsTable";
import ActivityLogsPagination from "./ActivityLogsPagination";

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  isSuccess: boolean;
  user?: { id: string; name: string; email: string };
  admin?: { id: string; name: string; email: string };
  customer?: { id: string; name: string; email: string };
  ipAddress?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type RoleFilter = "all" | "admin" | "user" | "guest";

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("action", roleFilter);
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      const data = await response.json();

      if (data.logs) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: RoleFilter) => {
    setRoleFilter(value);
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      {/* Header */}
      <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
        <h3 className="text-base font-semibold text-foreground">
          System Activity Logs
        </h3>
        <p className="text-sm text-foreground/60 mt-1">
          Track all user and admin activities across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-foreground/10 flex flex-col sm:flex-row gap-4 bg-foreground/5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-foreground/40" />
          </div>
          <input
            type="text"
            placeholder="Search by user, action, or description..."
            className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-lg bg-white placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm rounded-lg bg-white"
            value={roleFilter}
            onChange={(e) =>
              handleRoleFilterChange(e.target.value as RoleFilter)
            }
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin Actions</option>
            <option value="user">User Actions</option>
            <option value="guest">Guest Actions</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="px-6 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-foreground/60">Loading logs...</p>
        </div>
      ) : (
        <ActivityLogsTable logs={logs} />
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <ActivityLogsPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
