'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, GiftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Event } from '@/types/database';
import FreebieSelector from './FreebieSelector';

interface RedemptionFormProps {
  event: Event & {
    freebies?: Array<{
      id: string;
      name: string;
      description: string | null;
      quantity: number;
    }>;
  };
  currentUser: { name: string; email: string; role: string } | null;
  onCancel: () => void;
}

export default function RedemptionForm({
  event,
  currentUser,
  onCancel,
}: RedemptionFormProps) {
  const router = useRouter();
  const [selectedFreebies, setSelectedFreebies] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFreebieChange = (freebieId: string, option: string) => {
    setSelectedFreebies((prev) => ({
      ...prev,
      [freebieId]: option,
    }));
  };

  const validateSelection = (): boolean => {
    if (!event.freebies || event.freebies.length === 0) {
      setError('No freebies available for this event');
      return false;
    }

    // Check if all freebies with options have been selected
    for (const freebie of event.freebies) {
      if (freebie.description && !selectedFreebies[freebie.id]) {
        setError(`Please select an option for ${freebie.name}`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSelection()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${event.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          freebieSelections: Object.entries(selectedFreebies).map(
            ([freebieId, selectedOption]) => ({
              freebieId,
              selectedOption,
            })
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem');
      }

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/events/${event.slug}?redeemed=true`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Redemption failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Redemption Successful!
        </h2>
        <p className="text-foreground/60">
          Show this confirmation to claim your freebies.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Redeem Event</h1>
          <button
            onClick={onCancel}
            className="text-foreground/60 hover:text-foreground flex items-center text-sm font-medium"
          >
            <XMarkIcon className="w-5 h-5 mr-1" />
            Cancel
          </button>
        </div>

        <p className="text-foreground/60 text-sm">
          {event.title} • {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* User Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-foreground/10 p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground/60 mb-2">
          Redeeming as:
        </h3>
        <p className="font-bold text-foreground">{currentUser?.name}</p>
        <p className="text-sm text-foreground/60">{currentUser?.email}</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="p-6 sm:p-8">
          {event.freebies && event.freebies.length > 0 ? (
            <FreebieSelector
              freebies={event.freebies}
              selectedFreebies={selectedFreebies}
              onFreebieChange={handleFreebieChange}
            />
          ) : (
            <div className="text-center py-8">
              <GiftIcon className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/60">
                No freebies available for this event
              </p>
            </div>
          )}

          {/* Redemption Limit Info */}
          {event.redemptionLimit && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Redemption Limit:</span> You can redeem
                this event up to {event.redemptionLimit} time(s) per day.
              </p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-foreground/5 border-t border-foreground/10 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !event.freebies || event.freebies.length === 0}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Redeem Now'}
          </button>
        </div>
      </div>
    </div>
  );
}