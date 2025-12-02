'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/app/components/Modal';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventTitle: string;
  eventId: string;
}

interface EventPax {
  id: string;
  name: string;
  email: string;
}

interface EventRegistration {
  id: string;
  userId: string;
  numberOfPax: number;
  pax: EventPax[];
}

interface EventFreebie {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
}

interface EventDetailsResponse {
  id: string;
  title: string;
  registrations: EventRegistration[];
  freebies: EventFreebie[];
}

export default function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  eventId,
}: DeleteEventModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventStats, setEventStats] = useState<{
    registrations: number;
    pax: number;
    freebies: number;
  } | null>(null);

  const isConfirmValid = confirmText.toLowerCase() === 'delete';

  // Fetch event statistics when modal opens
  const fetchEventStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event details');
      
      const data = await response.json();
      if (data.success && data.data) {
        const event = data.data as EventDetailsResponse;
        const paxCount = event.registrations.reduce(
          (sum: number, reg: EventRegistration) => sum + (reg.pax?.length || 0),
          0
        );
        
        setEventStats({
          registrations: event.registrations.length,
          pax: paxCount,
          freebies: event.freebies.length,
        });
      }
    } catch (err) {
      console.error('Error fetching event stats:', err);
      setError('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEventStats();
    }
  }, [isOpen, eventId, fetchEventStats]);

  const handleConfirm = async () => {
    if (!isConfirmValid) {
      setError('Please type "delete" to confirm');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setError('');
      setEventStats(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Event"
      size="md"
      closeOnOverlayClick={!isDeleting}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting || isLoading}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Event
              </>
            )}
          </button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {!isLoading && eventStats && (
          <>
            {/* Warning Icon */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center space-y-2">
              <h4 className="text-lg font-semibold text-foreground">
                Are you absolutely sure?
              </h4>
              <p className="text-sm text-foreground/70">
                You are about to delete the event:
              </p>
              <p className="text-base font-medium text-foreground bg-foreground/5 px-4 py-2 rounded-lg break-words">
                {eventTitle}
              </p>
            </div>

            {/* Event Statistics */}
            {(eventStats.registrations > 0 || eventStats.pax > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-orange-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      This event has active registrations
                    </p>
                    <div className="space-y-1 text-sm text-orange-700">
                      {eventStats.registrations > 0 && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>
                            <strong>{eventStats.registrations}</strong>{' '}
                            {eventStats.registrations === 1 ? 'registration' : 'registrations'}
                          </span>
                        </div>
                      )}
                      {eventStats.pax > 0 && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>
                            <strong>{eventStats.pax}</strong>{' '}
                            {eventStats.pax === 1 ? 'attendee' : 'attendees'} (pax)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Critical Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1 space-y-2 text-left">
                  <p className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-red-700">
                    The following data will be permanently deleted:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Event information and settings</li>
                    {eventStats.registrations > 0 && (
                      <li>
                        <strong>{eventStats.registrations}</strong> registration
                        {eventStats.registrations !== 1 ? 's' : ''}
                      </li>
                    )}
                    {eventStats.pax > 0 && (
                      <li>
                        <strong>{eventStats.pax}</strong> attendee record
                        {eventStats.pax !== 1 ? 's' : ''} (pax data)
                      </li>
                    )}
                    {eventStats.freebies > 0 && (
                      <li>
                        <strong>{eventStats.freebies}</strong> freebie item
                        {eventStats.freebies !== 1 ? 's' : ''} and all selections
                      </li>
                    )}
                    <li>All daily use redemptions for this event</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="text-left">
              <label className="block text-sm font-medium text-foreground mb-2">
                Type <span className="font-bold text-red-600">delete</span> to
                confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError('');
                }}
                placeholder="Type 'delete' here"
                className={`w-full rounded-lg border px-4 py-2.5 text-foreground focus:ring-2 outline-none transition-all ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-foreground/20 focus:border-red-500 focus:ring-red-200'
                }`}
                disabled={isDeleting}
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            {/* Additional Info */}
            {eventStats.registrations === 0 && (
              <div className="bg-foreground/5 rounded-lg p-4 text-sm text-foreground/70 text-left overflow-hidden">
                <p className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="wrap-break-word">
                    No registrations found. It&apos;s safe to delete this event without
                    affecting any users.
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}