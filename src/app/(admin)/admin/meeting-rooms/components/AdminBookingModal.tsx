'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import AdminCustomerSelectionStep from './admin-booking-steps/AdminCustomerSelectionStep';
import AdminRoomStep from './admin-booking-steps/AdminRoomStep';
import AdminDateStep from './admin-booking-steps/AdminDateStep';
import AdminTimeStep from './admin-booking-steps/AdminTimeStep';
import AdminDetailsStep from './admin-booking-steps/AdminDetailsStep';
import AdminSuccessStep from './admin-booking-steps/AdminSuccessStep';
import { MeetingRoom } from '@/types/database';
import { 
  ChevronLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface AdminBookingModalProps {
  rooms: MeetingRoom[];
  onClose: () => void;
  onSuccess: () => void;
}

export interface AdminBookingFormData {
  bookingType: 'CUSTOMER' | 'MEMBER' | 'GUEST' | '';
  customerId: string;
  memberId: string;
  selectedRoomId: string;
  bookingDate: string;
  startTimeSlot: string;
  durationHours: number;
  contactName: string;
  contactMobile: string;
  contactEmail: string;
  company: string;
  designation: string;
  numberOfAttendees: number;
  purpose: string;
  notes: string;
}

// ✅ Add proper types for customer and member
interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  contactNumber: string | null;
  company: string | null;
}

interface MemberData {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  company: string | null;
}

export default function AdminBookingModal({ 
  rooms,
  onClose, 
  onSuccess 
}: AdminBookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [formData, setFormData] = useState<AdminBookingFormData>({
    bookingType: '',
    customerId: '',
    memberId: '',
    selectedRoomId: '',
    bookingDate: '',
    startTimeSlot: '',
    durationHours: 1,
    contactName: '',
    contactMobile: '',
    contactEmail: '',
    company: '',
    designation: '',
    numberOfAttendees: 1,
    purpose: 'MEETING',
    notes: '',
  });

  const selectedRoom = rooms.find(r => r.id === formData.selectedRoomId);

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => (prev + 1) as typeof step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const canProceedFromStep = (): boolean => {
    switch (step) {
      case 1:
        if (formData.bookingType === 'CUSTOMER') {
          return formData.customerId !== '';
        } else if (formData.bookingType === 'MEMBER') {
          return formData.memberId !== '';
        } else if (formData.bookingType === 'GUEST') {
          return true;
        }
        return false;
      case 2:
        return formData.selectedRoomId !== '';
      case 3:
        return formData.bookingDate !== '';
      case 4:
        return formData.startTimeSlot !== '' && formData.durationHours > 0;
      case 5:
        return (
          formData.contactName.trim() !== '' &&
          formData.contactMobile.trim() !== ''
        );
      default:
        return true;
    }
  };

  const calculateEndTime = (startTime: string, durationHours: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedFromStep() || !selectedRoom) return;

    setIsSubmitting(true);

    try {
      const endTime = calculateEndTime(formData.startTimeSlot, formData.durationHours);
      const totalAmount = selectedRoom.hourlyRate * formData.durationHours;

      const bookingData = {
        bookingType: formData.bookingType,
        customerId: formData.customerId || undefined,
        memberId: formData.memberId || undefined,
        roomId: formData.selectedRoomId,
        bookingDate: formData.bookingDate,
        startTime: formData.startTimeSlot,
        endTime,
        duration: formData.durationHours,
        contactName: formData.contactName.trim(),
        contactMobile: formData.contactMobile.trim(),
        contactEmail: formData.contactEmail.trim() || undefined,
        company: formData.company.trim() || undefined,
        designation: formData.designation.trim() || undefined,
        numberOfAttendees: formData.numberOfAttendees,
        purpose: formData.purpose,
        totalAmount,
        paymentMethod: 'CASH',
        notes: formData.notes.trim() || undefined,
      };

      const response = await fetch('/api/admin/meeting-rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create booking');
      }

      setBookingReference(result.data.paymentReference || '');
      setEmailSent(result.data.emailSent || false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    onSuccess();
    onClose();
  };

  // ✅ Updated with proper type
  const handleCustomerSelect = (customerId: string, customer: CustomerData) => {
    setFormData({
      ...formData,
      customerId,
      contactName: customer.name,
      contactEmail: customer.email || '',
      contactMobile: customer.contactNumber || '',
      company: customer.company || '',
    });
  };

  // ✅ Updated with proper type
  const handleMemberSelect = (memberId: string, member: MemberData) => {
    setFormData({
      ...formData,
      memberId,
      contactName: member.name,
      contactEmail: member.email || '',
      contactMobile: member.contactNumber || '',
      company: member.company || '',
    });
  };

  const renderStepContent = () => {
    if (showSuccess && selectedRoom) {
      return (
        <AdminSuccessStep
          room={selectedRoom}
          bookingDate={formData.bookingDate}
          startTime={formData.startTimeSlot}
          endTime={calculateEndTime(formData.startTimeSlot, formData.durationHours)}
          reference={bookingReference}
          contactName={formData.contactName}
          contactEmail={formData.contactEmail}
          emailSent={emailSent}
          onClose={handleSuccessClose}
        />
      );
    }

    switch (step) {
      case 1:
        return (
          <AdminCustomerSelectionStep
            selectedType={formData.bookingType}
            selectedCustomerId={formData.customerId}
            selectedMemberId={formData.memberId}
            onTypeChange={(type) => setFormData({ ...formData, bookingType: type, customerId: '', memberId: '' })}
            onCustomerSelect={handleCustomerSelect}
            onMemberSelect={handleMemberSelect}
          />
        );
      case 2:
        return (
          <AdminRoomStep
            rooms={rooms}
            selectedRoomId={formData.selectedRoomId}
            onRoomChange={(roomId) => setFormData({ ...formData, selectedRoomId: roomId })}
          />
        );
      case 3:
        return (
          <AdminDateStep
            selectedDate={formData.bookingDate}
            onDateChange={(date) => setFormData({ ...formData, bookingDate: date })}
          />
        );
      case 4:
        if (!selectedRoom) return null;
        return (
          <AdminTimeStep
            room={selectedRoom}
            selectedDate={formData.bookingDate}
            startTimeSlot={formData.startTimeSlot}
            durationHours={formData.durationHours}
            onTimeChange={(startTime, duration) => 
              setFormData({ 
                ...formData, 
                startTimeSlot: startTime,
                durationHours: duration 
              })
            }
          />
        );
      case 5:
        if (!selectedRoom) return null;
        return (
          <AdminDetailsStep
            room={selectedRoom}
            durationHours={formData.durationHours}
            bookingDate={formData.bookingDate}
            formData={formData}
            onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
          />
        );
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {renderStepContent()}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Book Meeting Room"
      size="lg"
      closeOnOverlayClick={false}
      footer={
        <>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium flex items-center"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
            </button>
          )}
          
          <div className="flex-1" />

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromStep()}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next Step <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceedFromStep() || isSubmitting}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          )}
        </>
      }
    >
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-1 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= i ? 'flex-1 bg-primary' : 'w-8 bg-foreground/20'
              }`}
            />
          ))}
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-900 font-medium">
            📌 <strong>Admin Booking:</strong> This booking will be created as PENDING. 
            Confirmation email will be sent only if email address is provided.
          </p>
        </div>

        {renderStepContent()}
      </div>
    </Modal>
  );
}