'use client';

import { MeetingRoom } from '@/types/database';
import { 
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  ReceiptPercentIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface SuccessStepProps {
  room: MeetingRoom;
  bookingDate: string;
  startTime: string;
  endTime: string;
  reference: string;
  onClose: () => void;
}

export default function SuccessStep({
  room,
  bookingDate,
  startTime,
  endTime,
  reference,
  onClose,
}: SuccessStepProps) {
  return (
    <div className="p-12 text-center animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
        <CheckCircleIcon className="w-12 h-12" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
      <p className="text-foreground/60 mb-6">
        You have successfully booked <strong>{room.name}</strong>
      </p>

      {/* Booking Details Card */}
      <div className="bg-foreground/5 rounded-xl p-6 mb-6 text-left">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <ReceiptPercentIcon className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground/60 mb-1">Reference Number</p>
              <p className="font-mono font-bold text-foreground">{reference}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground/60 mb-1">Date</p>
              <p className="font-semibold text-foreground">
                {new Date(bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-foreground/60 mb-1">Time</p>
              <p className="font-semibold text-foreground">
                {startTime} - {endTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Confirmation */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4" />
          Confirmation Email Sent
        </h3>
        <p className="text-sm text-blue-800">
          A confirmation email with all booking details has been sent to your email address. Please check your inbox.
        </p>
      </div>


      <button
        onClick={onClose}
        className="w-full px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
      >
        Done
      </button>
    </div>
  );
}