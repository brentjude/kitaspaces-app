"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/app/(admin)/components/AdminSidebar";
import AdminHeader from "@/app/(admin)/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use useCallback to prevent function recreation on every render
  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

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

    if (pathname.startsWith("/admin/customers")) {
      return "Customers Management";
    }

    if (pathname.startsWith("/admin/settings")) {
      return "Settings";
    }

    return "Admin Panel";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={handleMenuClose}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Pass menu toggle function */}
        <AdminHeader
          title={getPageTitle()}
          onMenuToggle={handleMenuToggle}
          showAddButton={true}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}