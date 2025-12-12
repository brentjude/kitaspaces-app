'use client';

import { useState } from 'react';
import { MembershipPlanPublic } from '@/types/membership-registration';
import {
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface PlanSelectionStepProps {
  plans: MembershipPlanPublic[];
  selectedPlanId: string;
  onSelectPlan: (id: string) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onNext: () => void;
}

export default function PlanSelectionStep({
  plans,
  selectedPlanId,
  onSelectPlan,
  quantity,
  onIncrement,
  onDecrement,
  onNext,
}: PlanSelectionStepProps) {
  const handleContinue = () => {
    if (!selectedPlanId) {
      alert('Please select a membership plan');
      return;
    }
    onNext();
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
        Choose Your Plan
      </h2>
      <p className="text-foreground/60 text-center mb-8">
        Select the membership that fits your needs
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col h-full ${
              selectedPlanId === plan.id
                ? 'border-primary bg-primary/5'
                : 'border-foreground/10 hover:border-foreground/20'
            }`}
          >
            {selectedPlanId === plan.id && (
              <div className="absolute top-4 right-4 text-primary">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-foreground/60">
                {plan.description || 'No description'}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-foreground">
                  ₱{plan.price.toFixed(2)}
                </span>
                <span className="ml-2 text-foreground/60">
                  / {plan.durationDays} days
                </span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-foreground/10">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                Included Benefits
              </p>
              <ul className="space-y-2">
                {plan.perks.slice(0, 5).map((perk) => (
                  <li key={perk.id} className="flex items-start text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">
                      {perk.quantity} {perk.unit} {perk.name}
                    </span>
                  </li>
                ))}
                {plan.perks.length > 5 && (
                  <li className="text-xs text-foreground/40 pl-6">
                    + {plan.perks.length - 5} more benefits
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-foreground/10 rounded-xl">
            <p className="text-foreground/60">
              No membership plans currently available.
            </p>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="bg-foreground/5 rounded-xl p-6 mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3 text-center">
          Duration Multiplier
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onDecrement}
            className="w-12 h-12 rounded-full bg-white border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors"
            disabled={quantity <= 1}
          >
            <MinusIcon className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold text-foreground w-16 text-center">
            {quantity}
          </span>
          <button
            onClick={onIncrement}
            className="w-12 h-12 rounded-full bg-white border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-foreground/60 mt-3">
          Multiply the duration to extend your membership period
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center"
        >
          Continue
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}