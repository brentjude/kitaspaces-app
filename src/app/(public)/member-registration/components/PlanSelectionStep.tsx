"use client";

import { MembershipPlanPublic } from "@/types/membership-registration";
import {
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

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
      alert("Please select a membership plan");
      return;
    }
    onNext();
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Calculate total days based on duration type
  const getTotalDays = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.durationDays * quantity;
  };

  // Get appropriate label for duration type
  const getDurationLabel = () => {
    if (!selectedPlan) return "";

    // Determine if plan is daily or monthly based on duration
    const isMonthlyPlan = selectedPlan.durationDays >= 28;

    if (isMonthlyPlan) {
      return quantity === 1 ? "Month" : "Months";
    }
    return quantity === 1 ? "Day" : "Days";
  };

  // Get max quantity based on plan type
  const getMaxQuantity = () => {
    if (!selectedPlan) return 12;
    const isMonthlyPlan = selectedPlan.durationDays >= 28;
    return isMonthlyPlan ? 12 : 30; // Max 12 months or 30 days
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
        {plans.map((plan) => {
          const isMonthlyPlan = plan.durationDays >= 28;
          const planType = isMonthlyPlan ? "Monthly" : "Daily";

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col h-full ${
                selectedPlanId === plan.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-foreground/10 hover:border-foreground/20 hover:shadow-md"
              }`}
            >
              {selectedPlanId === plan.id && (
                <div className="absolute top-4 right-4 text-primary">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
              )}

              {/* Plan Type Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {planType} Pass
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-foreground/60">
                  {plan.description || "No description"}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-foreground">
                    ₱{plan.price.toFixed(2)}
                  </span>
                  <span className="ml-2 text-foreground/60">
                    / {isMonthlyPlan ? "month" : "day"}
                  </span>
                </div>
                <p className="text-xs text-foreground/40 mt-1">
                  {plan.durationDays} days per{" "}
                  {isMonthlyPlan ? "month" : "pass"}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-foreground/10">
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                  Included Benefits
                </p>
                <ul className="space-y-2">
                  {plan.perks.slice(0, 5).map((perk) => (
                    <li key={perk.id} className="flex items-start text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
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
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-foreground/10 rounded-xl">
            <p className="text-foreground/60">
              No membership plans currently available.
            </p>
          </div>
        )}
      </div>

      {/* Duration Selector - Only shows when a plan is selected */}
      {selectedPlanId && selectedPlan && (
        <div className="bg-linear-to-br from-primary/5 to-orange-50 rounded-2xl p-6 mb-8 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-foreground mb-1">
              How long would you like to avail?
            </h3>
            <p className="text-sm text-foreground/60">
              Extend your membership by selecting the duration
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={onDecrement}
              className="w-12 h-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              disabled={quantity <= 1}
            >
              <MinusIcon className="w-5 h-5" />
            </button>

            <div className="text-center min-w-[120px]">
              <div className="text-4xl font-extrabold text-foreground mb-1">
                {quantity}
              </div>
              <div className="text-sm font-semibold text-primary uppercase tracking-wide">
                {getDurationLabel()}
              </div>
            </div>

            <button
              onClick={onIncrement}
              className="w-12 h-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={quantity >= getMaxQuantity()}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-primary/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Total Duration:</span>
              <span className="font-bold text-foreground">
                {getTotalDays()} days
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-foreground/60">Total Amount:</span>
              <span className="text-2xl font-extrabold text-primary">
                ₱{(selectedPlan.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedPlanId}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          Continue
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
