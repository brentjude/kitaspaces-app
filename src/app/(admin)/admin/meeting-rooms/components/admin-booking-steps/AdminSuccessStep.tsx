'use client';

import { CheckCircleIcon, EnvelopeIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { MeetingRoom } from '@/types/database';

interface AdminSuccessStepProps {
  room: MeetingRoom;
  bookingDate: string;
  startTime: string;
  endTime: string;
  reference: string;
  contactName: string;
  contactEmail?: string;
  emailSent: boolean;
  onClose: () => void;
}

export default function AdminSuccessStep({
  room,
  bookingDate,
  startTime,
  endTime,
  reference,
  contactName,
  contactEmail,
  emailSent,
  onClose,
}: AdminSuccessStepProps) {
  return (
    <div className="p-8 text-center">
      <div className="mb-6">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Booking Created Successfully!
        </h2>
        <p className="text-foreground/60">
          The meeting room booking has been created for {contactName}
        </p>
      </div>

      <div className="bg-foreground/5 rounded-xl p-6 mb-6 text-left">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-foreground/10">
            <span className="text-sm text-foreground/60">Reference Number</span>
            <span className="font-mono font-bold text-primary">{reference}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-foreground/60">Room</span>
            <span className="font-medium text-foreground">{room.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-foreground/60">Date</span>
            <span className="font-medium text-foreground">
              {new Date(bookingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-foreground/60">Time</span>
            <span className="font-medium text-foreground">
              {startTime} - {endTime}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-foreground/60">Customer</span>
            <span className="font-medium text-foreground">{contactName}</span>
          </div>

          <div className="pt-3 border-t border-foreground/10">
            <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              ⏳ Pending Payment
            </span>
          </div>
        </div>
      </div>

      {/* Email Status */}
      {contactEmail ? (
        emailSent ? (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <EnvelopeIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-green-900">Confirmation Email Sent</p>
              <p className="text-xs text-green-700 mt-1">
                Sent to: {contactEmail}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-red-900">Email Failed</p>
              <p className="text-xs text-red-700 mt-1">
                Could not send to: {contactEmail}
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
          <EnvelopeIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-700">No Email Address Provided</p>
            <p className="text-xs text-gray-600 mt-1">
              Confirmation email was not sent
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-sm"
      >
        Done
      </button>
    </div>
  );
}