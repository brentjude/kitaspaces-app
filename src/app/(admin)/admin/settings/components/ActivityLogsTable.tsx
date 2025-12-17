"use client";

import { format } from "date-fns";
import {
  UserIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

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

interface ActivityLogsTableProps {
  logs: ActivityLog[];
}

export default function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  const getRoleBadge = (log: ActivityLog) => {
    if (log.admin) {
      return (
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-600">Admin</span>
        </div>
      );
    }
    if (log.user) {
      return (
        <div className="flex items-center gap-1">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-600">User</span>
        </div>
      );
    }
    if (log.customer) {
      return (
        <div className="flex items-center gap-1">
          <UserCircleIcon className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-600">Guest</span>
        </div>
      );
    }
    return null;
  };

  const getUserName = (log: ActivityLog) => {
    if (log.admin) return log.admin.name;
    if (log.user) return log.user.name;
    if (log.customer) return log.customer.name;
    return "System";
  };

  const getUserInitial = (log: ActivityLog) => {
    const name = getUserName(log);
    return name.charAt(0).toUpperCase();
  };

  const getActionColor = (action: string) => {
    if (action.startsWith("ADMIN_")) return "bg-purple-100 text-purple-700";
    if (action.includes("PAYMENT")) return "bg-green-100 text-green-700";
    if (action.includes("EVENT")) return "bg-blue-100 text-blue-700";
    if (action.includes("BOOKING")) return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  if (logs.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-foreground/60 text-sm">
        No activity logs found matching your criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-foreground/10">
        <thead className="bg-foreground/5">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Date & Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-foreground/10">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-foreground/5 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase mr-3">
                    {getUserInitial(log)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {getUserName(log)}
                    </div>
                    {log.ipAddress && (
                      <div className="text-xs text-foreground/40 font-mono">
                        {log.ipAddress}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(log)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${getActionColor(
                    log.action
                  )}`}
                >
                  {log.action.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-foreground max-w-md">
                  {log.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">
                  {format(new Date(log.createdAt), "MMM dd, yyyy")}
                </div>
                <div className="text-xs text-foreground/40">
                  {format(new Date(log.createdAt), "hh:mm a")}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
