"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
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
    paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "FREE" | null;
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
        option: string | null;
      }>;
    }>;
    createdAt: Date;
    data: unknown;
  };
  event: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    memberDiscount?: number | null;
    memberDiscountType?: string | null;
    memberDiscountedPrice?: number | null;
    hasCustomerFreebies: boolean;
  };
  onRefresh: () => void;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  registration,
  event,
  onRefresh,
}: PaymentDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Calculate pricing based on member status
  const isMember = registration.mainGuest.isMember || false;
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

  const pricePerPerson = hasMemberDiscount ? getMemberPrice() : event.price;
  const totalAmount = pricePerPerson * registration.numberOfPax;
  const originalAmount = event.price * registration.numberOfPax;
  const discountAmount = hasMemberDiscount ? originalAmount - totalAmount : 0;

  const handleUpdateStatus = async (newStatus: "COMPLETED" | "FAILED") => {
    if (!registration.payment) return;

    setIsUpdating(true);
    setUpdateError("");

    try {
      const endpoint =
        registration.type === "user"
          ? `/api/admin/payment/${registration.payment.id}`
          : `/api/admin/payment/${registration.payment.id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      onRefresh();
      onClose();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Details"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Close
          </button>
          {registration.payment && registration.payment.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus("FAILED")}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Mark as Failed
              </button>
              <button
                onClick={() => handleUpdateStatus("COMPLETED")}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Approve Payment
              </button>
            </div>
          )}
        </>
      }
    >
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {updateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {updateError}
          </div>
        )}

        {/* Registration Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">
            Registration Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Main Contact:</span>
              <span className="font-medium">{registration.mainGuest.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Email:</span>
              <span className="font-medium">{registration.mainGuest.email}</span>
            </div>
            {registration.mainGuest.phone && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Phone:</span>
                <span className="font-medium">{registration.mainGuest.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-foreground/60">Type:</span>
              <span className="inline-flex items-center gap-1">
                {registration.type === "customer" ? (
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                    GUEST
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded">
                    USER
                  </span>
                )}
                {isMember && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 rounded">
                    MEMBER
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Number of Attendees:</span>
              <span className="font-medium">{registration.numberOfPax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Registered On:</span>
              <span className="font-medium">
                {new Date(registration.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 mb-3">
            Pricing Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Regular Price (per person):</span>
              <span className={hasMemberDiscount ? "line-through text-blue-600" : "font-bold text-blue-900"}>
                ₱{event.price.toFixed(2)}
              </span>
            </div>
            
            {hasMemberDiscount && (
              <>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">
                    Member Discount:
                  </span>
                  <span className="text-green-700 font-bold">
                    {event.memberDiscountType === "PERCENTAGE"
                      ? `-${event.memberDiscount}%`
                      : `-₱${event.memberDiscount?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">
                    Member Price (per person):
                  </span>
                  <span className="text-green-700 font-bold">
                    ₱{pricePerPerson.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-blue-700">Original Total:</span>
                  <span className="line-through text-blue-600">
                    ₱{originalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">You Saved:</span>
                  <span className="text-green-700 font-bold">
                    ₱{discountAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-blue-700 font-bold">Total Amount:</span>
              <span className="text-lg font-bold text-blue-900">
                {event.isFree || totalAmount === 0
                  ? "FREE"
                  : `₱${totalAmount.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {registration.payment && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h3 className="text-sm font-bold text-yellow-900 mb-3">
              Payment Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">Reference Number:</span>
                <span className="font-mono font-medium text-yellow-900">
                  {registration.payment.paymentReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Payment Method:</span>
                <span className="font-medium text-yellow-900">
                  {registration.payment.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Status:</span>
                <span>{getStatusBadge(registration.payment.status)}</span>
              </div>
              {registration.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-yellow-700">Paid At:</span>
                  <span className="font-medium text-yellow-900">
                    {new Date(registration.payment.paidAt).toLocaleString()}
                  </span>
                </div>
              )}
              {registration.payment.notes && (
                <div className="pt-2 border-t border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    <span className="font-medium">Notes:</span>{" "}
                    {registration.payment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendees List */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            All Attendees ({registration.pax.length})
          </h3>
          <div className="space-y-3">
            {registration.pax.map((pax, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{pax.name}</p>
                    <p className="text-xs text-foreground/60">{pax.email}</p>
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>

                {/* Freebies */}
                {pax.freebies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-foreground/60 mb-1">Freebies:</p>
                    <div className="flex flex-wrap gap-1">
                      {pax.freebies.map((fb, fbIndex) => (
                        <div
                          key={fbIndex}
                          className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200"
                        >
                          <span className="font-medium">{fb.freebie.name}</span>
                          {fb.option && (
                            <span className="text-green-900 font-bold">
                              ({fb.option})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function getStatusBadge(status: string) {
  const badges = {
    PENDING: (
      <span className="px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">
        PENDING
      </span>
    ),
    COMPLETED: (
      <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded">
        COMPLETED
      </span>
    ),
    FAILED: (
      <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded">
        FAILED
      </span>
    ),
    REFUNDED: (
      <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-800 rounded">
        REFUNDED
      </span>
    ),
    FREE: (
      <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded">
        FREE
      </span>
    ),
  };

  return badges[status as keyof typeof badges] || status;
}