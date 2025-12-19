"use client";

import { useState } from "react";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/app/components/Modal";
import FreebieSelector from "@/app/(public)/events/[slug]/registration/components/FreebieSelector";
import PaymentSection from "@/app/(public)/events/[slug]/registration/components/PaymentSection";

interface UserSelect {
  id: string;
  name: string;
  email: string;
  isMember: boolean;
}

interface AddRegistrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    // 🔧 REMOVE: isFreeForMembers
    memberDiscount?: number | null;
    memberDiscountType?: string | null;
    hasCustomerFreebies: boolean;
    freebies?: Array<{
      id: string;
      name: string;
      description: string | null;
      quantity: number;
    }>;
  };
  allUsers: UserSelect[];
  paymentSettings: {
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    qrCodeUrl: string | null;
    qrCodeNumber: string | null;
  } | null;
  onSuccess: () => void;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  selectedFreebies: Record<string, string>;
}

export default function AddRegistrantModal({
  isOpen,
  onClose,
  event,
  allUsers,
  paymentSettings,
  onSuccess,
}: AddRegistrantModalProps) {
  const [registrationType, setRegistrationType] = useState<
    "user" | "guest" | null
  >(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSelect | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: "main",
      name: "",
      email: "",
      selectedFreebies: {},
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<
    "GCASH" | "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "FREE"
  >("CASH");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 🆕 Determine if current registrant is a member
  const isMember = selectedUser?.isMember || false;

  // 🆕 Calculate member discount
  const hasMemberDiscount =
    !event.isFree &&
    event.price > 0 &&
    event.memberDiscount &&
    event.memberDiscount > 0 &&
    isMember;

  const getMemberPrice = () => {
    if (!hasMemberDiscount) return event.price;

    const price = event.price;
    const discount = event.memberDiscount || 0;

    if (event.memberDiscountType === "PERCENTAGE") {
      return price - (price * discount) / 100;
    }
    return Math.max(0, price - discount);
  };

  const pricePerAttendee = hasMemberDiscount ? getMemberPrice() : event.price;
  const isFreeEvent = event.isFree || event.price === 0 || pricePerAttendee === 0;
  const totalAmount = isFreeEvent ? 0 : pricePerAttendee * attendees.length;

  // 🆕 Determine if freebies should be shown
  const canSelectFreebies = event.hasCustomerFreebies || isMember;
  const hasFreebies = event.freebies && event.freebies.length > 0;

  // Filter users for search
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleSelectUser = (user: UserSelect) => {
    setSelectedUser(user);
    setAttendees([
      {
        id: "main",
        name: user.name,
        email: user.email,
        selectedFreebies: {},
      },
    ]);
    setUserSearchTerm("");
  };

  const addAttendee = () => {
    setAttendees([
      ...attendees,
      {
        id: `guest-${Date.now()}`,
        name: "",
        email: "",
        selectedFreebies: {},
      },
    ]);
  };

  const removeAttendee = (id: string) => {
    if (attendees.length <= 1) return;
    setAttendees(attendees.filter((a) => a.id !== id));
  };

  const updateAttendee = (
    id: string,
    field: keyof Attendee,
    value: string | Record<string, string>
  ) => {
    setAttendees(
      attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const updateFreebie = (
    attendeeId: string,
    freebieId: string,
    option: string
  ) => {
    const attendee = attendees.find((a) => a.id === attendeeId);
    if (!attendee) return;

    const updatedFreebies = {
      ...attendee.selectedFreebies,
      [freebieId]: option,
    };

    updateAttendee(attendeeId, "selectedFreebies", updatedFreebies);
  };

  const validateForm = (): boolean => {
    // Check all attendees have name and email
    for (const attendee of attendees) {
      if (!attendee.name.trim() || !attendee.email.trim()) {
        setError("Please fill in all attendee details");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendee.email)) {
        setError(`Invalid email for ${attendee.name}`);
        return false;
      }

      // 🆕 Only validate freebie selections if user is eligible
      if (canSelectFreebies && hasFreebies) {
        for (const freebie of event.freebies!) {
          const hasOptions =
            freebie.description && freebie.description.includes(",");

          if (hasOptions && !attendee.selectedFreebies[freebie.id]) {
            setError(
              `Please select an option for ${freebie.name} for ${attendee.name}`
            );
            return false;
          }
        }
      }
    }

    // Validate payment for non-free events
    if (!isFreeEvent) {
      // Require payment proof for GCASH and BANK_TRANSFER
      if (
        (paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") &&
        !paymentProofUrl
      ) {
        setError("Payment proof is required for online payments");
        return false;
      }

      // Require reference number for online payments
      if (
        (paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") &&
        !referenceNumber
      ) {
        setError("Reference number is required for online payments");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const endpoint =
        registrationType === "user"
          ? `/api/admin/events/${event.id}/register`
          : `/api/admin/events/${event.id}/register/customer`;

      const baseBody = {
        attendees: attendees.map((a) => ({
          name: a.name,
          email: a.email,
          // 🆕 Only include freebie selections if eligible
          freebieSelections:
            canSelectFreebies && hasFreebies
              ? Object.entries(a.selectedFreebies).map(
                  ([freebieId, selectedOption]) => ({
                    freebieId,
                    selectedOption,
                  })
                )
              : [],
        })),
      };

      // Add payment info for non-free events
      const paymentInfo = !isFreeEvent
        ? {
            paymentMethod,
            paymentProofUrl:
              paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER"
                ? paymentProofUrl
                : undefined,
            referenceNumber:
              paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER"
                ? referenceNumber
                : undefined,
          }
        : {};

      const body =
        registrationType === "user"
          ? {
              userId: selectedUser!.id,
              ...baseBody,
              ...paymentInfo,
            }
          : {
              ...baseBody,
              ...paymentInfo,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRegistrationType(null);
    setSelectedUser(null);
    setAttendees([{ id: "main", name: "", email: "", selectedFreebies: {} }]);
    setPaymentMethod("CASH");
    setPaymentProofUrl("");
    setReferenceNumber("");
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Event Attendee"
      size="xl"
      footer={
        registrationType ? (
          <>
            <button
              onClick={() => {
                if (registrationType && !selectedUser) {
                  handleReset();
                } else {
                  onClose();
                }
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50"
            >
              {registrationType && !selectedUser ? "Back" : "Cancel"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !attendees[0].name || !attendees[0].email
              }
              className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )
      }
    >
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Choose Type */}
        {!registrationType && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/60 mb-6">
              Choose how you want to register this attendee:
            </p>

            <button
              onClick={() => setRegistrationType("user")}
              className="w-full p-6 border-2 border-foreground/10 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-all">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">
                    Register Existing User
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Search and select from existing KITA Spaces users
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setRegistrationType("guest")}
              className="w-full p-6 border-2 border-foreground/10 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <UserPlusIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">
                    Register Guest
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Add a new guest customer without an account
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: User Search */}
        {registrationType === "user" && !selectedUser && (
          <div>
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {userSearchTerm ? (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full p-4 border border-foreground/10 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {user.name}
                            </p>
                            {user.isMember && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 rounded">
                                MEMBER
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/60">
                            {user.email}
                          </p>
                          <p className="text-xs text-foreground/40 mt-1">
                            ID: {user.id}
                          </p>
                        </div>
                        <UserPlusIcon className="w-5 h-5 text-primary" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 text-foreground/40">
                    <p className="text-sm">No users found</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-foreground/40">
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Start typing to search users</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Attendee Form (for both user and guest) */}
        {((registrationType === "user" && selectedUser) ||
          registrationType === "guest") && (
          <div className="space-y-6">
            {/* User Info Banner (for user registration) */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Registering:
                    </p>
                    <p className="text-blue-700">
                      {selectedUser.name} ({selectedUser.email})
                    </p>
                    {selectedUser.isMember && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 rounded">
                        MEMBER
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-700">Price per person</p>
                    <div className="space-y-1">
                      {hasMemberDiscount ? (
                        <>
                          <p className="text-xs text-blue-600 line-through">
                            ₱{event.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                            <p className="text-lg font-bold text-green-700">
                              ₱{pricePerAttendee.toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            Member discount applied
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-blue-900">
                          {isFreeEvent ? "FREE" : `₱${event.price.toFixed(2)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🆕 Member Benefits Applied Banner */}
            {isMember && hasMemberDiscount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900 mb-1">
                      Member Discount Applied
                    </p>
                    <p className="text-xs text-green-700">
                      This member receives{" "}
                      {event.memberDiscountType === "PERCENTAGE"
                        ? `${event.memberDiscount}%`
                        : `₱${event.memberDiscount?.toFixed(2)}`}{" "}
                      off the regular price.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <div>
                        <span className="text-green-600">Regular:</span>{" "}
                        <span className="line-through">
                          ₱{event.price.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600">Member Price:</span>{" "}
                        <span className="font-bold text-green-800">
                          ₱{pricePerAttendee.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🆕 Freebies Not Available Notice (for guest customers when freebies are member-only) */}
            {registrationType === "guest" &&
              hasFreebies &&
              !event.hasCustomerFreebies && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-900 mb-1">
                        Freebies Not Available for Guest Customers
                      </p>
                      <p className="text-xs text-yellow-800">
                        This event includes member-exclusive perks. Guest
                        customers will not receive freebies. Only registered
                        KITA members can access these benefits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Attendees */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Attendee Details
              </h3>
              {attendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="bg-foreground/5 rounded-lg p-4 border border-foreground/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-foreground flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-primary" />
                      {index === 0 ? "Primary Attendee" : `Guest ${index}`}
                    </h4>
                    {index > 0 && (
                      <button
                        onClick={() => removeAttendee(attendee.id)}
                        className="text-red-500 hover:text-red-700 flex items-center text-xs font-medium"
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground/60 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) =>
                          updateAttendee(attendee.id, "name", e.target.value)
                        }
                        placeholder="Full Name"
                        className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        disabled={index === 0 && !!selectedUser}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground/60 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={attendee.email}
                        onChange={(e) =>
                          updateAttendee(attendee.id, "email", e.target.value)
                        }
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        disabled={index === 0 && !!selectedUser}
                      />
                    </div>
                  </div>

                  {/* 🆕 Freebies - Only show if eligible */}
                  {canSelectFreebies && hasFreebies && (
                    <FreebieSelector
                      freebies={event.freebies!}
                      selectedFreebies={attendee.selectedFreebies}
                      onFreebieChange={(freebieId, option) =>
                        updateFreebie(attendee.id, freebieId, option)
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Add Guest Button */}
            <button
              onClick={addAttendee}
              className="w-full py-2.5 border-2 border-dashed border-foreground/20 rounded-lg text-foreground/60 text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add Another Guest
            </button>

            {/* Payment Section (only for paid events) */}
            {!isFreeEvent && (
              <div className="border-t border-foreground/10 pt-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4">
                  Payment Details
                </h3>
                <PaymentSection
                  paymentMethod={paymentMethod}
                  paymentProofUrl={paymentProofUrl}
                  referenceNumber={referenceNumber}
                  paymentSettings={paymentSettings}
                  onPaymentMethodChange={setPaymentMethod}
                  onPaymentProofChange={setPaymentProofUrl}
                  onReferenceNumberChange={setReferenceNumber}
                />
              </div>
            )}

            {/* Summary */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-orange-700">Total Attendees</p>
                  <p className="text-lg font-bold text-orange-900">
                    {attendees.length}{" "}
                    {attendees.length === 1 ? "person" : "people"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-700">Total Amount</p>
                  {hasMemberDiscount && !isFreeEvent ? (
                    <div className="space-y-1">
                      <p className="text-sm text-orange-600 line-through">
                        ₱{(event.price * attendees.length).toFixed(2)}
                      </p>
                      <p className="text-2xl font-bold text-green-700 flex items-center gap-1">
                        <ShieldCheckIcon className="w-5 h-5" />₱
                        {totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Member discount
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-orange-900">
                      {isFreeEvent ? "FREE" : `₱${totalAmount.toFixed(2)}`}
                    </p>
                  )}
                </div>
              </div>
              {!isFreeEvent && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs text-orange-700">Payment Method</p>
                  <p className="font-medium text-orange-900">
                    {paymentMethod === "GCASH"
                      ? "GCash"
                      : paymentMethod === "BANK_TRANSFER"
                      ? "Bank Transfer"
                      : paymentMethod === "CASH"
                      ? "Cash"
                      : "Credit Card"}
                  </p>
                </div>
              )}
            </div>

            {/* Admin Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <span className="font-bold">Admin Note:</span> Payment status
                will be marked as{" "}
                <span className="font-bold">
                  {isFreeEvent ? "COMPLETED" : "PENDING"}
                </span>{" "}
                {isFreeEvent
                  ? "automatically for free events."
                  : "and will require verification in the payment management section."}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}