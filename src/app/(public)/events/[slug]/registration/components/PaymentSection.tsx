"use client";

import { useState } from "react";
import {
  BanknotesIcon,
  CreditCardIcon,
  QrCodeIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { PaymentSettings } from "@/types/registration";
import Image from "next/image";

interface PaymentSectionProps {
  paymentMethod: "GCASH" | "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "FREE";
  paymentProofUrl?: string;
  referenceNumber?: string;
  paymentSettings: PaymentSettings | null;
  onPaymentMethodChange: (
    method: "GCASH" | "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "FREE"
  ) => void;
  onPaymentProofChange: (url: string) => void;
  onReferenceNumberChange: (ref: string) => void;
}

export default function PaymentSection({
  paymentMethod,
  paymentProofUrl,
  referenceNumber,
  paymentSettings,
  onPaymentMethodChange,
  onPaymentProofChange,
  onReferenceNumberChange,
}: PaymentSectionProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedQrNumber, setCopiedQrNumber] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  const handleCopyToClipboard = async (
    text: string,
    type: "qr" | "account"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "qr") {
        setCopiedQrNumber(true);
        setTimeout(() => setCopiedQrNumber(false), 2000);
      } else {
        setCopiedAccountNumber(true);
        setTimeout(() => setCopiedAccountNumber(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
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

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kitaspaces/payment-proofs");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/public/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      if (result.success && result.data) {
        onPaymentProofChange(result.data.secure_url);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      alert(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const paymentMethods = [
    {
      id: "GCASH" as const,
      name: "GCash",
      icon: <QrCodeIcon className="w-6 h-6" />,
      available:
        !!paymentSettings?.qrCodeUrl || !!paymentSettings?.qrCodeNumber,
    },
    {
      id: "BANK_TRANSFER" as const,
      name: "Bank Transfer",
      icon: <BanknotesIcon className="w-6 h-6" />,
      available: !!paymentSettings?.bankName,
    },
    {
      id: "CASH" as const,
      name: "Cash",
      icon: <BanknotesIcon className="w-6 h-6" />,
      available: true,
    },
    {
      id: "CREDIT_CARD" as const,
      name: "Credit Card",
      icon: <CreditCardIcon className="w-6 h-6" />,
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          Payment Method
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethodChange(method.id)}
              disabled={!method.available}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-foreground/10 hover:border-foreground/20"
              } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`${
                  paymentMethod === method.id
                    ? "text-primary"
                    : "text-foreground/40"
                }`}
              >
                {method.icon}
              </div>
              <span className="font-medium text-foreground text-sm">
                {method.name}
              </span>
              {paymentMethod === method.id && (
                <CheckCircleIcon className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-bold text-foreground">Payment Instructions</h4>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="text-foreground/40 hover:text-foreground text-sm"
            >
              Hide
            </button>
          </div>

          {paymentMethod === "GCASH" && (
            <div className="space-y-4">
              {paymentSettings?.qrCodeUrl && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-foreground/60 mb-3">
                    Scan this QR code with your GCash app:
                  </p>
                  <div className="relative w-48 h-48 mx-auto">
                    <Image
                      src={paymentSettings.qrCodeUrl}
                      alt="GCash QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {paymentSettings?.qrCodeNumber && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-foreground/60 mb-2">
                    Or send payment to:
                  </p>
                  <div className="flex items-center justify-between bg-foreground/5 rounded-lg p-3 border border-foreground/10">
                    <p className="text-lg font-bold text-foreground font-mono">
                      {paymentSettings.qrCodeNumber}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyToClipboard(
                          paymentSettings.qrCodeNumber!,
                          "qr"
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      title="Copy number"
                    >
                      {copiedQrNumber ? (
                        <>
                          <ClipboardDocumentCheckIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/70">
                <li>Open your GCash app</li>
                <li>
                  {paymentSettings?.qrCodeUrl
                    ? "Scan the QR code above or send to the number"
                    : "Send money to the number above"}
                </li>
                <li>Complete the payment</li>
                <li>Take a screenshot of the confirmation</li>
                <li>Upload the screenshot below</li>
              </ol>
            </div>
          )}

          {paymentMethod === "BANK_TRANSFER" && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wide mb-1">
                    Bank Name
                  </p>
                  <p className="font-medium text-foreground">
                    {paymentSettings?.bankName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wide mb-1">
                    Account Number
                  </p>
                  <div className="flex items-center justify-between bg-foreground/5 rounded-lg p-3 border border-foreground/10">
                    <p className="font-bold text-foreground font-mono text-lg">
                      {paymentSettings?.accountNumber || "N/A"}
                    </p>
                    {paymentSettings?.accountNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyToClipboard(
                            paymentSettings.accountNumber!,
                            "account"
                          )
                        }
                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        title="Copy account number"
                      >
                        {copiedAccountNumber ? (
                          <>
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-foreground/50 uppercase tracking-wide mb-1">
                    Account Name
                  </p>
                  <p className="font-medium text-foreground">
                    {paymentSettings?.accountName || "N/A"}
                  </p>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/70">
                <li>Transfer to the account details above</li>
                <li>Save the transaction reference number</li>
                <li>Take a screenshot of the confirmation</li>
                <li>Upload the screenshot and enter reference number below</li>
              </ol>
            </div>
          )}

          {paymentMethod === "CASH" && (
            <div className="space-y-2 text-sm text-foreground/70">
              <p>
                You can pay in cash when you arrive at the event venue. Please
                bring the exact amount if possible.
              </p>
              <p className="font-medium text-foreground">
                No payment proof is required for cash payments.
              </p>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-800">
                  <span className="font-bold">Note:</span> Your registration
                  will be marked as PENDING until payment is verified at the
                  venue.
                </p>
              </div>
            </div>
          )}

          {paymentMethod === "CREDIT_CARD" && (
            <div className="space-y-2 text-sm text-foreground/70">
              <p>
                Pay with your credit or debit card at KITA Spaces before the
                event.
              </p>
              <p className="font-medium text-foreground">
                Visit our location to complete payment via card terminal.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <span className="font-bold">Note:</span> Your registration
                  will be marked as PENDING until payment is verified.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!showInstructions && (
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          className="text-sm text-primary hover:underline"
        >
          Show payment instructions
        </button>
      )}

      {/* Reference Number Input (for GCash and Bank Transfer) */}
      {(paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Payment Reference Number *
          </label>
          <input
            type="text"
            value={referenceNumber || ""}
            onChange={(e) => onReferenceNumberChange(e.target.value)}
            placeholder="Enter your GCash/Bank reference number"
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
          <p className="text-xs text-foreground/60 mt-1">
            This is the reference number from your{" "}
            {paymentMethod === "GCASH" ? "GCash" : "bank"} transaction
          </p>
        </div>
      )}

      {/* Payment Proof Upload (for GCash and Bank Transfer) */}
      {(paymentMethod === "GCASH" || paymentMethod === "BANK_TRANSFER") && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Payment Proof *
          </label>

          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {uploadError}
            </div>
          )}

          {paymentProofUrl ? (
            <div className="relative">
              <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-green-200">
                <Image
                  src={paymentProofUrl}
                  alt="Payment Proof"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Payment proof uploaded
                </div>
                <label className="px-4 py-2 bg-foreground/5 text-foreground/70 rounded-lg text-sm font-medium hover:bg-foreground/10 transition-colors cursor-pointer">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isUploading
                  ? "border-primary bg-primary/5 cursor-not-allowed"
                  : "border-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                    <p className="text-sm text-foreground font-medium">
                      Uploading... {uploadProgress}%
                    </p>
                  </>
                ) : (
                  <>
                    <PhotoIcon className="w-12 h-12 text-foreground/40 mb-3" />
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

          {isUploading && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {paymentMethod === "CASH" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
          <p className="font-medium mb-1">💰 Cash Payment</p>
          <p>
            You can complete your payment when you arrive at the event. Please
            bring exact change if possible.
          </p>
        </div>
      )}

      {paymentMethod === "CREDIT_CARD" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">💳 Credit/Debit Card Payment</p>
          <p>
            Visit KITA Spaces to complete your payment via our card terminal
            before the event date.
          </p>
        </div>
      )}
    </div>
  );
}