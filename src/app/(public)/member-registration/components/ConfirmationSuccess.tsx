'use client';

import { MembershipRegistrationConfirmation } from '@/types/membership-registration';
import { CheckCircleIcon, CalendarDaysIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ConfirmationSuccessProps {
  confirmation: MembershipRegistrationConfirmation;
}

export default function ConfirmationSuccess({
  confirmation,
}: ConfirmationSuccessProps) {
  const isPending = confirmation.status === 'PENDING';

  return (
    <div className="p-6 sm:p-8 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-600 mb-6">
        <CheckCircleIcon className="w-12 h-12" />
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-2">
        {isPending ? 'Registration Submitted!' : 'Welcome to KITA Spaces!'}
      </h2>
      
      <p className="text-lg text-foreground/60 mb-8">
        {isPending
          ? 'Your membership registration has been received'
          : 'Your membership is now active'}
      </p>

      {/* Confirmation Details */}
      <div className="bg-foreground/5 rounded-xl p-6 mb-6 text-left max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-4 text-center">
          Membership Details
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
            <div>
              <p className="text-sm text-foreground/60">Member Name</p>
              <p className="font-semibold text-foreground">{confirmation.user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground/60">Email</p>
              <p className="font-semibold text-foreground">{confirmation.user.email}</p>
            </div>
          </div>

          <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
            <div>
              <p className="text-sm text-foreground/60">Plan</p>
              <p className="font-semibold text-foreground">{confirmation.plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground/60">Type</p>
              <p className="font-semibold text-foreground capitalize">
                {confirmation.plan.type.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-5 h-5 text-foreground/40 mr-2" />
              <div>
                <p className="text-sm text-foreground/60">Start Date</p>
                <p className="font-semibold text-foreground">
                  {new Date(confirmation.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {confirmation.endDate && (
              <div className="text-right">
                <p className="text-sm text-foreground/60">Valid Until</p>
                <p className="font-semibold text-foreground">
                  {new Date(confirmation.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
            <div className="flex items-center">
              <CreditCardIcon className="w-5 h-5 text-foreground/40 mr-2" />
              <div>
                <p className="text-sm text-foreground/60">Total Amount</p>
                <p className="font-semibold text-foreground">
                  ₱{confirmation.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            {confirmation.paymentReference && (
              <div className="text-right">
                <p className="text-sm text-foreground/60">Reference</p>
                <p className="font-mono font-semibold text-foreground text-sm">
                  {confirmation.paymentReference}
                </p>
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-foreground/60">Status</p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm mt-1 ${
                isPending
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {isPending ? 'Pending Payment Verification' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
          <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
          <ul className="text-sm text-foreground/80 space-y-2 text-left">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>
                Our team will verify your payment within 24-48 hours
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>
                You'll receive a confirmation email once your membership is activated
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>
                Check your email for your login credentials and next steps
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/"
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-colors"
        >
          Back to Home
        </Link>
        {!isPending && (
          <Link
            href="/auth/signin"
            className="px-8 py-3 border-2 border-primary text-primary hover:bg-primary/5 font-bold rounded-lg transition-colors"
          >
            Login to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}