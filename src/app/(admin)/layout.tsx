"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/app/(admin)/components/AdminSidebar";
import AdminHeader from "@/app/(admin)/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/admin" || pathname === "/admin/") {
      return "Dashboard";
    }

    if (pathname.startsWith("/admin/events")) {
      if (pathname === "/admin/events") {
        return "Events Management";
      }
      if (pathname.includes("/create")) {
        return "Create Event";
      }
      if (pathname.includes("/edit")) {
        return "Edit Event";
      }
      // For event details pages like /admin/events/[id]
      if (pathname.match(/^\/admin\/events\/[^/]+$/)) {
        return "Event Details";
      }
    }

    if (pathname.startsWith("/admin/memberships")) {
      return "Membership Management";
    }

    if (pathname.startsWith("/admin/payments")) {
      return "Payment Management";
    }

    if (pathname.startsWith("/admin/calendar")) {
      return "Event Calendar";
    }

    if (pathname.startsWith("/admin/meeting-rooms")) {
      return "Meeting Rooms Management";
    }

    if (pathname.startsWith("/admin/users")) {
      return "Users Management";
    }

    if (pathname.startsWith("/admin/settings")) {
      return "Settings";
    }

    return "Admin Panel";
  };

  // Check if current page should show the "Add Event" button

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full">
          {/* Header */}
          <AdminHeader title={getPageTitle()} showAddButton={true} />

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
