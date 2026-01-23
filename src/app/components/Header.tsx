"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  Cog6ToothIcon, 
  HomeIcon,
  CalendarIcon,
  PresentationChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface PublicHeaderProps {
  currentUser?: {
    name: string;
    email: string;
    role?: string;
    isMember?: boolean;
  } | null;
  onLoginClick?: () => void;
}

export default function PublicHeader({
  currentUser,
  onLoginClick,
}: PublicHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const handleLoginClick = () => {
    setShowMobileMenu(false);
    if (onLoginClick) {
      onLoginClick();
    } else {
      router.push('/auth/signin');
    }
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    if (currentUser?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    if (currentUser?.role === 'ADMIN') {
      router.push('/admin/settings');
    } else {
      router.push('/user/settings');
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => {
    // For homepage, only match exact path
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Only show for guests (not logged in)
  const shouldShowMembershipButton = !currentUser;

  return (
    <nav className="border-b border-gray-100 bg-white backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <Image 
            src="/logo/kita-primary-logo.png" 
            alt="KitaSpaces Logo" 
            width={120} 
            height={60}
          />
        </Link>

        {/* Center Navigation - Desktop Only */}
        <div className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/events"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/events')
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Events
          </Link>
          
          <Link
            href="/meeting-rooms"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/meeting-rooms')
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <PresentationChartBarIcon className="w-4 h-4" />
            Meeting Rooms
          </Link>

          <Link
            href="/contact"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/contact')
                ? 'bg-primary/10 text-primary'
                : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <EnvelopeIcon className="w-4 h-4" />
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              {/* Desktop User Menu Button */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span>{currentUser.name}</span>
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Desktop Dropdown */}
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.isMember ? 'Member' : 'User'}
                        </span>
                        {currentUser.isMember && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            ✓ Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {currentUser.role === 'ADMIN' ? (
                          <>
                            <HomeIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Admin Dashboard
                          </>
                        ) : (
                          <>
                            <HomeIcon className="w-4 h-4 mr-3 text-gray-400" />
                            My Dashboard
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                        Settings
                      </button>

                      <div className="border-t border-gray-100 my-1" />

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

              {/* Mobile Menu Button */}
              <div className="md:hidden relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? (
                    <XMarkIcon className="w-6 h-6 text-foreground" />
                  ) : (
                    <Bars3Icon className="w-6 h-6 text-foreground" />
                  )}
                </button>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
                    {/* User Info Section */}
                    <div className="px-4 py-4 border-b border-gray-100 bg-foreground/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.isMember ? 'Member' : 'User'}
                        </span>
                        {currentUser.isMember && (
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            ✓ Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <HomeIcon className="w-5 h-5" />
                        Home
                      </Link>

                      <Link
                        href="/events"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/events')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CalendarIcon className="w-5 h-5" />
                        Events
                      </Link>

                      <Link
                        href="/meeting-rooms"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/meeting-rooms')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <PresentationChartBarIcon className="w-5 h-5" />
                        Meeting Rooms
                      </Link>

                      <Link
                        href="/contact"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/contact')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        Contact
                      </Link>

                      <div className="border-t border-gray-100 my-2" />
                      
                      <button
                        onClick={handleDashboardClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {currentUser.role === 'ADMIN' ? (
                          <>
                            <HomeIcon className="w-5 h-5" />
                            Admin Dashboard
                          </>
                        ) : (
                          <>
                            <HomeIcon className="w-5 h-5" />
                            My Dashboard
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        Settings
                      </button>
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-gray-100 p-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Become a Member Button - Desktop (Beside Login) */}
              {shouldShowMembershipButton && (
                <Link
                  href="/member-registration"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm bg-linear-to-r from-primary to-orange-400 text-white hover:shadow-md hover:scale-105"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Be a KITA Member
                </Link>
              )}

              {/* Login Button */}
              <button
                onClick={handleLoginClick}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>

              {/* Mobile Menu Button for Non-logged in users */}
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-lg hover:bg-foreground/5 transition-colors md:hidden"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? (
                    <XMarkIcon className="w-6 h-6 text-foreground" />
                  ) : (
                    <Bars3Icon className="w-6 h-6 text-foreground" />
                  )}
                </button>

                {/* Mobile Dropdown Menu for Non-logged in users */}
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <HomeIcon className="w-5 h-5" />
                        Home
                      </Link>

                      <Link
                        href="/events"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/events')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <CalendarIcon className="w-5 h-5" />
                        Events
                      </Link>

                      <Link
                        href="/meeting-rooms"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/meeting-rooms')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <PresentationChartBarIcon className="w-5 h-5" />
                        Meeting Rooms
                      </Link>

                      <Link
                        href="/contact"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive('/contact')
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        Contact
                      </Link>

                      {/* Become a Member for guests - Mobile */}
                      <Link
                        href="/member-registration"
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                          isActive('/member-registration')
                            ? 'text-white bg-primary'
                            : 'text-primary bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <SparklesIcon className="w-5 h-5" />
                        Be a KITA Member
                      </Link>
                    </div>

                    {/* Login Action */}
                    <div className="border-t border-gray-100 p-3">
                      <button
                        onClick={handleLoginClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-5 h-5" />
                        Login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}