"use client";

import { useState } from "react";
import {
  BanknotesIcon,
  QrCodeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

// Define the type first
type BankInfoData = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

interface PaymentsTabProps {
  bankInfo: BankInfoData;
  qrCodeUrl: string | null;
  qrCodeNumber: string;
  onUpdateBankInfo: (data: BankInfoData) => Promise<void>;
  onUpdateQRInfo: (qrCodeNumber: string) => Promise<void>;
  onUploadQR: (url: string) => Promise<void>;
  onDeleteQR: () => Promise<void>;
}

export default function PaymentsTab({
  bankInfo,
  qrCodeUrl,
  qrCodeNumber,
  onUpdateBankInfo,
  onUpdateQRInfo,
  onUploadQR,
  onDeleteQR,
}: PaymentsTabProps) {
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingQR, setIsEditingQR] = useState(false);
  const [bankFormData, setBankFormData] = useState(bankInfo);
  const [qrNumber, setQrNumber] = useState(qrCodeNumber);
  const [saving, setSaving] = useState(false);

  // Use Cloudinary upload hook
  const {
    upload: uploadToCloudinary,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useCloudinaryUpload({
    folder: "kitaspaces/payment-qr",
    onSuccess: async (data) => {
      try {
        await onUploadQR(data.secure_url);
        alert("QR code uploaded successfully!");
      } catch (error) {
        console.error("Error saving QR URL:", error);
        alert("Failed to save QR code URL");
      }
    },
    onError: (error) => {
      alert(`Upload failed: ${error}`);
    },
  });

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateBankInfo(bankFormData);
      setIsEditingBank(false);
    } catch (error) {
      console.error("Error updating bank info:", error);
      alert("Failed to update bank information");
    } finally {
      setSaving(false);
    }
  };

  const handleQRNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateQRInfo(qrNumber);
      setIsEditingQR(false);
    } catch (error) {
      console.error("Error updating QR number:", error);
      alert("Failed to update QR code number");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Upload to Cloudinary
    await uploadToCloudinary(file);
  };

  const handleDeleteQR = async () => {
    if (!confirm("Are you sure you want to delete the QR code?")) return;

    try {
      await onDeleteQR();
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Failed to delete QR code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Information */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Bank Information
              </h2>
              <p className="text-sm text-foreground/60">
                Manage bank transfer details for payments
              </p>
            </div>
          </div>
          {!isEditingBank && (
            <button
              onClick={() => setIsEditingBank(true)}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingBank ? (
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={bankFormData.bankName}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, bankName: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., BDO, BPI, MetroBank"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={bankFormData.accountNumber}
                onChange={(e) =>
                  setBankFormData({
                    ...bankFormData,
                    accountNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={bankFormData.accountName}
                onChange={(e) =>
                  setBankFormData({
                    ...bankFormData,
                    accountName: e.target.value,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Name on account"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingBank(false);
                  setBankFormData(bankInfo);
                }}
                className="px-4 py-2 text-foreground/60 hover:bg-foreground/5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {bankInfo.bankName ? (
              <>
                <div className="flex justify-between py-2 border-b border-foreground/5">
                  <span className="text-sm text-foreground/60">Bank Name</span>
                  <span className="text-sm font-medium text-foreground">
                    {bankInfo.bankName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-foreground/5">
                  <span className="text-sm text-foreground/60">
                    Account Number
                  </span>
                  <span className="text-sm font-medium text-foreground font-mono">
                    {bankInfo.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-foreground/60">
                    Account Name
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {bankInfo.accountName}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/60 py-4 text-center">
                No bank information set up yet. Click Edit to add details.
              </p>
            )}
          </div>
        )}
      </div>

      {/* QR Code Payment */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <QrCodeIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              QR Code Payment
            </h2>
            <p className="text-sm text-foreground/60">
              Upload QR code for GCash, PayMaya, or bank transfers
            </p>
          </div>
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {uploadError}
          </div>
        )}

        {/* QR Code Number */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              GCash/PayMaya Number
            </label>
            {!isEditingQR && (
              <button
                onClick={() => setIsEditingQR(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {qrCodeNumber ? "Edit" : "Add"}
              </button>
            )}
          </div>

          {isEditingQR ? (
            <form onSubmit={handleQRNumberSubmit} className="space-y-3">
              <input
                type="text"
                value={qrNumber}
                onChange={(e) => setQrNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., 09123456789"
                required
              />
              <p className="text-xs text-foreground/50">
                Enter your GCash or PayMaya mobile number
              </p>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingQR(false);
                    setQrNumber(qrCodeNumber);
                  }}
                  className="px-4 py-2 text-foreground/60 hover:bg-foreground/5 rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="px-4 py-3 bg-foreground/5 rounded-lg border border-foreground/10">
              <div className="text-sm font-medium text-foreground font-mono">
                {qrCodeNumber || (
                  <span className="text-foreground/40 font-sans">
                    Not set - Click Add to enter your number
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* QR Code Image */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            QR Code Image
          </label>
          {qrCodeUrl ? (
            <div className="space-y-4">
              <div className="relative w-full max-w-xs mx-auto aspect-square rounded-xl overflow-hidden border-2 border-foreground/10">
                <Image
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <label
                  className={`px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors cursor-pointer text-sm ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading
                    ? `Uploading... ${uploadProgress}%`
                    : "Replace QR Code"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleDeleteQR}
                  disabled={isUploading}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
              {isUploading && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-foreground/20 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <QrCodeIcon className="w-12 h-12 text-foreground/40 mb-3" />
                {isUploading ? (
                  <>
                    <p className="mb-2 text-sm text-foreground font-semibold">
                      Uploading... {uploadProgress}%
                    </p>
                    <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-foreground/60">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}