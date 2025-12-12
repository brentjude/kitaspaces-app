'use client';

import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import MembershipPlanCard from './components/MembershipPlanCard';
import CreateMembershipPlanModal from './components/CreateMembershipPlanModal';
import {
  MembershipPlanFormData,
  MembershipPlanWithPerks,
} from '@/types/membership';

export default function MembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlanWithPerks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<
    MembershipPlanWithPerks | undefined
  >(undefined);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/memberships');
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        alert('Failed to fetch membership plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Failed to fetch membership plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: MembershipPlanWithPerks) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: MembershipPlanFormData) => {
    try {
      const url = data.id
        ? `/api/admin/memberships/${data.id}`
        : '/api/admin/memberships';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchPlans();
        setIsModalOpen(false);
        alert(
          data.id
            ? 'Membership plan updated successfully'
            : 'Membership plan created successfully'
        );
      } else {
        alert(result.error || 'Failed to save membership plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save membership plan');
    }
  };

  const handleToggleActive = async (plan: MembershipPlanWithPerks) => {
    try {
      const response = await fetch(`/api/admin/memberships/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...plan,
          isActive: !plan.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchPlans();
      } else {
        alert(result.error || 'Failed to update membership plan');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      alert('Failed to update membership plan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Membership Plans</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
        {plans.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            No membership plans found. Create one to get started.
          </div>
        )}
      </div>

      <CreateMembershipPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPlan}
      />
    </div>
  );
}