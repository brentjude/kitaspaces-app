'use client';

import { useState } from 'react';
import { BuildingOfficeIcon, QrCodeIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface PaymentsTabProps {
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  qrCodeUrl: string | null;
  onUpdateBankInfo: (data: PaymentsTabProps['bankInfo']) => Promise<void>;
  onUploadQR: (file: File) => Promise<string>;
  onDeleteQR: () => Promise<void>;
}

export default function PaymentsTab({
  bankInfo,
  qrCodeUrl,
  onUpdateBankInfo,
  onUploadQR,
  onDeleteQR,
}: PaymentsTabProps) {
  const [localBankInfo, setLocalBankInfo] = useState(bankInfo);
  const [localQrUrl, setLocalQrUrl] = useState(qrCodeUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateBankInfo(localBankInfo);
    } catch (error) {
      console.error('Error saving bank info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await onUploadQR(file);
      setLocalQrUrl(url);
    } catch (error) {
      console.error('Error uploading QR:', error);
      alert('Failed to upload QR code');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteQR = async () => {
    if (!confirm('Are you sure you want to remove the QR code?')) return;

    try {
      await onDeleteQR();
      setLocalQrUrl(null);
    } catch (error) {
      console.error('Error deleting QR:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Information */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Bank Information
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g. BDO, BPI, Metrobank"
                value={localBankInfo.bankName}
                onChange={(e) =>
                  setLocalBankInfo({ ...localBankInfo, bankName: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Account Number
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="0000 0000 0000"
                value={localBankInfo.accountNumber}
                onChange={(e) =>
                  setLocalBankInfo({ ...localBankInfo, accountNumber: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                className="block w-full rounded-lg border border-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g. KITA Spaces Philippines Inc."
                value={localBankInfo.accountHolder}
                onChange={(e) =>
                  setLocalBankInfo({ ...localBankInfo, accountHolder: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Bank Information'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-foreground/10 overflow-hidden">
        <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <QrCodeIcon className="w-5 h-5 mr-2" />
            Payment QR Code
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Upload Area */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Upload QR Code
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-foreground/20 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-foreground/40" />
                  <div className="flex text-sm text-foreground/60 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-foreground/50">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {isUploading && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-primary">Uploading...</p>
                </div>
              )}
            </div>

            {/* Current QR Preview */}
            <div className="w-full md:w-48 flex flex-col items-center">
              <span className="text-xs font-medium text-foreground/50 mb-2">
                Current QR Code
              </span>
              <div className="w-40 h-40 border border-foreground/20 rounded-lg bg-foreground/5 flex items-center justify-center overflow-hidden">
                {localQrUrl ? (
                  <img
                    src={localQrUrl}
                    alt="Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCodeIcon className="w-16 h-16 text-foreground/20" />
                )}
              </div>
              {localQrUrl && (
                <button
                  onClick={handleDeleteQR}
                  className="mt-3 inline-flex items-center text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  <TrashIcon className="w-3 h-3 mr-1" />
                  Remove QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}