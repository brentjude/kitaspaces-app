'use client';

import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CreateAccountPromptProps {
  email: string;
  name: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAccountPrompt({
  email,
  name,
  onClose,
  onSuccess,
}: CreateAccountPromptProps) {
  const [formData, setFormData] = useState({
    name,
    email,
    password: '',
    confirmPassword: '',
    contactNumber: '',
    agreeToNewsletter: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to create account
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //     contactNumber: formData.contactNumber || undefined,
      //     agreeToNewsletter: formData.agreeToNewsletter,
      //     referralSource: 'EVENT_REGISTRATION',
      //   }),
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.error || 'Failed to create account');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Wait a bit to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Account Created!</h3>
          <p className="text-foreground/60 mb-4">
            Welcome to KITA Spaces! You can now sign in with your new account.
          </p>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full my-8 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Create Your Account</h3>
            <p className="text-sm text-foreground/60 mt-1">
              Join KITA Spaces and unlock exclusive benefits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Server Error */}
          {errors.submit && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
              {errors.submit}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.name ? 'border-red-300' : 'border-foreground/20'
              } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
              placeholder="Juan Dela Cruz"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email (prefilled, read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground/60 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-foreground/40">
              Using the email from your registration
            </p>
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-foreground mb-1">
              Contact Number (Optional)
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="+63 912 345 6789"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                  errors.password ? 'border-red-300' : 'border-foreground/20'
                } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                placeholder="At least 8 characters"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-foreground/20'
                } focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                placeholder="Re-enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Newsletter Checkbox */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="agreeToNewsletter"
              name="agreeToNewsletter"
              checked={formData.agreeToNewsletter}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary/20 border-foreground/20 rounded cursor-pointer"
              disabled={isLoading}
            />
            <label htmlFor="agreeToNewsletter" className="text-sm text-foreground/70 cursor-pointer">
              I want to receive updates about events, promotions, and news from KITA Spaces
            </label>
          </div>

          {/* Benefits List */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm font-semibold text-foreground mb-2">Account Benefits:</p>
            <ul className="space-y-1 text-xs text-foreground/70">
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Track all your event registrations
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Access member-only events and discounts
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Manage bookings and memberships
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Get personalized recommendations
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-foreground/20 text-foreground font-medium rounded-lg hover:bg-foreground/5 transition-colors"
              disabled={isLoading}
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}