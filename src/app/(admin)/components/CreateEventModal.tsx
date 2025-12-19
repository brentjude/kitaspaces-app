"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import ImageUpload from "@/app/components/ImageUpload";

interface Freebie {
  id: string;
  name: string;
  description?: string;
  quantity: number;
}

interface EventCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  isActive?: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    price: "0",
    isFree: false, // ✅ Changed from true to false so price input works
    isMemberOnly: false,
    isRedemptionEvent: false,
    redemptionLimit: "1",
    maxAttendees: "",
    imageUrl: "",
    categoryId: "",
    memberDiscount: "0",
    memberDiscountType: "FIXED" as "FIXED" | "PERCENTAGE",
    hasCustomerFreebies: true,
  });

  const [freebies, setFreebies] = useState<Freebie[]>([]);

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
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

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

    // Auto-update isFree based on price
    if (name === "price") {
      const priceValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        isFree: priceValue === 0 || isNaN(priceValue) || value === "",
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
        name: "",
        description: "",
        quantity: 1,
      },
    ]);
  };

  const removeFreebie = (id: string) => {
    setFreebies(freebies.filter((f) => f.id !== id));
  };

  const updateFreebie = (
    id: string,
    field: keyof Freebie,
    value: string | number
  ) => {
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
        throw new Error("Please fill in all required fields");
      }

      // Combine date and time
      const eventDateTime = formData.startTime
        ? `${formData.date}T${formData.startTime}`
        : formData.date;

      const originalPrice = parseFloat(formData.price) || 0;
      const memberDiscount = parseFloat(formData.memberDiscount) || 0;

      // Calculate member discounted price
      let memberDiscountedPrice: number | null = null;
      if (
        !formData.isFree &&
        !formData.isFreeForMembers &&
        memberDiscount > 0 &&
        originalPrice > 0
      ) {
        if (formData.memberDiscountType === "PERCENTAGE") {
          memberDiscountedPrice =
            originalPrice - (originalPrice * memberDiscount) / 100;
        } else {
          memberDiscountedPrice = originalPrice - memberDiscount;
        }
        memberDiscountedPrice = Math.max(0, memberDiscountedPrice);
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(eventDateTime).toISOString(),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        location: formData.location || null,
        price: originalPrice,
        isFree: formData.isFree,
        isMemberOnly: formData.isMemberOnly,
        isFreeForMembers: formData.isFreeForMembers,
        categoryId: formData.categoryId || null,
        isRedemptionEvent: formData.isRedemptionEvent,
        redemptionLimit: formData.isRedemptionEvent
          ? parseInt(formData.redemptionLimit) || 1
          : null,
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
        imageUrl: formData.imageUrl || null,
        memberDiscount: memberDiscount > 0 ? memberDiscount : null,
        memberDiscountType:
          memberDiscount > 0 ? formData.memberDiscountType : null,
        memberDiscountedPrice,
        hasCustomerFreebies: formData.hasCustomerFreebies,
        freebies: freebies
          .filter((f) => f.name.trim() !== "")
          .map((f) => ({
            name: f.name,
            description: f.description || null,
            quantity: f.quantity,
          })),
      };

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details ||
            data.error ||
            `HTTP ${response.status}: Failed to create event`
        );
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        price: "0",
        isFree: true,
        isMemberOnly: false,
        isFreeForMembers: false,
        isRedemptionEvent: false,
        redemptionLimit: "1",
        maxAttendees: "",
        imageUrl: "",
        categoryId: "",
        memberDiscount: "0",
        memberDiscountType: "FIXED",
        hasCustomerFreebies: true,
      });
      setFreebies([]);
      setError(null);

      // Dispatch custom event
      window.dispatchEvent(new Event("eventCreated"));
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error submitting event:", err);
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
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
              "Create Event"
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

        {/* Cover Photo */}
        <ImageUpload
          value={formData.imageUrl}
          onChange={handleImageUpload}
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
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g., Summer Networking Mixer"
              value={formData.title}
              onChange={handleInputChange}
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

        {/* Price and Settings */}
        <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                Price (PHP)
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
                  className="w-full rounded-lg border border-foreground/20 pl-8 pr-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  // ❌ REMOVE: disabled={formData.isFree}
                />
                {formData.isFree && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                      FREE
                    </span>
                  </div>
                )}
              </div>
              {parseFloat(formData.price) === 0 && (
                <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  This event is free to attend
                </p>
              )}
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

          {/* 🆕 NEW: Member Discount Section */}
          {parseFloat(formData.price) > 0 && (
            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                Member Discount (Optional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="memberDiscountType"
                    value={formData.memberDiscountType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="FIXED">Fixed Amount (₱)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    name="memberDiscount"
                    min="0"
                    max={
                      formData.memberDiscountType === "PERCENTAGE"
                        ? "100"
                        : undefined
                    }
                    step={
                      formData.memberDiscountType === "PERCENTAGE"
                        ? "1"
                        : "0.01"
                    }
                    value={formData.memberDiscount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1">
                    Member Price
                  </label>
                  <div className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700">
                    {(() => {
                      const price = parseFloat(formData.price) || 0;
                      const discount =
                        parseFloat(formData.memberDiscount) || 0;
                      if (discount === 0) return `₱${price.toFixed(2)}`;

                      let memberPrice = price;
                      if (formData.memberDiscountType === "PERCENTAGE") {
                        memberPrice = price - (price * discount) / 100;
                      } else {
                        memberPrice = price - discount;
                      }
                      return `₱${Math.max(0, memberPrice).toFixed(2)}`;
                    })()}
                  </div>
                </div>
              </div>

              {parseFloat(formData.memberDiscount) > 0 && (
                <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  KITA Members will save{" "}
                  {formData.memberDiscountType === "PERCENTAGE"
                    ? `${formData.memberDiscount}%`
                    : `₱${formData.memberDiscount}`}{" "}
                  on this event
                </p>
              )}
            </div>
          )}

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
              Event Freebies
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
                  {formData.maxAttendees && (
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
                        {item.quantity * parseInt(formData.maxAttendees)} (for{" "}
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

          {/* 🆕 NEW: Customer Freebies Toggle */}
          {freebies.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hasCustomerFreebies"
                  name="hasCustomerFreebies"
                  checked={formData.hasCustomerFreebies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasCustomerFreebies: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 text-primary border-foreground/30 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="hasCustomerFreebies" className="flex-1">
                  <span className="block text-sm font-semibold text-foreground mb-1">
                    Allow Walk-in Customers to Receive Freebies
                  </span>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    When enabled, both registered members and walk-in customers
                    will receive event freebies. When disabled, only registered
                    members with accounts will receive freebies.
                  </p>
                </label>
              </div>

              {!formData.hasCustomerFreebies && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-800">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Walk-in customers will not receive freebies for this event
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}