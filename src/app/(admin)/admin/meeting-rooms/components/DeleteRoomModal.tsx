'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import { MeetingRoom } from '@/types/database';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  room: MeetingRoom;
}

export default function DeleteRoomModal({ isOpen, onClose, onSuccess, room }: DeleteRoomModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/meeting-rooms/${room.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete room');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Meeting Room"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Room'}
          </button>
        </>
      }
    >
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Are you sure?
            </h3>
            <p className="text-sm text-foreground/70 mb-4">
              This will permanently delete the meeting room <strong>"{room.name}"</strong>.
              This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Warning: Any existing bookings for this room will also be affected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}