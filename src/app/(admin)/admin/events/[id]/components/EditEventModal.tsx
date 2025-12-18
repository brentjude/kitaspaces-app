"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import ImageUpload from "@/app/components/ImageUpload";
import type { Event, EventFreebie } from "@/generated/prisma";

interface EventCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  isActive?: boolean;
}

interface EventWithFreebies extends Event {
  freebies: EventFreebie[];
  category?: EventCategory | null;
  registrations?: Array<{ id: string }>; // Add registrations count
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventWithFreebies;
  hasPaidRegistrations: boolean;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  // hasPaidRegistrations is kept for API compatibility but not used

  hasPaidRegistrations: _hasPaidRegistrations,
}: EditEventModalProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: new Date(event.date).toISOString().split("T")[0],
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location || "",
    price: event.price,
    isFree: event.isFree,
    isMemberOnly: event.isMemberOnly,
    isFreeForMembers: event.isFreeForMembers,
    isRedemptionEvent: event.isRedemptionEvent,
    redemptionLimit: event.redemptionLimit || 1,
    maxAttendees: event.maxAttendees || 0,
    imageUrl: event.imageUrl || "",
    categoryId: event.categoryId || "",
  });

  const [freebies, setFreebies] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      quantity: number;
      isNew?: boolean;
    }>
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if event has any participants (registrations)
  const hasParticipants = event.registrations && event.registrations.length > 0;

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/admin/settings/categories");
      const data = await response.json();

      if (data.success && data.data) {
        setCategories(
          data.data.filter((cat: EventCategory) => cat.isActive !== false)
        );
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split("T")[0],
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        price: event.price,
        isFree: event.isFree,
        isMemberOnly: event.isMemberOnly,
        isFreeForMembers: event.isFreeForMembers,
        isRedemptionEvent: event.isRedemptionEvent,
        redemptionLimit: event.redemptionLimit || 1,
        maxAttendees: event.maxAttendees || 0,
        imageUrl: event.imageUrl || "",
        categoryId: event.categoryId || "",
      });

      setFreebies(
        event.freebies.map((freebie) => ({
          id: freebie.id,
          name: freebie.name,
          description: freebie.description || "",
          quantity: freebie.quantity,
          isNew: false,
        }))
      );

      setError("");
    }
  }, [isOpen, event]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
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

    // Auto-update isFree based on price (only if no participants)
    if (name === "price" && !hasParticipants) {
      const priceValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        isFree: priceValue === 0 || isNaN(priceValue),
      }));
    }
  };

  const addFreebie = () => {
    setFreebies([
      ...freebies,
      {
        id: `new-${Math.random().toString(36).substring(2, 9)}`,
        name: "",
        description: "",
        quantity: 1,
        isNew: true,
      },
    ]);
  };

  const removeFreebie = (id: string) => {
    setFreebies(freebies.filter((f) => f.id !== id));
  };

  const updateFreebie = (
    id: string,
    field: "name" | "description" | "quantity",
    value: string | number
  ) => {
    setFreebies(
      freebies.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const getCategoryColor = (color: string | null) => {
    if (!color) return "bg-gray-100 text-gray-800";

    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100 text-blue-800",
      "#10B981": "bg-green-100 text-green-800",
      "#F59E0B": "bg-orange-100 text-orange-800",
      "#EC4899": "bg-pink-100 text-pink-800",
      "#8B5CF6": "bg-purple-100 text-purple-800",
      "#EF4444": "bg-red-100 text-red-800",
      "#6366F1": "bg-indigo-100 text-indigo-800",
      "#6B7280": "bg-gray-100 text-gray-800",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        date: new Date(
          `${formData.date}T${formData.startTime || "00:00"}`
        ).toISOString(),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        location: formData.location || null,
        imageUrl: formData.imageUrl || null,
        categoryId: formData.categoryId || null,
        // Only include these fields if there are no participants
        ...(!hasParticipants && {
          price: parseFloat(formData.price.toString()), // ✅ Convert to number
          isFree: formData.isFree,
          isMemberOnly: formData.isMemberOnly,
          isFreeForMembers: formData.isFreeForMembers,
          isRedemptionEvent: formData.isRedemptionEvent,
          redemptionLimit: formData.isRedemptionEvent
            ? parseInt(formData.redemptionLimit.toString()) // ✅ Convert to number
            : null,
          maxAttendees: formData.maxAttendees
            ? parseInt(formData.maxAttendees.toString()) // ✅ Convert to number
            : null,
          freebies: freebies
            .filter((f) => f.name.trim() !== "")
            .map((f) => ({
              id: f.isNew ? undefined : f.id,
              name: f.name.trim(),
              description: f.description?.trim() || null,
              quantity: parseInt(f.quantity.toString()), // ✅ Convert to number
            })),
        }),
      };

      // Development logging only
      if (process.env.NODE_ENV === "development") {
        console.info("Submitting update data:", updateData);
      }

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || responseData.message || "Failed to update event"
        );
      }

      // Reload page to show updated data
      window.location.reload();
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event"
      size="xl"
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
      >
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

        {/* Warning for Participants */}
        {hasParticipants && (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Limited editing available</p>
                <p>
                  This event has{" "}
                  <span className="font-semibold">
                    {event.registrations?.length || 0} registered participant
                    {event.registrations?.length !== 1 ? "s" : ""}
                  </span>
                  . You can only edit the title, description, date, time,
                  location, and category. Price, event settings, and freebies
                  cannot be modified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cover Photo */}
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          folder="kitaspaces/events"
          label="Cover Photo"
          helpText="PNG, JPG up to 5MB (Recommended: 1200x630px)"
          aspectRatio="16/9"
        />

        {/* Event Title and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., Summer Networking Mixer"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-3.5 text-foreground/40 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                disabled={loadingCategories}
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white disabled:bg-foreground/5 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCategories
                    ? "Loading..."
                    : "Select a category (optional)"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon ? `${category.icon} ` : ""}
                    {category.name}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 absolute right-3 top-3.5 text-foreground/40 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {formData.categoryId &&
              categories.find((c) => c.id === formData.categoryId) && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      categories.find((c) => c.id === formData.categoryId)
                        ?.color || null
                    )}`}
                  >
                    {categories.find((c) => c.id === formData.categoryId)
                      ?.icon && (
                      <span className="mr-1">
                        {
                          categories.find((c) => c.id === formData.categoryId)
                            ?.icon
                        }
                      </span>
                    )}
                    {categories.find((c) => c.id === formData.categoryId)?.name}
                  </span>
                </div>
              )}
          </div>
        </div>

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
                value={formData.date}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
              value={formData.location}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., Main Hall A"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder="Describe your event..."
          />
        </div>

        {/* Price and Settings (Only if no participants) */}
        {!hasParticipants && (
          <>
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
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={formData.isFree}
                      className="w-full rounded-lg border border-foreground/20 pl-8 pr-16 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm disabled:bg-foreground/5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-xs font-medium text-foreground/50">
                        {formData.price === 0 ? "Free" : "PHP"}
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
                    min="0"
                    value={formData.maxAttendees}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col space-y-3 pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isMemberOnly"
                    checked={formData.isMemberOnly}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="ml-3 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Members Only Event
                  </span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isFreeForMembers"
                    checked={formData.isFreeForMembers}
                    onChange={handleInputChange}
                    disabled={formData.price === 0}
                    className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Free for Members (Paid for Non-Members)
                  </span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isRedemptionEvent"
                    checked={formData.isRedemptionEvent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-foreground/30 rounded focus:ring-2 focus:ring-primary/20 transition-all"
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
                      value={formData.redemptionLimit}
                      onChange={handleInputChange}
                      className="w-32 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Freebies Section */}
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
                  <span className="ml-2 text-xs text-foreground/50 font-normal">
                    (per person)
                  </span>
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
                        placeholder="Freebie Name (e.g., Coffee, T-Shirt, Lunch Box)"
                        className="block w-full text-sm font-medium text-foreground placeholder-foreground/40 border-none p-0 focus:ring-0"
                        value={item.name}
                        onChange={(e) =>
                          updateFreebie(item.id, "name", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Options/Description (e.g., Latte, Americano, Cappuccino)"
                        className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg text-xs px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-foreground/40 outline-none transition-all"
                        value={item.description}
                        onChange={(e) =>
                          updateFreebie(item.id, "description", e.target.value)
                        }
                      />
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                        <svg
                          className="w-4 h-4 text-orange-600 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <label className="text-xs font-medium text-orange-800 flex-1">
                          Quantity per person:
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-20 bg-white border border-orange-200 rounded-lg text-xs px-3 py-1.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-foreground outline-none transition-all text-center font-semibold"
                          value={item.quantity}
                          onChange={(e) =>
                            updateFreebie(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                      {formData.maxAttendees > 0 && (
                        <div className="flex items-center gap-2 text-xs text-foreground/50">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Total needed:{" "}
                            {item.quantity * formData.maxAttendees} (for{" "}
                            {formData.maxAttendees} attendees)
                          </span>
                        </div>
                      )}
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
                    <p className="text-xs text-foreground/30 mb-3">
                      Freebies are given to each attendee (e.g., 1 coffee per
                      person)
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
          </>
        )}

        {/* Display locked fields when there are participants */}
        {hasParticipants && (
          <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10">
            <div className="flex items-start gap-3 mb-4">
              <svg
                className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Locked Settings
                </h4>
                <p className="text-sm text-foreground/60 mb-3">
                  These settings cannot be changed because there are registered
                  participants:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-1">
                  Price
                </label>
                <div className="bg-white px-3 py-2 rounded-lg border border-foreground/10 text-sm text-foreground/70">
                  {event.isFree ? "Free" : `₱${event.price.toLocaleString()}`}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-1">
                  Max Attendees
                </label>
                <div className="bg-white px-3 py-2 rounded-lg border border-foreground/10 text-sm text-foreground/70">
                  {event.maxAttendees || "Unlimited"}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {event.isMemberOnly && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Members Only Event</span>
                </div>
              )}
              {event.isFreeForMembers && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free for Members</span>
                </div>
              )}
              {event.isRedemptionEvent && (
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Daily Use Redemption (Limit: {event.redemptionLimit})
                  </span>
                </div>
              )}
            </div>

            {event.freebies.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-2">
                  Included Freebies
                </label>
                <div className="space-y-2">
                  {event.freebies.map((freebie) => (
                    <div
                      key={freebie.id}
                      className="bg-white px-3 py-2 rounded-lg border border-foreground/10 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {freebie.name}
                        </span>
                        <span className="text-xs text-foreground/50">
                          Qty: {freebie.quantity}
                        </span>
                      </div>
                      {freebie.description && (
                        <p className="text-xs text-foreground/60 mt-1">
                          {freebie.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
