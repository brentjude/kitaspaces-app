'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import {
  MembershipPlanFormData,
  MembershipPlanPerk,
  MembershipPlanWithPerks,
} from '@/types/membership';
import { PerkType, MembershipType } from '@/generated/prisma';
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  CubeIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface CreateMembershipPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MembershipPlanFormData) => Promise<void>;
  initialData?: MembershipPlanWithPerks;
}

const PERK_TYPES: { value: PerkType; label: string }[] = [
  { value: 'MEETING_ROOM_HOURS', label: 'Meeting Room Hours' },
  { value: 'PRINTING_CREDITS', label: 'Printing Credits' },
  { value: 'EVENT_DISCOUNT', label: 'Event Discount' },
  { value: 'LOCKER_ACCESS', label: 'Locker Access' },
  { value: 'COFFEE_VOUCHERS', label: 'Coffee Vouchers' },
  { value: 'PARKING_SLOTS', label: 'Parking Slots' },
  { value: 'GUEST_PASSES', label: 'Guest Passes' },
  { value: 'CUSTOM', label: 'Custom Perk' },
];

const DAYS_OF_WEEK = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export default function CreateMembershipPlanModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateMembershipPlanModalProps) {
  const [formData, setFormData] = useState<MembershipPlanFormData>({
    name: '',
    description: '',
    type: 'MONTHLY',
    price: 0,
    durationDays: 30,
    isActive: true,
    perks: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type,
        price: initialData.price,
        durationDays: initialData.durationDays,
        isActive: initialData.isActive,
        perks: initialData.perks.map((perk) => ({
          id: perk.id,
          perkType: perk.perkType,
          name: perk.name,
          description: perk.description || '',
          quantity: perk.quantity,
          unit: perk.unit,
          maxPerDay: perk.maxPerDay || undefined,
          maxPerWeek: perk.maxPerWeek || undefined,
          daysOfWeek: perk.daysOfWeek ? JSON.parse(perk.daysOfWeek) : undefined,
          isRecurring: perk.isRecurring,
          validFrom: perk.validFrom || undefined,
          validUntil: perk.validUntil || undefined,
        })),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'MONTHLY',
        price: 0,
        durationDays: 30,
        isActive: true,
        perks: [],
      });
    }
  }, [initialData, isOpen]);

  const handleAddPerk = () => {
    const newPerk: MembershipPlanPerk = {
      perkType: 'CUSTOM',
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      isRecurring: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    };
    setFormData({ ...formData, perks: [...formData.perks, newPerk] });
  };

  const handleRemovePerk = (index: number) => {
    setFormData({
      ...formData,
      perks: formData.perks.filter((_, i) => i !== index),
    });
  };

  const handlePerkChange = (
    index: number,
    field: keyof MembershipPlanPerk,
    value: string | number | boolean | number[] | undefined
  ) => {
    setFormData({
      ...formData,
      perks: formData.perks.map((p, i) => {
        if (i === index) {
          const updated = { ...p, [field]: value };
          // Auto-set name/unit based on type if name is empty
          if (field === 'perkType' && !p.name) {
            const typeLabel = PERK_TYPES.find((t) => t.value === value)?.label;
            if (typeLabel) updated.name = typeLabel;
            if (value === 'MEETING_ROOM_HOURS') updated.unit = 'hours';
            if (value === 'PRINTING_CREDITS') updated.unit = 'pages';
            if (value === 'EVENT_DISCOUNT') updated.unit = '%';
          }
          return updated;
        }
        return p;
      }),
    });
  };

  const toggleAccessDay = (perkIndex: number, day: number) => {
    const perk = formData.perks[perkIndex];
    if (!perk) return;

    const currentDays = perk.daysOfWeek || [];
    let newDays: number[];
    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day].sort();
    }
    handlePerkChange(perkIndex, 'daysOfWeek', newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={initialData ? 'Edit Membership Plan' : 'Create Membership Plan'} isOpen={isOpen} onClose={onClose} size="xl">

      <div className="flex-1 overflow-y-auto p-6">
        <form id="planForm" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="e.g. Premium Monthly"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Brief description of the plan"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Type
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as MembershipType,
                  })
                }
              >
                <option value="MONTHLY">Monthly</option>
                <option value="DAILY">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationDays: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-end mb-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Plan is Active
                </span>
              </label>
            </div>
          </div>

          {/* Perks Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900 flex items-center">
                <CubeIcon className="w-4.5 h-4.5 mr-2 text-primary" /> Included
                Perks
              </h4>
              <button
                type="button"
                onClick={handleAddPerk}
                className="text-xs flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Perk
              </button>
            </div>

            <div className="space-y-4">
              {formData.perks.map((perk, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group transition-all hover:shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleRemovePerk(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Type
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        value={perk.perkType}
                        onChange={(e) =>
                          handlePerkChange(index, 'perkType', e.target.value)
                        }
                      >
                        {PERK_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        value={perk.name}
                        onChange={(e) =>
                          handlePerkChange(index, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        value={perk.quantity}
                        onChange={(e) =>
                          handlePerkChange(
                            index,
                            'quantity',
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. hours"
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        value={perk.unit}
                        onChange={(e) =>
                          handlePerkChange(index, 'unit', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Optional description..."
                      rows={2}
                      value={perk.description}
                      onChange={(e) =>
                        handlePerkChange(index, 'description', e.target.value)
                      }
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="pt-3 border-t border-gray-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Max Per Day */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Max Per Day (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Unlimited"
                        value={perk.maxPerDay || ''}
                        onChange={(e) =>
                          handlePerkChange(
                            index,
                            'maxPerDay',
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>

                    {/* Max Per Week */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Max Per Week (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-md border-gray-300 text-sm py-1.5 focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Unlimited"
                        value={perk.maxPerWeek || ''}
                        onChange={(e) =>
                          handlePerkChange(
                            index,
                            'maxPerWeek',
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>

                    {/* Recurring Toggle */}
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer select-none">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={perk.isRecurring !== false}
                            onChange={(e) =>
                              handlePerkChange(
                                index,
                                'isRecurring',
                                e.target.checked
                              )
                            }
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-600 flex items-center">
                          <ArrowPathIcon className="w-3 h-3 mr-1" /> Recurring
                        </span>
                      </label>
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="time"
                        className="text-xs border border-gray-300 rounded px-1.5 py-1 w-20 focus:border-primary focus:outline-none"
                        value={perk.validFrom || ''}
                        onChange={(e) =>
                          handlePerkChange(index, 'validFrom', e.target.value)
                        }
                      />
                      <span className="text-xs text-gray-400">-</span>
                      <input
                        type="time"
                        className="text-xs border border-gray-300 rounded px-1.5 py-1 w-20 focus:border-primary focus:outline-none"
                        value={perk.validUntil || ''}
                        onChange={(e) =>
                          handlePerkChange(index, 'validUntil', e.target.value)
                        }
                      />
                    </div>

                    {/* Days of Week */}
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 mr-1" />
                      <span className="text-xs font-semibold text-gray-500 mr-2">
                        Available:
                      </span>
                      <div className="flex gap-1">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = (perk.daysOfWeek || []).includes(
                            day.value
                          );
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleAccessDay(index, day.value)}
                              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {formData.perks.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400 text-sm">
                  No perks added yet.
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          form="planForm"
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-50"
        >
          <CheckCircleIcon className="w-4.5 h-4.5 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </Modal>
  );
}