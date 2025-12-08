'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; email: string; password: string }) => Promise<void>;
}

export default function AddAdminModal({ isOpen, onClose, onAdd }: AddAdminModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      setFormData({ name: '', email: '', password: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add System Administrator">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="admin@kitaspaces.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Password
          </label>
          <input
            type="password"
            className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <p className="mt-1 text-xs text-foreground/50">
            Admin will have full access to the system.
          </p>
        </div>

        <div className="flex justify-end gap-3 p-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Administrator'}
          </button>
        </div>
      </form>
    </Modal>
  );
}