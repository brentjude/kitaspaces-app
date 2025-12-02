'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import ImageUpload from '@/app/components/ImageUpload';
import type { Event } from '@/generated/prisma';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  hasPaidRegistrations: boolean;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  hasPaidRegistrations,
}: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: new Date(event.date).toISOString().split('T')[0],
    startTime: event.startTime || '',
    endTime: event.endTime || '',
    location: event.location || '',
    price: event.price,
    isFree: event.isFree,
    isMemberOnly: event.isMemberOnly,
    isFreeForMembers: event.isFreeForMembers,
    isRedemptionEvent: event.isRedemptionEvent,
    redemptionLimit: event.redemptionLimit || 1,
    maxAttendees: event.maxAttendees || 0,
    imageUrl: event.imageUrl || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        price: event.price,
        isFree: event.isFree,
        isMemberOnly: event.isMemberOnly,
        isFreeForMembers: event.isFreeForMembers,
        isRedemptionEvent: event.isRedemptionEvent,
        redemptionLimit: event.redemptionLimit || 1,
        maxAttendees: event.maxAttendees || 0,
        imageUrl: event.imageUrl || '',
      });
      setError('');
    }
  }, [isOpen, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update event');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Warning for Paid Registrations */}
        {hasPaidRegistrations && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
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
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Limited editing available</p>
                <p>
                  This event has paid registrations. You can only edit the title,
                  description, date, time, and location. Price and freebies cannot
                  be modified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload */}
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          folder="kitaspaces/events"
          label="Event Cover Image"
        />

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Enter event title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            placeholder="Describe your event..."
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Event venue"
          />
        </div>

        {/* Price (disabled if has paid registrations) */}
        {!hasPaidRegistrations && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                disabled={formData.isFree}
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-foreground/5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Attendees
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxAttendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttendees: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="0 = unlimited"
              />
            </div>
          </div>
        )}

        {/* Checkboxes (disabled if has paid registrations for price-related ones) */}
        {!hasPaidRegistrations && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) =>
                  setFormData({ ...formData, isFree: e.target.checked })
                }
                className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
              />
              <span className="text-sm text-foreground">
                This is a free event
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMemberOnly}
                onChange={(e) =>
                  setFormData({ ...formData, isMemberOnly: e.target.checked })
                }
                className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
              />
              <span className="text-sm text-foreground">
                Members only event
              </span>
            </label>

            {!formData.isFree && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFreeForMembers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isFreeForMembers: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
                />
                <span className="text-sm text-foreground">
                  Free for members (paid for non-members)
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRedemptionEvent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isRedemptionEvent: e.target.checked,
                  })
                }
                className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
              />
              <span className="text-sm text-foreground">
                Daily use redemption event
              </span>
            </label>

            {formData.isRedemptionEvent && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Redemption Limit per User
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.redemptionLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      redemptionLimit: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-32 rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}