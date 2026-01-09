'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import { UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface GuestFormData {
  name: string;
  contactNumber: string;
  email: string;
}

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGuestModal({
  isOpen,
  onClose,
  onSuccess,
}: AddGuestModalProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    contactNumber: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<GuestFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCustomerName, setCreatedCustomerName] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestFormData> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate contact number
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9+\s()-]{10,}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    // Validate email (optional, but if provided must be valid)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/customers/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactNumber: formData.contactNumber.trim(),
          email: formData.email.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create guest customer');
      }

      // Show success state
      setCreatedCustomerName(formData.name.trim());
      setShowSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error creating guest customer:', error);
      alert(error instanceof Error ? error.message : 'Failed to create guest customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      contactNumber: '',
      email: '',
    });
    setErrors({});
    setShowSuccess(false);
    setCreatedCustomerName('');
    onClose();
  };

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Success View
  if (showSuccess) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Success!"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => {
              handleClose();
              onSuccess();
            }}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        }
      >
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Guest Customer Created!
          </h3>
          <p className="text-foreground/60 mb-4">
            <strong>{createdCustomerName}</strong> has been successfully added to the system.
          </p>
          <div className="text-sm text-foreground/40">
            Redirecting in a moment...
          </div>
        </div>
      </Modal>
    );
  }

  // Form View
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Guest Customer"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <UserPlusIcon className="w-4 h-4" />
                Add Guest
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Guest Customer:</strong> Add walk-in or non-registered customers.
            Only name and contact number are required. Email is optional.
          </p>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Juan Dela Cruz"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-foreground/20 focus:border-primary'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Contact Number Field */}
        <div>
          <label
            htmlFor="contactNumber"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Contact Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
              📱
            </span>
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              placeholder="e.g., 09171234567"
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.contactNumber
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-foreground/20 focus:border-primary'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.contactNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.contactNumber}
            </p>
          )}
        </div>

        {/* Email Field (Optional) */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
            Email Address{' '}
            <span className="text-foreground/40 text-xs font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40">
              ✉️
            </span>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="e.g., juan@example.com"
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-foreground/20 focus:border-primary'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.email}
            </p>
          )}
          {!errors.email && (
            <p className="mt-1 text-xs text-foreground/60">
              Email can be left blank if the customer doesn't have one.
            </p>
          )}
        </div>

        {/* Required Fields Note */}
        <div className="pt-2 border-t border-foreground/10">
          <p className="text-xs text-foreground/60">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </form>
    </Modal>
  );
}