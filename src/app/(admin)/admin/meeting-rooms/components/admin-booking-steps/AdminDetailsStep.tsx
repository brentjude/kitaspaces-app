'use client';

import { MeetingRoom } from '@/types/database';
import { AdminBookingFormData } from '../AdminBookingModal';

interface AdminDetailsStepProps {
  room: MeetingRoom;
  durationHours: number;
  bookingDate: string;
  formData: AdminBookingFormData;
  onFormDataChange: (updates: Partial<AdminBookingFormData>) => void;
}

const purposeOptions = [
  { value: 'MEETING', label: 'Business Meeting' },
  { value: 'TRAINING', label: 'Training Session' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'OTHER', label: 'Other' },
];

export default function AdminDetailsStep({
  room,
  durationHours,
  bookingDate,
  formData,
  onFormDataChange,
}: AdminDetailsStepProps) {
  const totalAmount = room.hourlyRate * durationHours;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Booking Details</h3>
        <p className="text-sm text-foreground/60">
          Enter customer/client information
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
          Required Information
        </p>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => onFormDataChange({ contactName: e.target.value })}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Juan Dela Cruz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.contactMobile}
            onChange={(e) => onFormDataChange({ contactMobile: e.target.value })}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="09XX XXX XXXX"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
          Optional Information
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onFormDataChange({ contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="juan@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => onFormDataChange({ company: e.target.value })}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => onFormDataChange({ designation: e.target.value })}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Job Title/Position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Number of Attendees
            </label>
            <input
              type="number"
              min="1"
              max={room.capacity}
              value={formData.numberOfAttendees}
              onChange={(e) => onFormDataChange({ numberOfAttendees: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-foreground/60 mt-1">
              Max capacity: {room.capacity} people
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Purpose
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => onFormDataChange({ purpose: e.target.value })}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFormDataChange({ notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Any special requirements or notes..."
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-foreground/5 rounded-xl border border-foreground/10">
        <h4 className="font-bold text-foreground mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Room:</span>
            <span className="font-medium text-foreground">{room.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Date:</span>
            <span className="font-medium text-foreground">
              {new Date(bookingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Duration:</span>
            <span className="font-medium text-foreground">
              {durationHours === 1 ? '1 hour' : `${durationHours} hours`}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-foreground/10">
            <span className="font-bold text-foreground">Total Amount:</span>
            <span className="font-bold text-primary text-lg">
              ₱{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}