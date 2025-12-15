'use client';

import { useState } from 'react';
import { Coupon } from '@/types/database';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CouponsTabProps {
  coupons: Coupon[];
  onAddCoupon: (data: {
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    expiresAt: Date | null;
  }) => Promise<void>;
  onEditCoupon: (
    id: string,
    data: {
      code: string;
      discountType: string;
      discountValue: number;
      maxUses: number | null;
      expiresAt: Date | null;
    }
  ) => Promise<void>;
  onToggleCoupon: (id: string, isActive: boolean) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export default function CouponsTab({
  coupons,
  onAddCoupon,
  onEditCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}: CouponsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxUses: null as number | null,
    expiresAt: null as Date | null,
  });

  const handleOpenAddModal = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxUses: null,
      expiresAt: null,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxUses: null,
      expiresAt: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditModalOpen && editingCoupon) {
        await onEditCoupon(editingCoupon.id, formData);
        alert('Coupon updated successfully!');
      } else {
        await onAddCoupon(formData);
        alert('Coupon added successfully!');
      }
      handleCloseModals();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to save coupon'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await onDeleteCoupon(id);
      alert('Coupon deleted successfully!');
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to delete coupon'
      );
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await onToggleCoupon(id, !currentStatus);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to toggle coupon'
      );
    }
  };

  const isCouponExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Discount Coupons</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Manage coupon codes for membership discounts
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Coupon
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-8 text-center text-foreground/60">
            No coupons created yet. Add your first coupon to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Expiration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {coupons.map((coupon) => {
                  const isExpired = isCouponExpired(coupon.expiresAt);
                  return (
                    <tr key={coupon.id} className="hover:bg-foreground/5">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-foreground">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : coupon.discountType === 'FIXED_AMOUNT'
                            ? `₱${coupon.discountValue}`
                            : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ' (Unlimited)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {coupon.expiresAt ? (
                          <div className="flex flex-col">
                            <span
                              className={`text-sm ${
                                isExpired ? 'text-red-600' : 'text-foreground'
                              }`}
                            >
                              {new Date(coupon.expiresAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {isExpired && (
                              <span className="text-xs text-red-600 font-medium">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-foreground/60">No expiration</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(coupon.id, coupon.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            coupon.isActive && !isExpired
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {coupon.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit coupon"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete coupon"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {isEditModalOpen ? 'Edit Coupon' : 'Add New Coupon'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary uppercase font-mono"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="FREE">Free (100% off)</option>
                </select>
              </div>

              {formData.discountType !== 'FREE' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    placeholder={
                      formData.discountType === 'PERCENTAGE' ? '10' : '500'
                    }
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    {formData.discountType === 'PERCENTAGE'
                      ? 'Enter percentage (0-100)'
                      : 'Enter amount in pesos'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Maximum Uses (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                  value={formData.maxUses || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary"
                  value={
                    formData.expiresAt
                      ? new Date(formData.expiresAt).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiresAt: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
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
                  {isSubmitting
                    ? 'Saving...'
                    : isEditModalOpen
                    ? 'Update Coupon'
                    : 'Add Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}