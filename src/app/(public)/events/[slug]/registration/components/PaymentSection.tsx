'use client';

import { QrCodeIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProofOfPaymentUpload from '@/app/components/ProofOfPaymentUpload';

interface PaymentSectionProps {
  paymentMethod: 'GCASH' | 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';
  paymentProofUrl: string;
  referenceNumber: string;
  paymentSettings: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    gcashNumber: string;
    qrCodeUrl: string | null;
  } | null;
  onPaymentMethodChange: (method: 'GCASH' | 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD') => void;
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
  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('GCASH')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
              paymentMethod === 'GCASH'
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-foreground/10 hover:border-foreground/20 text-foreground/60'
            }`}
          >
            <QrCodeIcon className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">GCash</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('BANK_TRANSFER')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
              paymentMethod === 'BANK_TRANSFER'
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-foreground/10 hover:border-foreground/20 text-foreground/60'
            }`}
          >
            <CreditCardIcon className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Bank Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('CASH')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
              paymentMethod === 'CASH'
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-foreground/10 hover:border-foreground/20 text-foreground/60'
            }`}
          >
            <BanknotesIcon className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Cash</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentMethodChange('CREDIT_CARD')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-foreground/10 hover:border-foreground/20 text-foreground/60'
            }`}
          >
            <CreditCardIcon className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Credit Card</span>
          </button>
        </div>

        {/* Payment Instructions */}
        <div className="mt-4 bg-white border border-foreground/10 rounded-xl p-6">
          {paymentMethod === 'GCASH' && (
            <div className="text-center">
              <div className="w-48 h-48 bg-foreground/5 mx-auto mb-4 flex items-center justify-center border border-foreground/10 rounded-lg overflow-hidden relative">
                {paymentSettings?.qrCodeUrl ? (
                  <Image
                    src={paymentSettings.qrCodeUrl}
                    alt="GCash QR Code"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <QrCodeIcon className="w-24 h-24 text-foreground/20" />
                )}
              </div>
              <p className="text-sm text-foreground/60">
                Scan QR code via GCash app
              </p>
              <p className="text-xs text-foreground/40 mt-1">
                GCash Number: {paymentSettings?.gcashNumber || '0917-123-4567'}
              </p>
            </div>
          )}

          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="text-left space-y-2">
              <p className="text-sm text-foreground/60">Transfer to:</p>
              <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/10">
                <p className="font-bold text-foreground">
                  {paymentSettings?.bankName || 'BPI'}
                </p>
                <p className="font-mono text-lg text-foreground tracking-wider">
                  {paymentSettings?.accountNumber || '1234 5678 9012'}
                </p>
                <p className="text-sm text-foreground/60">
                  A/N {paymentSettings?.accountHolder || 'KITA Spaces Inc.'}
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'CASH' && (
            <div className="text-center">
              <BanknotesIcon className="w-16 h-16 text-primary mx-auto mb-3" />
              <p className="text-sm text-foreground/60">
                Please bring exact cash amount on the event day
              </p>
              <p className="text-xs text-foreground/40 mt-2">
                Pay at the registration desk before entering
              </p>
            </div>
          )}

          {paymentMethod === 'CREDIT_CARD' && (
            <div className="text-center">
              <CreditCardIcon className="w-16 h-16 text-primary mx-auto mb-3" />
              <p className="text-sm text-foreground/60 font-medium">
                Pay with Credit/Debit Card at KITA Spaces
              </p>
              <p className="text-xs text-foreground/40 mt-2">
                Visit our location to complete payment via card terminal
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800">
                  Your registration will be confirmed once payment is received.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference Number (for digital payments) */}
      {(paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reference Number (Optional)
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-foreground/20 px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Enter reference number from your transaction"
            value={referenceNumber}
            onChange={(e) => onReferenceNumberChange(e.target.value)}
          />
          <p className="text-xs text-foreground/40 mt-1">
            This helps us verify your payment faster
          </p>
        </div>
      )}

      {/* Payment Proof Upload (only for GCASH and BANK_TRANSFER) */}
      {(paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && (
        <div>
          <ProofOfPaymentUpload
            value={paymentProofUrl}
            onChange={onPaymentProofChange}
            label={
              <span className="flex items-center gap-2">
                Payment Proof 
                <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-foreground/50">(Required for online payments)</span>
              </span>
            }
            helpText="Screenshot or photo of your payment confirmation"
            aspectRatio="4/3"
            maxSize="800x600"
          />
          
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800">
              <span className="font-bold">Tip:</span> Make sure your payment proof is clear and shows:
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Transaction date and time</li>
              <li>Amount paid</li>
              <li>Reference number</li>
              <li>Recipient details ({paymentMethod === 'GCASH' ? 'GCash name' : 'Bank account name'})</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}