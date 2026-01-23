'use client';

import { useState } from 'react';
import { InquiryReason, InquiryType } from '@/generated/prisma';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import PublicHeader from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface FormData {
  name: string;
  email: string;
  contactNumber: string;
  reason: InquiryReason | '';
  type: InquiryType | '';
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  reason?: string;
  type?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    contactNumber: '',
    reason: '',
    type: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }

    if (formData.reason === 'INQUIRY' && !formData.type) {
      newErrors.type = 'Please select an inquiry type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
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
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/public/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          contactNumber: formData.contactNumber.trim() || undefined,
          reason: formData.reason,
          type: formData.reason === 'INQUIRY' ? formData.type : undefined,
          subject: formData.subject.trim() || undefined,
          message: formData.message.trim(),
          source: 'WEBSITE',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for contacting us! We will get back to you soon.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        contactNumber: '',
        reason: '',
        type: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit inquiry. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear type when reason changes from INQUIRY
    if (name === 'reason' && value !== 'INQUIRY') {
      setFormData((prev) => ({ ...prev, type: '' }));
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600 mt-1">
                        kita Spaces, 3rd Floor<br />
                        Capitol Square, Escario St.<br />
                        Cebu City
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PhoneIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a
                        href="tel:+639173090180"
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        +63 917 309 0180
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a
                        href="mailto:kitaspaces@gmail.com"
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        kitaspaces@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Monday - Sunday<br />
                        9 AM - 11 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map or additional info */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Looking for specific information? Check out our{' '}
                    <a href="/events" className="text-primary hover:underline">
                      Events
                    </a>
                    {' '}or{' '}
                    <a href="/meeting-rooms" className="text-primary hover:underline">
                      Meeting Rooms
                    </a>
                    {' '}pages.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Send us a Message
                </h2>

                {submitStatus && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="+63 XXX XXX XXXX"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Contact <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                        errors.reason ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a reason</option>
                      <option value="INQUIRY">General Inquiry</option>
                      <option value="FEEDBACK">Feedback</option>
                      <option value="COMPLAINT">Complaint</option>
                      <option value="SUPPORT">Support</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                    )}
                  </div>

                  {/* Inquiry Type (only shown when reason is INQUIRY) */}
                  {formData.reason === 'INQUIRY' && (
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                          errors.type ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select inquiry type</option>
                        <option value="EVENT">Events</option>
                        <option value="MEETING_ROOM">Meeting Rooms</option>
                        <option value="MEMBERSHIP">Membership</option>
                        <option value="GENERAL">General</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                      )}
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="Brief subject of your message"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}