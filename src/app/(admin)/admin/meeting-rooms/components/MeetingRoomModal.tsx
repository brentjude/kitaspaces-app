"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import ImageUpload from "@/app/components/ImageUpload";
import {
  MeetingRoom,
  MeetingRoomCreateInput,
  MeetingRoomUpdateInput,
} from "@/types/database";
import {
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MeetingRoom | null;
}

export default function MeetingRoomModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: MeetingRoomModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 4,
    hourlyRate: 0,
    coverPhotoUrl: "",
    amenities: "",
    startTime: "09:00",
    endTime: "18:00",
    floor: "",
    roomNumber: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      const amenities = initialData.amenities
        ? JSON.parse(initialData.amenities).join(", ")
        : "";

      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        capacity: initialData.capacity,
        hourlyRate: initialData.hourlyRate,
        coverPhotoUrl: initialData.coverPhotoUrl || "",
        amenities,
        startTime: initialData.startTime || "09:00",
        endTime: initialData.endTime || "18:00",
        floor: initialData.floor || "",
        roomNumber: initialData.roomNumber || "",
        notes: initialData.notes || "",
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        capacity: 4,
        hourlyRate: 0,
        coverPhotoUrl: "",
        amenities: "",
        startTime: "09:00",
        endTime: "18:00",
        floor: "",
        roomNumber: "",
        notes: "",
        isActive: true,
      });
    }
    setError(null);
    setShowDeleteConfirm(false);
    setUploadProgress(0);
  }, [initialData, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kitaspaces/meeting-rooms");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      setUploadProgress(100);

      // 🔧 Force HTTPS URL
      const imageUrl = result.data.url.replace(/^http:/, "https:");
      setFormData((prev) => ({ ...prev, coverPhotoUrl: imageUrl }));

      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setUploadProgress(0);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, coverPhotoUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ Validate hourly rate
      if (!formData.hourlyRate || formData.hourlyRate <= 0) {
        throw new Error("Hourly rate must be greater than 0");
      }

      const amenitiesList = formData.amenities
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const roomData: MeetingRoomCreateInput | MeetingRoomUpdateInput = {
        name: formData.name,
        description: formData.description || undefined,
        capacity: formData.capacity,
        hourlyRate: Number(formData.hourlyRate),
        coverPhotoUrl: formData.coverPhotoUrl || undefined,
        amenities: JSON.stringify(amenitiesList),
        startTime: formData.startTime,
        endTime: formData.endTime,
        floor: formData.floor || undefined,
        roomNumber: formData.roomNumber || undefined,
        notes: formData.notes || undefined,
        isActive: formData.isActive,
      };

      const url = initialData
        ? `/api/admin/meeting-rooms/${initialData.id}`
        : "/api/admin/meeting-rooms";

      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save room");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/meeting-rooms/${initialData.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete room");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Meeting Room" : "Add Meeting Room"}
      size="xl"
      footer={
        <>
          {/* Delete Button (only for existing rooms) */}
          {initialData && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center"
              disabled={isSubmitting || isDeleting}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Room
            </button>
          )}

          {/* Delete Confirmation Buttons */}
          {showDeleteConfirm && (
            <>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="mr-auto px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel Delete
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </>
          )}

          {/* Regular Action Buttons */}
          {!showDeleteConfirm && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-foreground/70 hover:bg-foreground/5 rounded-lg transition-colors font-medium"
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="roomForm"
                disabled={isSubmitting || isDeleting || isUploadingImage}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Room"}
              </button>
            </>
          )}
        </>
      }
    >
      <form id="roomForm" onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Delete Confirmation Warning */}
        {showDeleteConfirm && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrashIcon className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-900 mb-1">
                  Confirm Room Deletion
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>{formData.name}</strong>?
                </p>
                <p className="text-xs text-red-600">
                  This action cannot be undone. The room will only be deleted if
                  there are no upcoming bookings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Room Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="e.g. The Brainstorm Pod"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={showDeleteConfirm}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Describe the room layout and vibe..."
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={showDeleteConfirm}
          />
        </div>

        {/* Cover Photo Upload with Preview */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Cover Photo
          </label>

          {/* Image Preview */}
          {formData.coverPhotoUrl && (
            <div className="relative mb-3 rounded-lg overflow-hidden border-2 border-foreground/10">
              <div className="relative w-full h-48">
                <Image
                  src={formData.coverPhotoUrl}
                  alt="Room cover"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={showDeleteConfirm || isUploadingImage}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!formData.coverPhotoUrl && (
            <div className="relative">
              <input
                type="file"
                id="coverPhoto"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={showDeleteConfirm || isUploadingImage}
                className="hidden"
              />
              <label
                htmlFor="coverPhoto"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploadingImage
                    ? "border-primary bg-primary/5 cursor-not-allowed"
                    : "border-foreground/20 hover:border-primary hover:bg-primary/5"
                } ${showDeleteConfirm ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-12 h-12 text-foreground/40 mb-3" />
                  <p className="mb-2 text-sm text-foreground/70">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-foreground/60">
                    PNG, JPG, WEBP up to 5MB (1920x1080 recommended)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploadingImage && uploadProgress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Change Image Button */}
          {formData.coverPhotoUrl && !isUploadingImage && (
            <div className="mt-3">
              <input
                type="file"
                id="changeCoverPhoto"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={showDeleteConfirm}
                className="hidden"
              />
              <label
                htmlFor="changeCoverPhoto"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
              >
                <PhotoIcon className="w-4 h-4 mr-2" />
                Change Image
              </label>
            </div>
          )}
        </div>

        {/* Hourly Rate and Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Hourly Rate (₱) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
              <input
                type="number"
                min="1"
                step="1"
                required
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="e.g. 500"
                value={formData.hourlyRate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={showDeleteConfirm}
              />
            </div>
            <p className="text-xs text-foreground/60 mt-1">
              Enter the price per hour in Philippine Pesos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Capacity (Pax) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserGroupIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="e.g. 8"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 1,
                  })
                }
                disabled={showDeleteConfirm}
              />
            </div>
          </div>
        </div>

        {/* Available Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Start Time
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
              <input
                type="time"
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                disabled={showDeleteConfirm}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              End Time
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
              <input
                type="time"
                className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                disabled={showDeleteConfirm}
              />
            </div>
          </div>
        </div>

        {/* Floor and Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Floor
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="e.g. 2nd Floor"
              value={formData.floor}
              onChange={(e) =>
                setFormData({ ...formData, floor: e.target.value })
              }
              disabled={showDeleteConfirm}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Room Number
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="e.g. Room 201"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              disabled={showDeleteConfirm}
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Amenities
          </label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-2.5 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              className="w-full rounded-lg border border-foreground/20 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="WiFi, Projector, Whiteboard, TV, Coffee Machine"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              disabled={showDeleteConfirm}
            />
          </div>
          <p className="text-xs text-foreground/60 mt-1">
            Enter amenities separated by commas
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Internal Notes
          </label>
          <textarea
            className="w-full rounded-lg border border-foreground/20 px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Internal notes about this room (not visible to customers)..."
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            disabled={showDeleteConfirm}
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                disabled={showDeleteConfirm}
              />
              <div className="w-10 h-6 bg-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-foreground/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-foreground">
              Room is Active and Bookable
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
