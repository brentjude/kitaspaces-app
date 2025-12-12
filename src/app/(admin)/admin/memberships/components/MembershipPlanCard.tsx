'use client';

import { MembershipPlanWithPerks } from '@/types/membership';
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface MembershipPlanCardProps {
  plan: MembershipPlanWithPerks;
  onEdit: (plan: MembershipPlanWithPerks) => void;
  onToggleActive: (plan: MembershipPlanWithPerks) => void;
}

export default function MembershipPlanCard({
  plan,
  onEdit,
  onToggleActive,
}: MembershipPlanCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${
        plan.isActive
          ? 'border-gray-200 hover:border-primary/50'
          : 'border-gray-200 opacity-75'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded uppercase">
                {plan.type}
              </span>
              {plan.isActive ? (
                <span className="text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 rounded flex items-center">
                  <CheckCircleIcon className="w-3 h-3 mr-1" /> Active
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded flex items-center">
                  <XCircleIcon className="w-3 h-3 mr-1" /> Inactive
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ₱{plan.price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              per {plan.durationDays} days
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 h-10 line-clamp-2">
          {plan.description || 'No description'}
        </p>

        <div className="border-t border-gray-100 pt-4 mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
            <CubeIcon className="w-3 h-3 mr-1" /> {plan.perks.length} Included
            Perks
          </h4>
          <ul className="space-y-1">
            {plan.perks.slice(0, 3).map((perk) => (
              <li
                key={perk.id}
                className="text-sm text-gray-600 flex items-start"
              >
                <span className="mr-2 text-primary">•</span>
                {perk.name} ({perk.quantity} {perk.unit})
              </li>
            ))}
            {plan.perks.length > 3 && (
              <li className="text-xs text-gray-400 pl-4">
                + {plan.perks.length - 3} more perks
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <PencilSquareIcon className="w-4 h-4 mr-2" /> Edit
          </button>
          <button
            onClick={() => onToggleActive(plan)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              plan.isActive
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {plan.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}