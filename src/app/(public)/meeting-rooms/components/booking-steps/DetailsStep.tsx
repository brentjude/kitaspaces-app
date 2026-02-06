"use client";

import { MeetingRoom } from "@/types/database";
import {
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  PresentationChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface GuestDetails {
  company: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  purpose: string;
  numberOfAttendees: number;
}

interface DetailsStepProps {
  room: MeetingRoom;
  durationHours: number;
  bookingDate: string;
  guestDetails: GuestDetails;
  agreedToTerms: boolean;
  onDetailsChange: (details: GuestDetails) => void;
  onTermsChange: (agreed: boolean) => void;
  isLoggedIn: boolean;
}

export default function DetailsStep({
  room,
  durationHours,
  bookingDate,
  guestDetails,
  agreedToTerms,
  onDetailsChange,
  onTermsChange,
  isLoggedIn,
}: DetailsStepProps) {
  const totalAmount = room.hourlyRate * durationHours;

  const handleChange = (field: keyof GuestDetails, value: string | number) => {
    onDetailsChange({ ...guestDetails, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-linear-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
        <h3 className="text-sm font-bold text-foreground/70 mb-3 uppercase tracking-wide">
          Booking Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Room:</span>
            <span className="font-semibold text-foreground">{room.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Date:</span>
            <span className="font-semibold text-foreground">
              {new Date(bookingDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Duration:</span>
            <span className="font-semibold text-foreground">
              {durationHours} hour{durationHours > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-primary/20">
            <span className="text-foreground/80 font-medium">
              Total Amount:
            </span>
            <span className="font-bold text-lg text-primary">
              ₱{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Details Form */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wide">
          Contact Information
        </h3>

        {/* Company Name - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Company/Organization <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={guestDetails.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="Enter company or organization name"
              required
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Contact Name - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={guestDetails.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={isLoggedIn}
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-foreground/5 disabled:cursor-not-allowed placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Designation - Optional */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Designation/Position
          </label>
          <div className="relative">
            <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={guestDetails.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
              placeholder="e.g., Manager, Team Lead (optional)"
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Email - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="email"
              value={guestDetails.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your.email@company.com"
              required
              disabled={isLoggedIn}
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-foreground/5 disabled:cursor-not-allowed placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Mobile Number - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="tel"
              value={guestDetails.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="09XX XXX XXXX"
              required
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Purpose - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Purpose of Booking <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PresentationChartBarIcon className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <textarea
              value={guestDetails.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              placeholder="Please describe the purpose of your booking"
              rows={3}
              required
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-foreground/30"
            />
          </div>
        </div>

        {/* Number of Attendees - Required */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Number of Attendees <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="number"
              min="1"
              max={room.capacity}
              value={guestDetails.numberOfAttendees}
              onChange={(e) =>
                handleChange("numberOfAttendees", parseInt(e.target.value) || 1)
              }
              required
              className="w-full pl-11 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <p className="mt-1.5 text-xs text-foreground/50">
            Max capacity: {room.capacity} people
          </p>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="pt-4 border-t border-foreground/10">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
            required
            className="mt-1 w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
          <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              Terms and Conditions
            </a>{" "}
            and confirm that this booking is final and all details provided are
            accurate. I understand that cancellations or changes may be subject
            to the cancellation policy.
          </span>
        </label>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> A confirmation email will be sent to the
          provided email address. Please ensure all details are correct before
          proceeding.
        </p>
      </div>
    </div>
  );
}
