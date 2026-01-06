'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  password: string;
  company: string;
  contactNumber: string;
  birthdate: string;
  referralSource: string;
  agreeToNewsletter: boolean;
}

interface AdminMemberDetailsStepProps {
  formData: FormData;
  onNext: (data: FormData) => void;
}

const referralSources = [
  { value: 'WORD_OF_MOUTH', label: 'Word of Mouth' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'ADS', label: 'Advertisements' },
  { value: 'GOOGLE_MAPS', label: 'Google Maps' },
  { value: 'WEBSITE_BLOGS', label: 'Website/Blogs' },
  { value: 'INFLUENCER_CREATOR', label: 'Influencer/Creator' },
  { value: 'OTHER', label: 'Other' },
];

export default function AdminMemberDetailsStep({
  formData,
  onNext,
}: AdminMemberDetailsStepProps) {
  const [localData, setLocalData] = useState<FormData>(formData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setLocalData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!localData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!localData.password) {
      newErrors.password = 'Password is required';
    } else if (localData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!localData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(localData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={localData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500' : 'border-foreground/20'
            }`}
            placeholder="Juan Dela Cruz"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={localData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-red-500' : 'border-foreground/20'
            }`}
            placeholder="juan@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={localData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password ? 'border-red-500' : 'border-foreground/20'
              }`}
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-foreground/40 hover:text-foreground"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={localData.contactNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.contactNumber ? 'border-red-500' : 'border-foreground/20'
            }`}
            placeholder="09XX XXX XXXX"
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Company (Optional)
          </label>
          <input
            type="text"
            name="company"
            value={localData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Company Name"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Birthdate (Optional)
          </label>
          <input
            type="date"
            name="birthdate"
            value={localData.birthdate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Referral Source */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            How did you hear about us? (Optional)
          </label>
          <select
            name="referralSource"
            value={localData.referralSource}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select an option</option>
            {referralSources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToNewsletter"
              checked={localData.agreeToNewsletter}
              onChange={handleChange}
              className="w-4 h-4 text-primary focus:ring-primary border-foreground/20 rounded"
            />
            <span className="text-sm text-foreground">
              I want to receive newsletters and updates
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Next: Select Plan
        </button>
      </div>
    </form>
  );
}