"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  TicketIcon,
  CreditCardIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarProps {
  isMobileMenuOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  isMobileMenuOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      onClose();
    }
  }, [pathname, isMobileMenuOpen, onClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: <TicketIcon className="w-5 h-5" />,
    },
    {
      name: "Meeting Rooms",
      href: "/admin/meeting-rooms",
      icon: <PresentationChartBarIcon className="w-5 h-5" />,
    },
    {
      name: "Calendar",
      href: "/admin/calendar",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: <UserGroupIcon className="w-5 h-5" />,
    },
    {
      name: "Memberships",
      href: "/admin/memberships",
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: <BanknotesIcon className="w-5 h-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
    },
  ];

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    },
    [onClose]
  );

  const handleSidebarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 flex flex-col h-screen w-64 bg-white border-r border-foreground/10 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        onClick={handleSidebarClick}
      >
        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-foreground/10 shrink-0">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/logo/kita-secondary-logo.png"
              alt="KITA Spaces Logo"
              width={140}
              height={90}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-foreground/10 shrink-0">
          <div className="text-xs text-foreground/50 text-center">
            © 2025 Kitaspaces
          </div>
        </div>
      </aside>
    </>
  );
}