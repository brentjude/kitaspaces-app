"use client";

import {
  EyeIcon,
  PencilIcon,
  NoSymbolIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface BookingListActionsProps {
  bookingId: string;
  bookingType: "MEMBER" | "CUSTOMER";
  status: string;
  onView: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function BookingListActions({
  status,
  onView,
  onEdit,
  onCancel,
  onDelete,
}: BookingListActionsProps) {
  const canEdit = status === "PENDING" || status === "CONFIRMED";
  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canDelete = status === "CANCELLED";

  return (
    <div className="flex items-center gap-2">
      {/* View Details */}
      <button
        onClick={onView}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <EyeIcon className="w-5 h-5" />
      </button>

      {/* Edit Booking */}
      {canEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Edit Schedule"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      )}

      {/* Cancel Booking */}
      {canCancel && (
        <button
          onClick={onCancel}
          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Cancel Booking"
        >
          <NoSymbolIcon className="w-5 h-5" />
        </button>
      )}

      {/* Delete Booking */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Booking"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
