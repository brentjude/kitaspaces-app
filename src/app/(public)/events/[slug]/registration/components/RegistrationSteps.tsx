"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Event } from "@/types/database";
import { RegistrationFormData, PaymentSettings } from "@/types/registration";
import AttendeeForm from "./AttendeeForm";
import PaymentSection from "./PaymentSection";
import OrderSummary from "./OrderSummary";

interface RegistrationStepsProps {
  event: Event & {
    freebies?: Array<{
      id: string;
      name: string;
      description: string | null;
      quantity: number;
    }>;
  };
  currentUser: {
    name: string;
    email: string;
    role: string;
    isMember?: boolean;
  } | null;
  paymentSettings: PaymentSettings | null;
  onCancel: () => void;
  onLoginRequest: () => void;
}

export default function RegistrationSteps({
  event,
  currentUser,
  paymentSettings,
  onCancel,
  onLoginRequest,
}: RegistrationStepsProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [memberId, setMemberId] = useState("");

  const isMember = currentUser?.isMember || !!memberId;
  
  // 🔧 FIX: Properly type narrow the memberDiscount check
  const hasMemberDiscount = Boolean(
    !event.isFree && 
    event.price > 0 && 
    event.memberDiscount && 
    event.memberDiscount > 0 && 
    isMember
  );
  
  // Calculate discounted price
  let pricePerAttendee = event.price;
  if (hasMemberDiscount && event.memberDiscount) {
    if (event.memberDiscountType === "PERCENTAGE") {
      pricePerAttendee = event.price - (event.price * event.memberDiscount) / 100;
    } else {
      pricePerAttendee = Math.max(0, event.price - event.memberDiscount);
    }
  }

  const isFreeEvent =
    event.price === 0 || event.isFree || pricePerAttendee === 0;

  const [formData, setFormData] = useState<RegistrationFormData>({
    attendees: [
      {
        id: "main",
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        selectedFreebies: {},
      },
    ],
    paymentMethod: isFreeEvent ? "FREE" : "GCASH",
    paymentProofUrl: "",
    referenceNumber: "",
  });

  const validateStep1 = (): boolean => {
    // Validate all attendees have name and email
    for (const attendee of formData.attendees) {
      if (!attendee.name.trim() || !attendee.email.trim()) {
        setError("Please fill in all attendee details");
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendee.email)) {
        setError(`Invalid email for ${attendee.name}`);
        return false;
      }

      // Only validate freebie selections if eligible
      const canSelectFreebies = event.hasCustomerFreebies || isMember;
      
      if (canSelectFreebies && event.freebies && event.freebies.length > 0) {
        for (const freebie of event.freebies) {
          const hasOptions = freebie.description && freebie.description.includes(",");

          if (hasOptions && !attendee.selectedFreebies[freebie.id]) {
            setError(`Please select an option for ${freebie.name} for ${attendee.name}`);
            return false;
          }
        }
      }
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleSubmit = async () => {
    if (
      !isFreeEvent &&
      (formData.paymentMethod === "GCASH" ||
        formData.paymentMethod === "BANK_TRANSFER") &&
      !formData.paymentProofUrl
    ) {
      setError("Please upload payment proof for online payments");
      return;
    }

    if (
      !isFreeEvent &&
      (formData.paymentMethod === "GCASH" ||
        formData.paymentMethod === "BANK_TRANSFER") &&
      !formData.referenceNumber?.trim()
    ) {
      setError("Please enter your payment reference number");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          attendees: formData.attendees.map((attendee) => ({
            name: attendee.name,
            email: attendee.email,
            freebieSelections: Object.entries(attendee.selectedFreebies).map(
              ([freebieId, selectedOption]) => ({
                freebieId,
                selectedOption,
              })
            ),
          })),
          paymentMethod: isFreeEvent ? undefined : formData.paymentMethod,
          paymentProofUrl: formData.paymentProofUrl || undefined,
          referenceNumber: formData.referenceNumber || undefined,
          memberId: memberId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      sessionStorage.setItem(
        "registrationConfirmation",
        JSON.stringify(data.data)
      );

      router.push(`/events/${event.slug}/registration/confirmation`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (isFreeEvent) return 0;
    return pricePerAttendee * formData.attendees.length;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Secure Your Spot
          </h1>
          <button
            onClick={onCancel}
            className="text-foreground/60 hover:text-foreground flex items-center text-sm font-medium"
          >
            <XMarkIcon className="w-5 h-5 mr-1" />
            Cancel
          </button>
        </div>

        <p className="text-foreground/60 text-sm">
          {event.title} • {new Date(event.date).toLocaleDateString()}
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center mt-6">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              currentStep >= 1
                ? "bg-primary text-white"
                : "bg-foreground/10 text-foreground/40"
            }`}
          >
            {currentStep > 1 ? <CheckIcon className="w-5 h-5" /> : "1"}
          </div>
          <span className="ml-3 font-medium text-sm">Attendee Details</span>

          <div className="flex-1 h-px bg-foreground/20 mx-4" />

          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              currentStep >= 2
                ? "bg-primary text-white"
                : "bg-foreground/10 text-foreground/40"
            }`}
          >
            2
          </div>
          <span className="ml-3 font-medium text-sm text-foreground/60">
            {isFreeEvent ? "Confirmation" : "Payment"}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-foreground/10 overflow-hidden">
        {currentStep === 1 && (
          <AttendeeForm
            attendees={formData.attendees}
            event={event}
            currentUser={currentUser}
            onAttendeesChange={(attendees) =>
              setFormData({ ...formData, attendees })
            }
            onLoginRequest={onLoginRequest}
            onMemberIdChange={setMemberId}
            memberId={memberId}
          />
        )}

        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-8">
            <OrderSummary
              attendees={formData.attendees}
              event={event}
              isFreeEvent={isFreeEvent}
              total={calculateTotal()}
              isMemberDiscountApplied={hasMemberDiscount}
              originalPrice={event.price * formData.attendees.length}
            />

            {!isFreeEvent && paymentSettings && (
              <PaymentSection
                paymentMethod={formData.paymentMethod}
                paymentProofUrl={formData.paymentProofUrl}
                referenceNumber={formData.referenceNumber}
                paymentSettings={paymentSettings}
                onPaymentMethodChange={(method) =>
                  setFormData({ ...formData, paymentMethod: method })
                }
                onPaymentProofChange={(url) =>
                  setFormData({ ...formData, paymentProofUrl: url })
                }
                onReferenceNumberChange={(ref) =>
                  setFormData({ ...formData, referenceNumber: ref })
                }
              />
            )}

            {!isFreeEvent && !paymentSettings && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                Payment settings are not configured. Please contact
                administrator.
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="p-6 bg-foreground/5 border-t border-foreground/10 flex justify-between items-center">
          {currentStep === 2 ? (
            <button
              onClick={handleBack}
              className="text-foreground/60 font-medium hover:text-foreground px-4 py-2"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={currentStep === 1 ? handleNext : handleSubmit}
            disabled={
              isSubmitting ||
              (currentStep === 2 && !isFreeEvent && !paymentSettings)
            }
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Processing..."
              : currentStep === 1
              ? isFreeEvent
                ? "Review & Confirm"
                : "Proceed to Payment"
              : "Confirm Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}