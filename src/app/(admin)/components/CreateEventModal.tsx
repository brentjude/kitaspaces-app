'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/Modal';
import ImageUpload from '@/app/components/ImageUpload';

interface Freebie {
  id: string;
  name: string;
  description?: string;
  quantity: number;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    price: '0',
    isFree: true,
    isMemberOnly: false,
    isFreeForMembers: false,
    isRedemptionEvent: false,
    redemptionLimit: '1',
    maxAttendees: '',
    imageUrl: '',
  });

  const [freebies, setFreebies] = useState<Freebie[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Auto-update isFree based on price
    if (name === 'price') {
      const priceValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        isFree: priceValue === 0 || isNaN(priceValue),
      }));
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  const addFreebie = () => {
    setFreebies([
      ...freebies,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        description: '',
        quantity: 1,
      },
    ]);
  };

  const removeFreebie = (id: string) => {
    setFreebies(freebies.filter((f) => f.id !== id));
  };

  const updateFreebie = (id: string, field: keyof Freebie, value: string | number) => {
    setFreebies(
      freebies.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.date) {
        throw new Error('Please fill in all required fields');
      }

      // Combine date and time
      const eventDateTime = formData.startTime
        ? `${formData.date}T${formData.startTime}`
        : formData.date;

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(eventDateTime).toISOString(),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        location: formData.location || null,
        price: parseFloat(formData.price) || 0,
        isFree: formData.isFree,
        isMemberOnly: formData.isMemberOnly,
        isFreeForMembers: formData.isFreeForMembers,
        isRedemptionEvent: formData.isRedemptionEvent,
        redemptionLimit: formData.isRedemptionEvent ? parseInt(formData.redemptionLimit) || 1 : null,
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
        imageUrl: formData.imageUrl || null,
        freebies: freebies.filter((f) => f.name.trim() !== ''),
      };

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      // Reset form only after successful submission
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        price: '0',
        isFree: true,
        isMemberOnly: false,
        isFreeForMembers: false,
        isRedemptionEvent: false,
        redemptionLimit: '1',
        maxAttendees: '',
        imageUrl: '',
      });
      setFreebies([]);
      setError(null);

      // Dispatch custom event to notify EventsList
      window.dispatchEvent(new Event('eventCreated'));

      // Close modal
      onClose();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Show success message
      console.log('Event created successfully:', data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Don't reset form when closing - preserve user's input
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Event"
      size="xl"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-button px-6 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
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
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 shrink-0"
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
          </div>
        )}

        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="e.g., Summer Networking Mixer"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        {/* Cover Photo */}
        <ImageUpload
          value={formData.imageUrl}
          onChange={handleImageUpload}
          folder="kitaspaces/events"
          label="Cover Photo"
          helpText="PNG, JPG up to 5MB (Recommended: 1200x630px)"
          aspectRatio="16/9"
        />

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-3.5 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="date"
                name="date"
                required
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location
          </label>
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-3.5 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              type="text"
              name="location"
              className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., Main Hall A"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Price and Settings */}
        <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-3.5 h-3.5 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-foreground/20 pl-8 pr-16 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-xs font-medium text-foreground/50">
                    {parseFloat(formData.price) === 0 ? 'Free' : 'PHP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                Max Attendees
              </label>
              <input
                type="number"
                name="maxAttendees"
                min="1"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="Unlimited"
                value={formData.maxAttendees}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col space-y-3 pt-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="isMemberOnly"
                className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all"
                checked={formData.isMemberOnly}
                onChange={handleInputChange}
              />
              <span className="ml-3 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                Members Only Event
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="isFreeForMembers"
                className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all"
                checked={formData.isFreeForMembers}
                onChange={handleInputChange}
                disabled={parseFloat(formData.price) === 0}
              />
              <span className="ml-3 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                Free for Members (Paid for Non-Members)
              </span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="isRedemptionEvent"
                className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all"
                checked={formData.isRedemptionEvent}
                onChange={handleInputChange}
              />
              <span className="ml-3 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                Daily Use Redemption Event
              </span>
            </label>

            {formData.isRedemptionEvent && (
              <div className="ml-7 mt-2">
                <label className="block text-xs font-medium text-foreground/60 mb-1">
                  Redemption Limit per User
                </label>
                <input
                  type="number"
                  name="redemptionLimit"
                  min="1"
                  className="w-32 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.redemptionLimit}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Freebies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex text-sm font-medium text-foreground items-center">
              <svg
                className="w-4 h-4 mr-2 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Included Freebies
            </label>
            <button
              type="button"
              onClick={addFreebie}
              className="text-xs flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Freebie
            </button>
          </div>

          <div className="space-y-3">
            {freebies.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-foreground/10 relative group shadow-sm hover:border-primary/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => removeFreebie(item.id)}
                  className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
                >
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
                </button>

                <div className="space-y-3 pr-8">
                  <input
                    type="text"
                    placeholder="Freebie Name (e.g., Coffee)"
                    className="block w-full text-sm font-medium text-foreground placeholder-foreground/40 border-none p-0 focus:ring-0"
                    value={item.name}
                    onChange={(e) =>
                      updateFreebie(item.id, 'name', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Options (e.g., Cafe Latte, Americano, Cappuccino)"
                    className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg text-xs px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-foreground/40 outline-none transition-all"
                    value={item.description}
                    onChange={(e) =>
                      updateFreebie(item.id, 'description', e.target.value)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-foreground/60">
                      Quantity per person:
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-20 bg-foreground/5 border border-foreground/10 rounded-lg text-xs px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                      value={item.quantity}
                      onChange={(e) =>
                        updateFreebie(
                          item.id,
                          'quantity',
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            {freebies.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-foreground/20 rounded-xl bg-foreground/5">
                <svg
                  className="w-8 h-8 mx-auto text-foreground/20 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-foreground/40 mb-2">
                  No freebies added yet
                </p>
                <button
                  type="button"
                  onClick={addFreebie}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Add your first freebie
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={5}
            required
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder="Describe your event..."
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </Modal>
  );
}