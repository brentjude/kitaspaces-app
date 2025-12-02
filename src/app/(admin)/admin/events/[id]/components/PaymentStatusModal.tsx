'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import type { EventRegistration, User, Payment } from '@/generated/prisma';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: EventRegistration & {
    user: Pick<User, 'id' | 'name' | 'email' | 'isMember'>;
    payment: Payment | null;
  };
  event: {
    id: string;
    price: number;
    isFree: boolean;
  };
}

export default function PaymentStatusModal({
  isOpen,
  onClose,
  registration,
  event,
}: PaymentStatusModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (status: 'COMPLETED' | 'PENDING' | 'FREE') => {
    setIsUpdating(true);
    setError('');

    try {
      const response = await fetch(
        `/api/admin/events/${event.id}/registrations/${registration.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: status }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update payment status');
      }

      // Refresh the page
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update payment status'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = event.isFree || event.price === 0
    ? 'FREE'
    : registration.payment?.status || 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Details"
      size="sm"
      closeOnOverlayClick={!isUpdating}
    >
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-linear-to-tr from-primary/20 to-orange-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {registration.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 min-w-0">
            <p className="font-medium text-foreground truncate">
              {registration.user.name}
            </p>
            <p className="text-sm text-foreground/60 truncate">
              {registration.user.email}
            </p>
          </div>
        </div>

        {/* Amount Due */}
        <div className="flex justify-between items-center text-sm mb-6 pb-4 border-b border-foreground/10">
          <span className="text-foreground/60">Amount Due:</span>
          <span className="font-semibold text-foreground">
            {event.isFree || event.price === 0
              ? 'Free'
              : `₱${event.price.toFixed(2)}`}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Status Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/60 uppercase block mb-3">
            Set Payment Status
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Paid */}
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              disabled={isUpdating || event.isFree || event.price === 0}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentStatus === 'COMPLETED'
                  ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500'
                  : 'bg-white border-foreground/20 text-foreground/60 hover:bg-foreground/5'
              }`}
            >
              <svg className="w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Paid
            </button>

            {/* Pending */}
            <button
              onClick={() => handleUpdateStatus('PENDING')}
              disabled={isUpdating || event.isFree || event.price === 0}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentStatus === 'PENDING'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-2 ring-yellow-500'
                  : 'bg-white border-foreground/20 text-foreground/60 hover:bg-foreground/5'
              }`}
            >
              <svg
                className="w-4 h-4 mb-1 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Pending
            </button>

            {/* Free */}
            <button
              onClick={() => handleUpdateStatus('FREE')}
              disabled={isUpdating}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentStatus === 'FREE' || event.isFree || event.price === 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500'
                  : 'bg-white border-foreground/20 text-foreground/60 hover:bg-foreground/5'
              }`}
            >
              <svg className="w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Free
            </button>
          </div>

          {(event.isFree || event.price === 0) && (
            <p className="text-xs text-foreground/60 mt-3 text-center">
              This is a free event - payment status is automatically set to Free
            </p>
          )}
        </div>

        {/* Payment Info */}
        {registration.payment && (
          <div className="mt-6 pt-6 border-t border-foreground/10">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase mb-3">
              Payment Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Method:</span>
                <span className="font-medium text-foreground">
                  {registration.payment.paymentMethod}
                </span>
              </div>
              {registration.payment.referenceNumber && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Reference:</span>
                  <span className="font-mono text-xs text-foreground">
                    {registration.payment.referenceNumber}
                  </span>
                </div>
              )}
              {registration.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Paid At:</span>
                  <span className="text-foreground">
                    {new Date(registration.payment.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}