"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface EventActionsMenuProps {
  eventId: string;
  eventTitle: string;
}

export default function EventActionsMenu({
  eventId,
  eventTitle,
}: EventActionsMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleView = () => {
    router.push(`/admin/events/${eventId}`);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete event");
      }

      // Trigger event list refresh
      window.dispatchEvent(new Event("eventDeleted"));

      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete event. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setIsOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-foreground/10 z-50">
          <div className="py-1">
            {!showDeleteConfirm ? (
              <>
                <button
                  onClick={handleView}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-3 text-foreground/60" />
                  View Details
                </button>

                <div className="border-t border-foreground/10 my-1" />

                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-3" />
                  Delete Event
                </button>
              </>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Delete "{eventTitle}"?
                </p>
                <p className="text-xs text-foreground/60 mb-4">
                  This action cannot be undone. The event will only be deleted
                  if there are no registrations.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-2 text-xs font-medium text-foreground bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 mr-1"
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
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
