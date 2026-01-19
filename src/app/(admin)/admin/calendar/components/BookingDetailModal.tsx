'use client';

import Modal from '@/app/components/Modal';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UsersIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface BookingDetails {
  id: string;
  type: 'booking';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  room: {
    id: string;
    name: string;
    capacity: number;
    hourlyRate: number;
    floor?: string | null;
    roomNumber?: string | null;
    amenities?: string | null;
  };
  contactName: string;
  contactEmail?: string | null;
  contactMobile?: string | null;
  company?: string | null;
  designation?: string | null;
  numberOfAttendees: number;
  purpose?: string | null;
  totalAmount: number;
  status: string;
  bookingType: 'user' | 'customer';
  paymentReference?: string | null;
  paymentMethod?: string | null;
}

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: BookingDetails | null;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  details,
}: BookingDetailModalProps) {
  if (!details) return null;

  // Parse amenities JSON string
  const parseAmenities = (amenitiesString: string | null | undefined): string[] => {
    if (!amenitiesString) return [];
    try {
      const parsed = JSON.parse(amenitiesString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const amenities = parseAmenities(details.room.amenities);

  // Format time from 24hr to 12hr format
  const formatTime = (time: string): string => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
      },
      CONFIRMED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      },
      COMPLETED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      },
      NO_SHOW: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {status}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      size="lg"
    >
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{details.room.name} Booking</h3>
            <p className="text-sm text-foreground/60 mt-1">
              Booking ID: {details.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          {getStatusBadge(details.status)}
        </div>

        {/* Booking Type Badge */}
        <div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              details.bookingType === 'user'
                ? 'bg-primary/10 text-primary'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {details.bookingType === 'user' ? 'USER BOOKING' : 'GUEST BOOKING'}
          </span>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-foreground/10">
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <UserIcon className="w-4 h-4 mr-2 text-foreground/40 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">{details.contactName}</p>
                {details.designation && (
                  <p className="text-xs text-foreground/60">{details.designation}</p>
                )}
              </div>
            </div>
            {details.contactEmail && (
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-foreground/40 shrink-0" />
                <p className="text-foreground/80 break-all">{details.contactEmail}</p>
              </div>
            )}
            {details.contactMobile && (
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2 text-foreground/40 shrink-0" />
                <p className="text-foreground/80">{details.contactMobile}</p>
              </div>
            )}
            {details.company && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-foreground/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-foreground/80">{details.company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Schedule */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">
            Booking Schedule
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date:
              </span>
              <span className="font-medium text-blue-900">{formatDate(details.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Time:
              </span>
              <span className="font-medium text-blue-900">
                {formatTime(details.startTime)} - {formatTime(details.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Duration:</span>
              <span className="font-medium text-blue-900">
                {details.duration} {details.duration === 1 ? 'hour' : 'hours'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 flex items-center">
                <UsersIcon className="w-4 h-4 mr-2" />
                Attendees:
              </span>
              <span className="font-medium text-blue-900">
                {details.numberOfAttendees}{' '}
                {details.numberOfAttendees === 1 ? 'person' : 'people'}
              </span>
            </div>
            {details.purpose && (
              <div className="pt-2 border-t border-blue-200">
                <span className="text-blue-700 text-xs font-medium">Purpose:</span>
                <p className="font-medium text-blue-900 mt-1">{details.purpose}</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-gray-50 rounded-lg p-4 border border-foreground/10">
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Room Details
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">Room Name:</span>
              <span className="font-medium text-foreground">{details.room.name}</span>
            </div>
            {details.room.floor && (
              <div className="flex items-center justify-between">
                <span className="text-foreground/60 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Floor:
                </span>
                <span className="font-medium text-foreground">{details.room.floor}</span>
              </div>
            )}
            {details.room.roomNumber && (
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Room Number:</span>
                <span className="font-medium text-foreground">
                  {details.room.roomNumber}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">Capacity:</span>
              <span className="font-medium text-foreground">
                {details.room.capacity || 0} {details.room.capacity === 1 ? 'person' : 'people'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground/60">Hourly Rate:</span>
              <span className="font-medium text-foreground">
                ₱{(details.room.hourlyRate || 0).toLocaleString('en-PH', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="pt-3 border-t border-foreground/10">
                <p className="text-xs text-foreground/60 font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white border border-foreground/20 rounded-md text-xs text-foreground"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <h4 className="text-sm font-bold text-orange-900 mb-3 uppercase tracking-wide flex items-center">
            <BanknotesIcon className="w-4 h-4 mr-2" />
            Payment Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-orange-700">Total Amount:</span>
              <span className="font-bold text-xl text-orange-900">
                ₱{details.totalAmount.toLocaleString('en-PH', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
            {details.paymentMethod && (
              <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                <span className="text-orange-700">Payment Method:</span>
                <span className="font-medium text-orange-900">
                  {details.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            {details.paymentReference && (
              <div className="flex items-center justify-between">
                <span className="text-orange-700">Reference:</span>
                <span className="font-medium text-orange-900 font-mono text-xs">
                  {details.paymentReference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}