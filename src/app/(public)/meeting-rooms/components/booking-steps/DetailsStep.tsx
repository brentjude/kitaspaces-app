'use client';

import { MeetingRoom } from '@/types/database';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface DetailsStepProps {
  room: MeetingRoom;
  selectedSlots: number[];
  bookingDate: string;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
    company: string;
    purpose: string;
  };
  onDetailsChange: (details: DetailsStepProps['guestDetails']) => void;
}

export default function DetailsStep({
  room,
  selectedSlots,
  bookingDate,
  guestDetails,
  onDetailsChange,
}: DetailsStepProps) {
  const handleChange = (field: keyof typeof guestDetails, value: string) => {
    onDetailsChange({
      ...guestDetails,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h4 className="text-lg font-bold text-foreground">Guest Information</h4>

      <div>
        <label className="block text-xs font-semibold text-foreground/60 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            required
            className="w-full rounded-lg border border-foreground/20 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Jane Doe"
            value={guestDetails.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground/60 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
          <input
            type="email"
            required
            className="w-full rounded-lg border border-foreground/20 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="jane@example.com"
            value={guestDetails.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/60 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
            <input
              type="tel"
              required
              className="w-full rounded-lg border border-foreground/20 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="+63 912 345 6789"
              value={guestDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/60 mb-1">
            Company (Optional)
          </label>
          <div className="relative">
            <BuildingOfficeIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              className="w-full rounded-lg border border-foreground/20 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Company Ltd"
              value={guestDetails.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground/60 mb-1">
          Purpose of Booking (Optional)
        </label>
        <div className="relative">
          <DocumentTextIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
          <textarea
            className="w-full rounded-lg border border-foreground/20 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="e.g. Team meeting, Client presentation..."
            rows={3}
            value={guestDetails.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mt-6">
        <h5 className="font-semibold text-foreground mb-3">Booking Summary</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Room</span>
            <span className="font-bold text-foreground">{room.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Date</span>
            <span className="font-bold text-foreground">
              {new Date(bookingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Time</span>
            <span className="font-bold text-foreground">
              {String(Math.min(...selectedSlots)).padStart(2, '0')}:00 -{' '}
              {String(Math.max(...selectedSlots) + 1).padStart(2, '0')}:00
            </span>
          </div>
          <div className="border-t border-orange-200 my-2"></div>
          <div className="flex justify-between text-lg">
            <span className="font-bold text-foreground/70">Total</span>
            <span className="font-bold text-primary">
              ₱{(selectedSlots.length * room.hourlyRate).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}