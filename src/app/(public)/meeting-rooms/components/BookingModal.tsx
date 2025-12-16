'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import DateStep from './booking-steps/DateStep';
import TimeStep from './booking-steps/TimeStep';
import DetailsStep from './booking-steps/DetailsStep';
import SuccessStep from './booking-steps/SuccessStep';
import { MeetingRoom, BookingStatus } from '@/types/database';
import { 
  ChevronLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface BookingModalProps {
  room: MeetingRoom;
  currentUser?: {
    name?: string | null;
    email?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export type BookingFormData = {
  bookingDate: string;
  selectedSlots: number[];
  guestDetails: {
    name: string;
    email: string;
    phone: string;
    company: string;
    purpose: string;
  };
};

export default function BookingModal({ room, currentUser, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const [formData, setFormData] = useState<BookingFormData>({
    bookingDate: '',
    selectedSlots: [],
    guestDetails: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      company: '',
      purpose: '',
    },
  });

  // Update guest details if user logs in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        guestDetails: {
          ...prev.guestDetails,
          name: currentUser.name || '',
          email: currentUser.email || '',
        },
      }));
    }
  }, [currentUser]);

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as typeof step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const canProceedFromStep = () => {
    switch (step) {
      case 1:
        return formData.bookingDate !== '';
      case 2:
        return formData.selectedSlots.length > 0;
      case 3:
        return (
          formData.guestDetails.name &&
          formData.guestDetails.email &&
          formData.guestDetails.phone
        );
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedFromStep()) return;

    setIsSubmitting(true);

    try {
      const startTime = `${String(Math.min(...formData.selectedSlots)).padStart(2, '0')}:00`;
      const endTime = `${String(Math.max(...formData.selectedSlots) + 1).padStart(2, '0')}:00`;
      const duration = formData.selectedSlots.length;
      const totalAmount = room.hourlyRate * duration;

      const bookingData = {
        roomId: room.id,
        bookingDate: formData.bookingDate,
        startTime,
        endTime,
        duration,
        numberOfAttendees: 1,
        purpose: formData.guestDetails.purpose,
        contactPerson: formData.guestDetails.name,
        contactEmail: formData.guestDetails.email,
        contactPhone: formData.guestDetails.phone,
        company: formData.guestDetails.company,
        status: 'PENDING' as BookingStatus,
        totalAmount,
        paymentMethod: 'CASH', // Automatic cash payment
      };

      const response = await fetch('/api/public/meeting-rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create booking');
      }

      setBookingReference(result.data.paymentReference || '');
      setShowSuccess(true);
      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <SuccessStep
          room={room}
          bookingDate={formData.bookingDate}
          startTime={`${String(Math.min(...formData.selectedSlots)).padStart(2, '0')}:00`}
          endTime={`${String(Math.max(...formData.selectedSlots) + 1).padStart(2, '0')}:00`}
          reference={bookingReference}
          onClose={onClose}
        />
      );
    }

    switch (step) {
      case 1:
        return (
          <DateStep
            selectedDate={formData.bookingDate}
            onDateChange={(date) => setFormData({ ...formData, bookingDate: date })}
          />
        );
      case 2:
        return (
          <TimeStep
            room={room}
            selectedSlots={formData.selectedSlots}
            selectedDate={formData.bookingDate}
            onSlotsChange={(slots) => setFormData({ ...formData, selectedSlots: slots })}
          />
        );
      case 3:
        return (
          <DetailsStep
            room={room}
            selectedSlots={formData.selectedSlots}
            bookingDate={formData.bookingDate}
            guestDetails={formData.guestDetails}
            onDetailsChange={(details) => setFormData({ ...formData, guestDetails: details })}
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
      title={`Book ${room.name}`}
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

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromStep()}
              className="px-6 py-2 bg-foreground hover:bg-foreground/90 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </>
      }
    >
      <form className="p-6">
        {/* Progress Indicator - Now only 3 steps */}
        <div className="flex items-center space-x-1 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= i ? 'flex-1 bg-primary' : 'w-8 bg-foreground/20'
              }`}
            />
          ))}
        </div>

        {renderStepContent()}
      </form>
    </Modal>
  );
}