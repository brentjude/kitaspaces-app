'use client';

import { useState } from 'react';
import { TicketIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Coupon } from '@/types/database';

interface CouponsTabProps {
  coupons: Coupon[];
  onAddCoupon: (data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    expiresAt: Date | null;
  }) => Promise<void>;
  onToggleCoupon: (id: string, isActive: boolean) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export default function CouponsTab({
  coupons,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}: CouponsTabProps) {
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxUses: '',
    expiresAt: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    setError('');

    if (!newCoupon.code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    if (newCoupon.discountValue <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }

    setIsAdding(true);
    try {
      await onAddCoupon({
        code: newCoupon.code.toUpperCase(),
        discountType: newCoupon.discountType,
        discountValue: newCoupon.discountValue,
        maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
        expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt) : null,
      });
      setNewCoupon({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        maxUses: '',
        expiresAt: '',
      });
    } catch (err) {
      console.error('Error adding coupon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add coupon';
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setError('');
    try {
      await onToggleCoupon(id, !currentStatus);
    } catch (err) {
      console.error('Error toggling coupon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle coupon';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    setError('');
    setDeletingId(id);

    try {
      await onDeleteCoupon(id);
    } catch (err) {
      console.error('Error deleting coupon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete coupon';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
        <h3 className="text-base font-semibold text-foreground flex items-center">
          <TicketIcon className="w-5 h-5 mr-2" />
          Membership Coupons
        </h3>
      </div>
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Add Coupon Form */}
        <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 mb-6">
          <h4 className="text-sm font-semibold text-foreground/80 mb-3">
            Create New Coupon
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                placeholder="SAVE50"
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCoupon.code}
                onChange={(e) => {
                  setError('');
                  setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() });
                }}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Type
              </label>
              <select
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCoupon.discountType}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discountType: e.target.value })
                }
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE">Free</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Value
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCoupon.discountValue || ''}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discountValue: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                Max Uses
              </label>
              <input
                type="number"
                min="0"
                placeholder="Unlimited"
                className="block w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={newCoupon.maxUses}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, maxUses: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-foreground/60 mb-1">
                &nbsp;
              </label>
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4 mr-1.5" />
                {isAdding ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="overflow-hidden border border-foreground/10 rounded-lg">
          <table className="min-w-full divide-y divide-foreground/10">
            <thead className="bg-foreground/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-foreground/10">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-foreground/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-medium text-sm bg-foreground/10 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}% OFF`
                      : coupon.discountType === 'FREE'
                      ? 'FREE'
                      : `₱${coupon.discountValue} OFF`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                    {coupon.usedCount} / {coupon.maxUses || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      disabled={deletingId === coupon.id}
                      className="text-foreground/40 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === coupon.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground/40 text-sm"
                  >
                    No coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}