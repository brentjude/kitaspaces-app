"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, HomeIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface PublicHeaderProps {
  currentUser?: {
    name: string;
    email: string;
    role?: string;
  } | null;
  onLoginClick?: () => void;
}

export default function PublicHeader({
  currentUser,
  onLoginClick,
}: PublicHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      router.push('/auth/signin');
    }
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    if (currentUser?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-100 bg-white backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            K
          </div>
          <span className="text-xl font-bold tracking-tight">KITA Spaces</span>
        </Link>

        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-sm font-medium text-foreground/70 bg-foreground/5 px-3 py-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{currentUser.name}</span>
                <span className="sm:hidden">Menu</span>
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {currentUser.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* Dashboard/Admin Link */}
                    <button
                      onClick={handleDashboardClick}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {currentUser.role === 'ADMIN' ? (
                        <>
                          <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Admin Dashboard
                        </>
                      ) : (
                        <>
                          <HomeIcon className="w-4 h-4 mr-3 text-gray-400" />
                          My Dashboard
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              Member Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}