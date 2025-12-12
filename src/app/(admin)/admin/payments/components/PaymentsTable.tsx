'use client';

import { PaymentRecord } from '@/types/payment';
import {
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PaymentStatus, PaymentMethod } from '@/generated/prisma';

interface PaymentsTableProps {
  payments: PaymentRecord[];
  onViewDetails: (record: PaymentRecord) => void;
}

export default function PaymentsTable({
  payments,
  onViewDetails,
}: PaymentsTableProps) {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <CreditCardIcon className="w-4 h-4 text-purple-500" />;
      case 'BANK_TRANSFER':
        return <BanknotesIcon className="w-4 h-4 text-green-600" />;
      case 'GCASH':
        return <QrCodeIcon className="w-4 h-4 text-blue-500" />;
      case 'CASH':
        return <BuildingStorefrontIcon className="w-4 h-4 text-gray-600" />;
      default:
        return <span className="text-foreground/40 text-xs">-</span>;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Credit Card';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'GCASH':
        return 'GCash';
      case 'CASH':
        return 'Cash';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/10">
          <thead className="bg-foreground/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Date & ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-foreground/10">
            {payments.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-foreground/5 transition-colors cursor-pointer"
                onClick={() => onViewDetails(record)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-foreground/60 font-mono mt-0.5">
                    {record.id.substring(0, 10)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                      {record.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {record.userName}
                      </div>
                      <div className="text-xs text-foreground/60">
                        {record.userEmail || 'No email'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {record.description}
                  </div>
                  <div className="text-xs text-foreground/60 inline-flex items-center mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        record.recordType === 'MEMBERSHIP'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                      }`}
                    ></span>
                    {record.recordType === 'MEMBERSHIP' ? 'Membership' : 'Event'}
                    {record.numberOfPax && ` (${record.numberOfPax} pax)`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-foreground">
                    ₱{record.amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-foreground">
                    <span className="mr-2">{getMethodIcon(record.method)}</span>
                    {getMethodLabel(record.method)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(record.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-primary hover:text-primary/80 p-1 transition-colors"
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(record);
                    }}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-foreground/60 text-sm"
                >
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}