'use client';

import { useState } from 'react';
import { MembershipRegistrationFormData } from '@/types/membership-registration';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface MemberDetailsStepProps {
  formData: MembershipRegistrationFormData;
  onChange: (field: keyof MembershipRegistrationFormData, value: string | boolean | Date) => void;
  onBack: () => void;
  onNext: () => void;
}

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

export default function MemberDetailsStep({
  formData,
  onChange,
  onBack,
  onNext,
}: MemberDetailsStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleContinue = async () => {
    setIsValidating(true);
    setValidationErrors([]);
    const errors: ValidationError[] = [];

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        errors.push({ type: 'error', message: 'Full name is required' });
      }

      if (!formData.email?.trim()) {
        errors.push({ type: 'error', message: 'Email address is required' });
      }

      if (!formData.contactNumber?.trim()) {
        errors.push({ type: 'error', message: 'Contact number is required' });
      }

      if (!formData.password?.trim()) {
        errors.push({ type: 'error', message: 'Password is required' });
      }

      // Validate email format
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.push({ type: 'error', message: 'Please enter a valid email address' });
        }
      }

      // Validate password strength
      if (formData.password) {
        if (formData.password.length < 6) {
          errors.push({ type: 'error', message: 'Password must be at least 6 characters long' });
        }
        
        // Optional: Add password strength warnings
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
          errors.push({
            type: 'warning',
            message: 'For stronger security, use a mix of uppercase, lowercase, and numbers'
          });
        }
      }

      // Validate contact number format (Philippine format)
      if (formData.contactNumber) {
        const phoneRegex = /^(\+63|0)?9\d{9}$/;
        if (!phoneRegex.test(formData.contactNumber.replace(/\s|-/g, ''))) {
          errors.push({
            type: 'warning',
            message: 'Contact number should be in Philippine format (e.g., +63 912 345 6789 or 09123456789)'
          });
        }
      }

      // Validate agreements
      if (!formData.agreeToTerms) {
        errors.push({ type: 'error', message: 'You must agree to the Terms and Conditions' });
      }

      if (!formData.agreeToHouseRules) {
        errors.push({ type: 'error', message: 'You must agree to follow the House Rules' });
      }

      // Check if email already exists
      if (formData.email && !errors.some(e => e.message.includes('valid email'))) {
        try {
          const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          });

          const data = await response.json();

          if (data.exists) {
            errors.push({
              type: 'error',
              message: 'This email is already registered. Please use a different email or login to your account.'
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
          // Don't block if email check fails, just add a warning
          errors.push({
            type: 'warning',
            message: 'Unable to verify email availability. Please ensure this email is not already in use.'
          });
        }
      }

      // If there are errors (not just warnings), stop here
      const hasErrors = errors.some(e => e.type === 'error');
      if (hasErrors) {
        setValidationErrors(errors);
        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If only warnings, still show them but allow to continue
      if (errors.length > 0) {
        setValidationErrors(errors);
      }

      // All validations passed, proceed to next step
      onNext();
    } catch (error) {
      console.error('Validation error:', error);
      errors.push({
        type: 'error',
        message: 'An error occurred during validation. Please try again.'
      });
      setValidationErrors(errors);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Your Information
      </h2>
      <p className="text-foreground/60 mb-8">
        Please provide your details to create your membership
      </p>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nickname
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Optional"
                value={formData.nickname || ''}
                onChange={(e) => onChange('nickname', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="juan@example.com"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="+63 912 345 6789"
                value={formData.contactNumber}
                onChange={(e) => onChange('contactNumber', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Birthdate
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.birthdate ? formData.birthdate.toISOString().split('T')[0] : ''}
                onChange={(e) => onChange('birthdate', new Date(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-12 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Minimum 6 characters"
                value={formData.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-foreground/40 hover:text-foreground"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4 pt-6 border-t border-foreground/10">
          <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
            Additional Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Your company name"
              value={formData.company || ''}
              onChange={(e) => onChange('company', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              How did you hear about us?
            </label>
            <select
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
              value={formData.referralSource || ''}
              onChange={(e) => onChange('referralSource', e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="WORD_OF_MOUTH">Word of Mouth</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="ADS">Advertisements</option>
              <option value="GOOGLE_MAPS">Google Maps</option>
              <option value="WEBSITE_BLOGS">Website/Blogs</option>
              <option value="INFLUENCER_CREATOR">Influencer/Creator</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Billing Address
            </label>
            <textarea
              className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows={3}
              placeholder="Enter your billing address"
              value={formData.billingAddress || ''}
              onChange={(e) => onChange('billingAddress', e.target.value)}
            />
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-3 pt-6 border-t border-foreground/10">
          <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
            Agreements
          </h3>

          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => onChange('agreeToTerms', e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-foreground/20 rounded focus:ring-primary"
            />
            <span className="ml-3 text-sm text-foreground">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline" target="_blank">
                Terms and Conditions
              </a>{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>

          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToHouseRules}
              onChange={(e) => onChange('agreeToHouseRules', e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-foreground/20 rounded focus:ring-primary"
            />
            <span className="ml-3 text-sm text-foreground">
              I agree to follow the{' '}
              <a href="/house-rules" className="text-primary hover:underline" target="_blank">
                House Rules
              </a>{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>

          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToNewsletter}
              onChange={(e) => onChange('agreeToNewsletter', e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-foreground/20 rounded focus:ring-primary"
            />
            <span className="ml-3 text-sm text-foreground">
              I want to receive updates, promotions, and newsletters from KITA Spaces
            </span>
          </label>
        </div>
      </div>

      {/* Validation Errors/Warnings */}
      {validationErrors.length > 0 && (
        <div className="mt-6 space-y-3">
          {validationErrors.map((error, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                error.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              {error.type === 'error' ? (
                <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {error.type === 'error' ? 'Error' : 'Warning'}
                </p>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          disabled={isValidating}
          className="px-6 py-3 text-foreground font-medium hover:bg-foreground/5 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={isValidating}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Validating...
            </>
          ) : (
            <>
              Continue
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}