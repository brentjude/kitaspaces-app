'use client';

import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, KeyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteAdminModalProps {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  onClose: () => void;
  onDelete: (id: string, superKey: string) => Promise<void>;
}

export default function DeleteAdminModal({
  admin,
  onClose,
  onDelete,
}: DeleteAdminModalProps) {
  const [superKey, setSuperKey] = useState('');
  const [showSuperKey, setShowSuperKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!superKey.trim()) {
      setError('Super secret key is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onDelete(admin.id, superKey.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Delete Admin
          </h3>
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

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-2">
            ⚠️ This action cannot be undone!
          </p>
          <p className="text-sm text-red-700">
            You are about to permanently delete the admin account:
          </p>
          <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm font-bold text-foreground">{admin.name}</p>
            <p className="text-xs text-foreground/60">{admin.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Super Secret Key */}
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <KeyIcon className="w-5 h-5 text-orange-600" />
              <label className="block text-sm font-bold text-orange-900">
                Enter Super Secret Key to Confirm <span className="text-red-500">*</span>
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
                autoFocus
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
              🔒 This key is required to delete admin accounts for security purposes.
            </p>
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}