'use client';

import { useState } from 'react';
import { MembershipRegistrationFormData } from '@/types/membership-registration';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface MemberDetailsStepProps {
  formData: MembershipRegistrationFormData;
  onChange: (field: keyof MembershipRegistrationFormData, value: string | boolean | Date) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MemberDetailsStep({
  formData,
  onChange,
  onBack,
  onNext,
}: MemberDetailsStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.contactNumber) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate password
    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Validate agreements
    if (!formData.agreeToTerms || !formData.agreeToHouseRules) {
      alert('You must agree to the terms and conditions and house rules');
      return;
    }

    onNext();
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

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-foreground font-medium hover:bg-foreground/5 rounded-lg transition-colors flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center"
        >
          Continue
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}