"use client";

import { PlusIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { Event } from "@/types/database";
import { AttendeeFormData } from "@/types/registration";
import FreebieSelector from "./FreebieSelector";
import { useState, useEffect } from "react";

interface AttendeeFormProps {
  attendees: AttendeeFormData[];
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
    isMember?: boolean;
  } | null;
  onAttendeesChange: (attendees: AttendeeFormData[]) => void;
  onLoginRequest: () => void;
  onMemberIdChange: (memberId: string) => void;
  memberId: string;
}

export default function AttendeeForm({
  attendees,
  event,
  currentUser,
  onAttendeesChange,
  onLoginRequest,
  onMemberIdChange,
  memberId,
}: AttendeeFormProps) {
  const [memberIdInput, setMemberIdInput] = useState(memberId);
  const [isVerifyingMember, setIsVerifyingMember] = useState(false);
  const [memberVerificationError, setMemberVerificationError] = useState("");
  const [showFreebieActivationMessage, setShowFreebieActivationMessage] = useState(false);

  const isMember = currentUser?.isMember || !!memberId;
  const hasMemberDiscount = !event.isFree && event.price > 0 && event.memberDiscount && event.memberDiscount > 0;
  const hasFreebies = event.freebies && event.freebies.length > 0;
  const canSelectFreebies = event.hasCustomerFreebies || isMember;

  // 🆕 Effect to show freebie activation message when member ID is verified
  useEffect(() => {
    if (memberId && hasFreebies && !event.hasCustomerFreebies) {
      setShowFreebieActivationMessage(true);
      
      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowFreebieActivationMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [memberId, hasFreebies, event.hasCustomerFreebies]);

  const handleVerifyMemberId = async () => {
    if (!memberIdInput.trim()) {
      setMemberVerificationError("Please enter a member ID");
      return;
    }

    setIsVerifyingMember(true);
    setMemberVerificationError("");

    try {
      const response = await fetch(`/api/user?id=${memberIdInput}`);
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        if (data.data.isMember) {
          onMemberIdChange(memberIdInput);
          // Pre-fill first attendee with member data
          if (attendees.length > 0) {
            const updatedAttendees = [...attendees];
            updatedAttendees[0] = {
              ...updatedAttendees[0],
              name: data.data.name,
              email: data.data.email,
            };
            onAttendeesChange(updatedAttendees);
          }
        } else {
          setMemberVerificationError("This ID is not associated with an active member");
        }
      } else {
        setMemberVerificationError("Member ID not found");
      }
    } catch (error) {
      console.error("Error verifying member:", error);
      setMemberVerificationError("Failed to verify member ID");
    } finally {
      setIsVerifyingMember(false);
    }
  };

  const addAttendee = () => {
    onAttendeesChange([
      ...attendees,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: "",
        email: "",
        selectedFreebies: {},
      },
    ]);
  };

  const removeAttendee = (id: string) => {
    onAttendeesChange(attendees.filter((a) => a.id !== id));
  };

  const updateAttendee = (
    id: string,
    field: keyof AttendeeFormData,
    value: string | Record<string, string>
  ) => {
    onAttendeesChange(
      attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* 🆕 Freebie Activation Success Message */}
      {showFreebieActivationMessage && hasFreebies && !event.hasCustomerFreebies && memberId && (
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white p-2 rounded-full shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900 mb-1 flex items-center gap-2">
                🎉 Member Benefits Activated!
                <button
                  onClick={() => setShowFreebieActivationMessage(false)}
                  className="ml-auto text-green-700 hover:text-green-900"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </p>
              <p className="text-xs text-green-700 mb-2">
                You can now select from {event.freebies?.length} exclusive member perks below! 
                {hasMemberDiscount && " Your member discount has also been applied."}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-green-800 font-medium">Scroll down to choose your freebies for each attendee</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Status Display for Logged In Users */}
      {currentUser && (
        <div className={`rounded-xl p-4 border-2 ${
          isMember 
            ? "bg-green-50 border-green-200" 
            : "bg-orange-50 border-orange-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <div className="bg-green-600 text-white p-2 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Member Benefits Active</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hasMemberDiscount && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          ✓ Discount Applied
                        </span>
                      )}
                      {hasFreebies && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          ✓ {event.freebies?.length} Perks Available
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-orange-500 text-white p-2 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900">Non-Member</p>
                    <p className="text-xs text-orange-700">
                      Upgrade to access exclusive benefits
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Benefits Info Card - Only show if not logged in and benefits exist */}
      {!currentUser && (hasMemberDiscount || (hasFreebies && !event.hasCustomerFreebies)) && !memberId && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                KITA Member Benefits Available
              </h3>
              
              {hasMemberDiscount && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    SAVE {event.memberDiscountType === "PERCENTAGE" 
                      ? `${event.memberDiscount}%` 
                      : `₱${event.memberDiscount?.toFixed(2)}`}
                  </div>
                  <span className="text-sm text-blue-800">
                    Member Price: ₱
                    {event.memberDiscountType === "PERCENTAGE"
                      ? (event.price - (event.price * (event.memberDiscount || 0)) / 100).toFixed(2)
                      : Math.max(0, event.price - (event.memberDiscount || 0)).toFixed(2)}
                  </span>
                </div>
              )}

              {hasFreebies && !event.hasCustomerFreebies && (
                <div className="text-sm text-blue-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Exclusive event perks for KITA members
                </div>
              )}
            </div>
          </div>

          {/* Login or Member ID Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {/* Login Option */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Already a member?</p>
              <button
                onClick={onLoginRequest}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                Login to Apply Benefits
              </button>
            </div>

            {/* Member ID Option */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Have a member ID?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Member ID (e.g., 2025001)"
                  value={memberIdInput}
                  onChange={(e) => {
                    setMemberIdInput(e.target.value);
                    setMemberVerificationError("");
                  }}
                  className="flex-1 text-sm px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isVerifyingMember}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isVerifyingMember) {
                      handleVerifyMemberId();
                    }
                  }}
                />
                <button
                  onClick={handleVerifyMemberId}
                  disabled={isVerifyingMember}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isVerifyingMember ? "..." : "Verify"}
                </button>
              </div>
              {memberVerificationError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {memberVerificationError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Member ID Verified Badge */}
      {memberId && !currentUser && (
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-900">Member Verified</p>
                <p className="text-xs text-green-700">Member ID: {memberId}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasMemberDiscount && (
                <span className="text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium">
                  ✓ Discount Applied
                </span>
              )}
              {hasFreebies && !event.hasCustomerFreebies && (
                <span className="text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium">
                  ✓ Perks Unlocked
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      { !isMember && (
        <div className="text-center text-sm text-foreground/70 italic">
          <h3>Not a member? Register as Guest</h3>
        </div>
      )}

      {/* Attendees */}
      {attendees.map((attendee, index) => (
        <div
          key={attendee.id}
          className="relative pb-8 border-b border-foreground/10 last:border-0 last:pb-0"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-primary" />
              {index === 0 ? "Main Attendee (You)" : `Guest #${index}`}
            </h3>
            {index > 0 && (
              <button
                onClick={() => removeAttendee(attendee.id)}
                className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Full Name"
                value={attendee.name}
                onChange={(e) =>
                  updateAttendee(attendee.id, "name", e.target.value)
                }
                disabled={index === 0 && (!!currentUser || !!memberId)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="email@example.com"
                value={attendee.email}
                onChange={(e) =>
                  updateAttendee(attendee.id, "email", e.target.value)
                }
                disabled={index === 0 && (!!currentUser || !!memberId)}
              />
            </div>
          </div>

          {/* 🆕 Freebies Section with Activation Indicator */}
          {hasFreebies && canSelectFreebies && event.freebies && (
            <div className={memberId && !event.hasCustomerFreebies ? "ring-2 ring-green-300 rounded-xl p-1 bg-green-50/50" : ""}>
              <FreebieSelector
                freebies={event.freebies}
                selectedFreebies={attendee.selectedFreebies}
                onFreebieChange={(freebieId, option) => {
                  const newSelectedFreebies = {
                    ...attendee.selectedFreebies,
                    [freebieId]: option,
                  };
                  updateAttendee(
                    attendee.id,
                    "selectedFreebies",
                    newSelectedFreebies
                  );
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add Attendee Button */}
      <button
        onClick={addAttendee}
        className="w-full py-3 border-2 border-dashed border-foreground/20 rounded-xl text-foreground/60 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add Another Guest
      </button>
    </div>
  );
}