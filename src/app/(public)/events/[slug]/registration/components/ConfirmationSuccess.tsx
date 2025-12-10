"use client";

import {
  CheckCircleIcon,
  ArrowRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { RegistrationConfirmation } from "@/types/registration";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ConfirmationSuccessProps {
  confirmation: RegistrationConfirmation;
  onCreateAccount?: () => void;
}

export default function ConfirmationSuccess({
  confirmation,
}: ConfirmationSuccessProps) {
  const { data: session } = useSession();
  const { event, attendees, totalAmount, status, paymentReference } =
    confirmation;
  const isPending = status === "PENDING";
  const isGuest = !session?.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-white border-b border-foreground/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              K
            </div>
            <span className="text-xl font-bold tracking-tight">
              KITA Spaces
            </span>
          </Link>

          {isGuest && (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-foreground/10 overflow-hidden">
          {/* Success Header */}
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircleIcon className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isPending
                  ? "Registration Submitted!"
                  : "Registration Confirmed!"}
              </h2>
              <p className="text-foreground/60 mt-2 text-sm sm:text-base">
                {isPending ? (
                  <>
                    Thank you for registering! We've received your registration
                    and{" "}
                    {totalAmount > 0 ? (
                      <>
                        your payment is being verified. We'll send a
                        confirmation email to{" "}
                        <span className="font-semibold text-foreground">
                          {attendees[0].email}
                        </span>{" "}
                        once payment is confirmed.
                      </>
                    ) : (
                      <>
                        you're all set! We've sent a confirmation email to{" "}
                        <span className="font-semibold text-foreground">
                          {attendees[0].email}
                        </span>
                        .
                      </>
                    )}
                  </>
                ) : (
                  <>
                    We've sent a confirmation email to{" "}
                    <span className="font-semibold text-foreground">
                      {attendees[0].email}
                    </span>{" "}
                    with your ticket details.
                  </>
                )}
              </p>
            </div>

            {/* Payment Status Badge */}
            {isPending && totalAmount > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-orange-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-orange-800">
                  Payment Pending Verification
                </span>
              </div>
            )}

            {/* Free Event Confirmed Badge */}
            {!isPending && totalAmount === 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Registration Confirmed
                </span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-foreground/5 px-8 py-6">
            <div className="max-w-md mx-auto">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-4 pb-2 border-b border-foreground/10">
                Registration Summary
              </h3>

              {/* Payment Reference Number */}
              {paymentReference && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-foreground/10">
                  <p className="text-xs text-foreground/60 mb-1">
                    Payment Reference
                  </p>
                  <p className="font-mono font-bold text-foreground text-lg">
                    {paymentReference}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    Use this reference for payment inquiries
                  </p>
                </div>
              )}

              {/* Event Details */}
              <div className="mb-4 p-3 bg-white rounded-lg border border-foreground/10">
                <p className="text-xs text-foreground/60 mb-1">Event</p>
                <p className="font-semibold text-foreground">{event.title}</p>
                <p className="text-sm text-foreground/60">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Attendees */}
              <div className="space-y-3 mb-4">
                {attendees.map((attendee, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm p-3 bg-white rounded-lg border border-foreground/10"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {attendee.name}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {attendee.email}
                      </p>
                    </div>
                    <span className="text-foreground">
                      {totalAmount === 0
                        ? "Free"
                        : `₱${(totalAmount / attendees.length).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-foreground/10 pt-3 flex justify-between items-center">
                <span className="font-bold text-foreground">
                  Total {isPending ? "Due" : "Paid"}
                </span>
                <span className="font-bold text-xl text-primary">
                  {totalAmount === 0 ? "Free" : `₱${totalAmount.toFixed(2)}`}
                </span>
              </div>

              {/* Status Message */}
              {isPending && totalAmount > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800">
                    <span className="font-bold">Next Steps:</span> Your
                    registration will be confirmed once payment is verified.
                    This usually takes 1-2 business days. Please keep your
                    payment reference{" "}
                    <span className="font-mono font-bold">
                      {paymentReference}
                    </span>{" "}
                    for tracking.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guest Account Prompt 
          {isGuest && onCreateAccount && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 px-8 py-6 border-t border-foreground/10">
              <div className="max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                      <UserPlusIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-foreground mb-1">
                      Create Your KITA Spaces Account
                    </h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Track your registrations, access exclusive member benefits, and manage your bookings all in one place.
                    </p>
                    <button
                      onClick={onCreateAccount}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 shadow-sm transition-all"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Create Free Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground/5 text-foreground font-medium rounded-lg hover:bg-foreground/10 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Return Home
            </Link>
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground/5 text-foreground font-medium rounded-lg hover:bg-foreground/10 transition-colors"
            >
              View Event Details
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              Browse More Events
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-foreground/40 mt-6">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@kitaspaces.com"
            className="text-primary hover:underline"
          >
            support@kitaspaces.com
          </a>
        </p>
      </div>
    </div>
  );
}
