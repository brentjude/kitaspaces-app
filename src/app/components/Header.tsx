"use client";

import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

interface PublicHeaderProps {
  currentUser?: {
    name: string;
    email: string;
  } | null;
  onLoginClick?: () => void;
}

export default function PublicHeader({
  currentUser,
  onLoginClick,
}: PublicHeaderProps) {
  return (
    <nav className=" border-gray-100 bg-white backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            K
          </div>
          <span className="text-xl font-bold tracking-tight">KITA Spaces</span>
        </Link>

        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center text-sm font-medium text-foreground/70 bg-foreground/5 px-3 py-1.5 rounded-lg">
              <UserIcon className="w-4 h-4 mr-2" />
              {currentUser.name}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-all"
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
