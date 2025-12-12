'use client';

import { useState } from 'react';
import { PaymentRecord } from '@/types/payment';
import { PaymentStatus } from '@/generated/prisma';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  BuildingStorefrontIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface PaymentDetailsModalProps {
  payment: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (paymentId: string, status: PaymentStatus, notes?: string) => Promise<void>;
}

export default function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
  onStatusUpdate,
}: PaymentDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !payment) return null;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === payment.status) {
      alert('Please select a different status');
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(payment.id, selectedStatus, notes || undefined);
      setSelectedStatus('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'REFUNDED':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <CreditCardIcon className="w-5 h-5 text-purple-500" />;
      case 'BANK_TRANSFER':
        return <BanknotesIcon className="w-5 h-5 text-green-600" />;
      case 'GCASH':
        return <QrCodeIcon className="w-5 h-5 text-blue-500" />;
      case 'CASH':
        return <BuildingStorefrontIcon className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-foreground/10">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Payment Details
              </h3>
              <p className="text-sm text-foreground/60 mt-1">
                Transaction ID: {payment.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Status and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-foreground/5 rounded-lg p-4">
                <p className="text-xs text-foreground/60 font-semibold uppercase mb-2">
                  Status
                </p>
                <div className="flex items-center">
                  {getStatusIcon(payment.status)}
                  <span className="ml-2 text-lg font-semibold text-foreground capitalize">
                    {payment.status.toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-xs text-foreground/60 font-semibold uppercase mb-2">
                  Amount
                </p>
                <p className="text-2xl font-bold text-primary">
                  ₱{payment.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-foreground/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase">
                Customer Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <UserIcon className="w-4 h-4 text-foreground/60 mr-2" />
                  <span className="text-foreground">{payment.userName}</span>
                  <span className="ml-2 px-2 py-0.5 bg-foreground/10 rounded text-xs">
                    {payment.type === 'USER' ? 'Member' : 'Guest'}
                  </span>
                </div>
                {payment.userEmail && (
                  <div className="flex items-center text-sm">
                    <EnvelopeIcon className="w-4 h-4 text-foreground/60 mr-2" />
                    <span className="text-foreground">{payment.userEmail}</span>
                  </div>
                )}
                {payment.userPhone && (
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="w-4 h-4 text-foreground/60 mr-2" />
                    <span className="text-foreground">{payment.userPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-foreground/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase">
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Description</p>
                  <p className="text-sm text-foreground font-medium">
                    {payment.description}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1">
                    {payment.recordType === 'MEMBERSHIP' ? 'Membership' : 'Event'}
                    {payment.numberOfPax && ` (${payment.numberOfPax} pax)`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Payment Method</p>
                  <div className="flex items-center text-sm text-foreground font-medium">
                    {getMethodIcon(payment.method)}
                    <span className="ml-2">
                      {payment.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Date Created</p>
                  <div className="flex items-center text-sm text-foreground">
                    <CalendarIcon className="w-4 h-4 mr-2 text-foreground/60" />
                    {new Date(payment.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {payment.paidAt && (
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">Date Paid</p>
                    <div className="flex items-center text-sm text-foreground">
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600" />
                      {new Date(payment.paidAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reference Numbers */}
            {(payment.paymentReference || payment.referenceNumber) && (
              <div className="bg-foreground/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase">
                  Reference Numbers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payment.paymentReference && (
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">
                        Payment Reference
                      </p>
                      <p className="text-sm font-mono text-foreground font-medium">
                        {payment.paymentReference}
                      </p>
                    </div>
                  )}
                  {payment.referenceNumber && (
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">
                        Transaction Reference
                      </p>
                      <p className="text-sm font-mono text-foreground font-medium">
                        {payment.referenceNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Proof */}
            {payment.proofImageUrl && (
              <div className="bg-foreground/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 uppercase">
                  Payment Proof
                </h4>
                <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border border-foreground/10">
                  <Image
                    src={payment.proofImageUrl}
                    alt="Payment Proof"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="bg-foreground/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 uppercase flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Notes
                </h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {payment.notes}
                </p>
              </div>
            )}

            {/* Update Status Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase">
                Update Payment Status
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    New Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus)}
                    disabled={isUpdating}
                  >
                    <option value="">Select status...</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    rows={3}
                    placeholder="Add notes about this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isUpdating}
                  />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || isUpdating}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}