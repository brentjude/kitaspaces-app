'use client';

import { useState } from 'react';
import { UserIcon, BellIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface GeneralTabProps {
  profile: {
    name: string;
    email: string;
    company: string | null;
    contactNumber: string | null;
  };
  onUpdateProfile: (data: Partial<GeneralTabProps['profile']>) => Promise<void>;
  onUpdatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export default function GeneralTab({ profile, onUpdateProfile, onUpdatePassword }: GeneralTabProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(localProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');

    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsPasswordSaving(true);
    try {
      await onUpdatePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Profile Information
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={localProfile.name}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm bg-foreground/5 cursor-not-allowed"
                value={localProfile.email}
                disabled
              />
              <p className="mt-1 text-xs text-foreground/50">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Company
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={localProfile.company || ''}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, company: e.target.value })
                }
                placeholder="Company name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={localProfile.contactNumber || ''}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, contactNumber: e.target.value })
                }
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications - Placeholder for future implementation */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            Notifications
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-foreground/60">
            Notification preferences will be available in a future update.
          </p>
        </div>
      </div>

      {/* Security / Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <LockClosedIcon className="w-5 h-5 mr-2" />
            Security
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{passwordError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={passwordForm.new}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new: e.target.value })
                }
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdatePassword}
              disabled={isPasswordSaving}
              className="inline-flex items-center px-4 py-2 bg-white border border-foreground/20 text-foreground text-sm font-medium rounded-lg hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isPasswordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}