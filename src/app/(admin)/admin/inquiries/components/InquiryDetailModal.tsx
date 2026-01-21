'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import { format } from 'date-fns';
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  reason: string;
  type: string | null;
  subject: string | null;
  message: string;
  status: string;
  source: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  respondedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
  onUpdateSuccess: () => void;
}

interface Admin {
  id: string;
  name: string;
  email: string;
}

export default function InquiryDetailModal({
  isOpen,
  onClose,
  inquiry,
  onUpdateSuccess,
}: InquiryDetailModalProps) {
  const [status, setStatus] = useState(inquiry.status);
  const [assignedTo, setAssignedTo] = useState(inquiry.assignedTo?.id || '');
  const [response, setResponse] = useState(inquiry.response || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users?role=ADMIN');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedToId: assignedTo || null,
          response: response.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update inquiry');
      }

      alert('Inquiry updated successfully');
      onUpdateSuccess();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert(error instanceof Error ? error.message : 'Failed to update inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete inquiry');
      }

      alert('Inquiry deleted successfully');
      onUpdateSuccess();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return badges[statusValue as keyof typeof badges] || badges.PENDING;
  };

  const getReasonBadge = (reason: string) => {
    const badges = {
      INQUIRY: 'bg-blue-50 text-blue-700',
      FEEDBACK: 'bg-green-50 text-green-700',
      COMPLAINT: 'bg-red-50 text-red-700',
      SUPPORT: 'bg-purple-50 text-purple-700',
      OTHER: 'bg-gray-50 text-gray-700',
    };

    return badges[reason as keyof typeof badges] || badges.OTHER;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inquiry Details" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between pb-4 border-b border-foreground/10">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">
              {inquiry.subject || 'No Subject'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getReasonBadge(inquiry.reason)}`}
              >
                {inquiry.reason}
              </span>
              {inquiry.type && (
                <span className="text-xs text-foreground/60 px-2 py-1 bg-foreground/5 rounded">
                  {inquiry.type.replace('_', ' ')}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(inquiry.status)}`}
              >
                {inquiry.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="text-sm text-foreground/60">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="text-xs mt-1">
              {format(new Date(inquiry.createdAt), 'hh:mm a')}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-foreground/10">
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Contact Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-foreground/40" />
              <span className="font-medium text-foreground">{inquiry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-foreground/40" />
              <a
                href={`mailto:${inquiry.email}`}
                className="text-primary hover:underline"
              >
                {inquiry.email}
              </a>
            </div>
            {inquiry.contactNumber && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-foreground/40" />
                <a
                  href={`tel:${inquiry.contactNumber}`}
                  className="text-primary hover:underline"
                >
                  {inquiry.contactNumber}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <span>Source: {inquiry.source}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Message
          </h4>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </div>

        {/* Status & Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Unassigned</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Response */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Response
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
            placeholder="Enter your response to this inquiry..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          {inquiry.respondedBy && inquiry.respondedAt && (
            <div className="mt-2 text-xs text-foreground/60">
              Previously responded by {inquiry.respondedBy.name} on{' '}
              {format(new Date(inquiry.respondedAt), 'MMM dd, yyyy hh:mm a')}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Inquiry
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-foreground/20 hover:bg-foreground/5 text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Update Inquiry
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}