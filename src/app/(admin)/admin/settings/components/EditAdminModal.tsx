'use client';

import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';

interface EditAdminModalProps {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  onClose: () => void;
  onSave: (id: string, data: { name: string; password?: string; superKey: string }) => Promise<void>;
}

export default function EditAdminModal({
  admin,
  onClose,
  onSave,
}: EditAdminModalProps) {
  const [name, setName] = useState(admin.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [superKey, setSuperKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuperKey, setShowSuperKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate super key
    if (!superKey.trim()) {
      setError('Super secret key is required');
      return;
    }

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const data: { name: string; password?: string; superKey: string } = {
        name: name.trim(),
        superKey: superKey.trim(),
      };
      if (password) {
        data.password = password;
      }

      await onSave(admin.id, data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Edit Admin</h3>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Super Secret Key - First Field */}
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <KeyIcon className="w-5 h-5 text-orange-600" />
              <label className="block text-sm font-bold text-orange-900">
                Super Secret Key <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showSuperKey ? 'text' : 'password'}
                required
                className="w-full px-3 py-2 pr-10 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                value={superKey}
                onChange={(e) => setSuperKey(e.target.value)}
                placeholder="Enter super secret key"
              />
              <button
                type="button"
                onClick={() => setShowSuperKey(!showSuperKey)}
                className="absolute right-3 top-2.5 text-orange-600 hover:text-orange-800"
              >
                {showSuperKey ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-orange-700 mt-2">
              🔒 Required to modify admin accounts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              disabled
              className="w-full px-3 py-2 border border-foreground/20 rounded-lg bg-foreground/5 text-foreground/60 cursor-not-allowed"
              value={admin.email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
            />
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <p className="text-sm font-medium text-foreground mb-3">
              Change Password (Optional)
            </p>
            <p className="text-xs text-foreground/60 mb-3">
              Leave password fields empty if you don't want to change the password
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-foreground/40 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {password && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 pr-10 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-foreground/40 hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}