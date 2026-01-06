// filepath: src/app/(users)/user/settings/components/UserProfileSidebar.tsx
'use client';

import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface UserProfileSidebarProps {
  name: string;
  email: string;
  onChangePassword: () => void;
}

export default function UserProfileSidebar({
  name,
  email,
  onChangePassword,
}: UserProfileSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserCircleIcon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            {name || 'User'}
          </h2>
          <p className="text-sm text-foreground/60 mb-1">{email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Member
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-foreground/10">
          <button
            onClick={onChangePassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-foreground/20 text-foreground font-medium rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <LockClosedIcon className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> Your email address cannot be changed. If you
          need to update it, please contact support.
        </p>
      </div>
    </div>
  );
}