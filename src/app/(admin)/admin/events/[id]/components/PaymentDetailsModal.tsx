"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GiftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { Payment, CustomerPayment } from "@/generated/prisma";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: {
    id: string;
    type: "user" | "customer";
    mainGuest: {
      name: string;
      email: string | null;
      phone?: string | null;
      isMember?: boolean;
    };
    numberOfPax: number;
    paymentStatus: "FREE" | "PENDING" | "COMPLETED" | "FAILED" | null;
    payment: Payment | CustomerPayment | null;
    pax: Array<{
      name: string;
      email: string | null;
      freebies: Array<{
        freebie: {
          id: string;
          name: string;
          description: string | null;
        };
        quantity: number;
      }>;
    }>;
  };
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    freebies: Array<{
      id: string;
      name: string;
      description: string | null;
    }>;
  };
  onRefresh?: () => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  registration,
  event,
  onRefresh,
}: PaymentDetailsModalProps) {
  const { mainGuest, payment, numberOfPax, pax, type } = registration;
  const totalAmount = event.isFree ? 0 : event.price * numberOfPax;

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    payment?.status || "PENDING"
  );
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter out the main guest from additional guests if they have the same email
  const additionalGuests = pax.filter((guest) => {
    if (!mainGuest.email || !guest.email) return true;
    return guest.email.toLowerCase() !== mainGuest.email.toLowerCase();
  });

  const getStatusIcon = () => {
    if (event.isFree) {
      return <CheckCircleIcon className="w-8 h-8 text-blue-500" />;
    }
    if (!payment) {
      return <ClockIcon className="w-8 h-8 text-yellow-500 animate-pulse" />;
    }
    switch (payment.status) {
      case "COMPLETED":
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case "FAILED":
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
      case "REFUNDED":
        return <XCircleIcon className="w-8 h-8 text-orange-500" />;
      default:
        return <ClockIcon className="w-8 h-8 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    if (event.isFree) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          Free Event
        </span>
      );
    }
    if (!payment) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
          No Payment Record
        </span>
      );
    }

    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Payment Completed",
      },
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Payment Pending",
      },
      FAILED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Payment Failed",
      },
      REFUNDED: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Payment Refunded",
      },
    };

    const config = statusConfig[payment.status] || statusConfig.PENDING;

    return (
      <span
        className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-semibold`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      GCASH: "💳",
      BANK_TRANSFER: "🏦",
      CASH: "💵",
      CREDIT_CARD: "💳",
      FREE_MEMBERSHIP: "🎁",
      OTHER: "💰",
    };
    return icons[method] || "💰";
  };

  const handleUpdateStatus = async () => {
    if (!payment) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/payment/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          type: type,
          notes: statusNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      alert(`Payment status updated to ${selectedStatus}`);
      setIsEditingStatus(false);
      setStatusNotes("");

      // Refresh the parent component data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingStatus(false);
    setSelectedStatus(payment?.status || "PENDING");
    setStatusNotes("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="lg">
      <div className="p-6 space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="text-sm text-foreground/60 mb-1">
                Registration Status
              </div>
              {isEditingStatus && payment ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    title="Save"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="p-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                    title="Cancel"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  {payment && !event.isFree && (
                    <button
                      onClick={() => setIsEditingStatus(true)}
                      className="p-1 text-primary hover:bg-primary/10 rounded"
                      title="Edit Status"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {isEditingStatus && (
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes (optional)"
                  className="mt-2 w-full px-3 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              )}
            </div>
          </div>
          {type === "customer" && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Walk-in Guest
            </span>
          )}
        </div>

        {/* Main Guest Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60">
            <UserIcon className="w-4 h-4" />
            Main Guest (Payer)
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {mainGuest.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  {mainGuest.name}
                  {mainGuest.isMember && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-orange-200 text-orange-800 rounded">
                      MEMBER
                    </span>
                  )}
                </div>
                <div className="text-sm text-foreground/60">
                  {mainGuest.email || mainGuest.phone || "No contact provided"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Guests (excluding main guest if duplicate) */}
        {additionalGuests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60">
              <UsersIcon className="w-4 h-4" />
              Additional Guests ({additionalGuests.length})
            </div>
            <div className="space-y-2">
              {additionalGuests.map((guest, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {guest.name}
                        </div>
                        {guest.email && (
                          <div className="text-xs text-foreground/60">
                            {guest.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guest Freebies */}
                    {guest.freebies.length > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        {guest.freebies.map((fb, fbIdx) => (
                          <div
                            key={fbIdx}
                            className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <GiftIcon className="w-3 h-3" />
                            {fb.freebie.name}
                            {fb.quantity > 1 && ` x${fb.quantity}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Information */}
        {!event.isFree && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/60">
              <CreditCardIcon className="w-4 h-4" />
              Payment Information
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              {payment ? (
                <>
                  {/* Payment Method */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">
                      Payment Method
                    </span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <span className="text-lg">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </span>
                      {payment.paymentMethod.replace("_", " ")}
                    </span>
                  </div>

                  {/* Payment Reference (System Generated) */}
                  {payment.paymentReference && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">
                        System Reference
                      </span>
                      <span className="text-sm font-mono font-semibold text-foreground">
                        {payment.paymentReference}
                      </span>
                    </div>
                  )}

                  {/* User Reference Number */}
                  {payment.referenceNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">
                        User Reference
                      </span>
                      <span className="text-sm font-mono font-semibold text-primary">
                        {payment.referenceNumber}
                      </span>
                    </div>
                  )}

                  {/* Payment Date */}
                  {payment.paidAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">
                        Payment Date
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(payment.paidAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {/* Payment Proof */}
                  {payment.proofImageUrl && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-foreground/60 mb-2 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4" />
                        Payment Proof
                      </div>
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                        <Image
                          src={payment.proofImageUrl}
                          alt="Payment Proof"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <a
                        href={payment.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-primary hover:underline inline-block"
                      >
                        View full image →
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  {payment.notes && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-foreground/60 mb-1">
                        Notes
                      </div>
                      <p className="text-sm text-foreground bg-white p-2 rounded border border-gray-200">
                        {payment.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-sm text-foreground/60">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 text-yellow-500 animate-pulse" />
                  <p>Awaiting payment submission</p>
                  <p className="text-xs mt-1">
                    Guest needs to complete payment
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total Amount Summary */}
        <div className="p-4 bg-linear-to-br from-primary/10 to-orange-50 rounded-xl border-2 border-primary/20">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Number of Guests</span>
              <span className="font-semibold text-foreground">
                {numberOfPax} {numberOfPax === 1 ? "person" : "people"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Price per Person</span>
              <span className="font-semibold text-foreground">
                {event.isFree ? "Free" : `₱${event.price.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t-2 border-primary/20 flex items-center justify-between">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                {event.isFree ? "Free" : `₱${totalAmount.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
