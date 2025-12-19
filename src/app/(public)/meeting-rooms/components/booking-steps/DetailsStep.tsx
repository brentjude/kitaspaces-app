'use client';

import { MeetingRoom } from '@/types/database';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface DetailsStepProps {
  room: MeetingRoom;
  durationHours: number;
  bookingDate: string;
  guestDetails: {
    company: string;
    name: string;
    designation: string;
    email: string;
    mobile: string;
    purpose: string;
    numberOfAttendees: number;
  };
  onDetailsChange: (details: DetailsStepProps['guestDetails']) => void;
  isLoggedIn: boolean;
}

// Purpose options for dropdown
const PURPOSE_OPTIONS = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'TRAINING', label: 'Training Session' },
  { value: 'INTERVIEW', label: 'Job Interview' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'BRAINSTORMING', label: 'Brainstorming Session' },
  { value: 'CLIENT_MEETING', label: 'Client Meeting' },
  { value: 'TEAM_MEETING', label: 'Team Meeting' },
  { value: 'OTHER', label: 'Other' },
];

export default function DetailsStep({
  room,
  durationHours,
  bookingDate,
  guestDetails,
  onDetailsChange,
  isLoggedIn,
}: DetailsStepProps) {
  const handleInputChange = (field: keyof typeof guestDetails, value: string | number) => {
    onDetailsChange({
      ...guestDetails,
      [field]: value,
    });
  };

  const totalAmount = room.hourlyRate * durationHours;

  const formatDuration = (hours: number): string => {
    if (hours === 1) return '1 hour';
    if (hours % 1 === 0) return `${hours} hours`;
    return `${Math.floor(hours)} hour${Math.floor(hours) > 1 ? 's' : ''} 30 mins`;
  };

  // 🆕 Generate attendee options based on room capacity
  const getAttendeeOptions = (): number[] => {
    const options: number[] = [];
    for (let i = 1; i <= room.capacity; i++) {
      options.push(i);
    }
    return options;
  };

  return (
    <div className="relative space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Booking Details</h3>
        <p className="text-sm text-foreground/60">
          Please provide your contact information
        </p>
      </div>

      {/* Two Column Form Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" />
              Company
            </div>
          </label>
          <input
            type="text"
            value={guestDetails.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Your company name"
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4" />
              Designation
            </div>
          </label>
          <input
            type="text"
            value={guestDetails.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            placeholder="Job title or position"
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>

        {/* Name - Full Width on Mobile */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name <span className="text-red-500">*</span>
            </div>
          </label>
          <input
            type="text"
            value={guestDetails.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Your full name"
            required
            disabled={isLoggedIn}
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-foreground/5 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              Email Address <span className="text-red-500">*</span>
            </div>
          </label>
          <input
            type="email"
            value={guestDetails.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
            disabled={isLoggedIn}
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-foreground/5 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Mobile Number <span className="text-red-500">*</span>
            </div>
          </label>
          <input
            type="tel"
            value={guestDetails.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            placeholder="+63 912 345 6789"
            required
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>

        {/* Purpose Dropdown */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Purpose <span className="text-red-500">*</span>
            </div>
          </label>
          <select
            value={guestDetails.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            required
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
          >
            <option value="">Select purpose</option>
            {PURPOSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 🆕 Number of Attendees - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Number of Attendees <span className="text-red-500">*</span>
            </div>
          </label>
          <select
            value={guestDetails.numberOfAttendees}
            onChange={(e) => handleInputChange('numberOfAttendees', parseInt(e.target.value))}
            required
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
          >
            {getAttendeeOptions().map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'person' : 'people'}
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Room capacity: {room.capacity} people
          </p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-linear-to-br from-primary/5 to-orange-50 rounded-xl p-4 border border-primary/20 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Booking Summary
        </h4>
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
            <span className="font-medium text-foreground">{formatDuration(durationHours)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Attendees:</span>
            <span className="font-medium text-foreground">
              {guestDetails.numberOfAttendees} {guestDetails.numberOfAttendees === 1 ? 'person' : 'people'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Hourly Rate:</span>
            <span className="font-medium text-foreground">₱{room.hourlyRate.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
            <span className="font-bold text-foreground">Total Amount:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">₱{totalAmount.toFixed(2)}</div>
              <div className="text-xs text-foreground/50">
                {durationHours} × ₱{room.hourlyRate.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            <span className="font-semibold">Note:</span> Your booking will be confirmed once payment is received. 
            You will receive a confirmation email with payment instructions.
          </span>
        </p>
      </div>

      {/* 🆕 Static Scroll Down Indicator */}
      <div className="flex justify-center pt-2">
        <div className="animate-bounce bg-primary/10 rounded-full p-2 shadow-sm">
          <ChevronDownIcon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}