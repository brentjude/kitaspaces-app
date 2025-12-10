"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PublicHeader from "@/app/components/Header";
import { fetchPublicEventBySlug } from "@/lib/api/public";
import { Event, EventCategory } from "@/types/database";
import { PaymentSettings } from "@/types/registration";
import RegistrationSteps from "./components/RegistrationSteps";
import RedemptionForm from "./components/RedemptionForm";

type PublicEvent = Event & {
  category?: EventCategory | null;
  freebies?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
  }>;
};

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load event and payment settings in parallel
        const [eventResponse, paymentResponse] = await Promise.all([
          fetchPublicEventBySlug(slug),
          fetch("/api/public/payment-settings"),
        ]);

        // Handle event response
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data);
        } else {
          setError(eventResponse.error || "Event not found");
        }

        // Handle payment settings response
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          if (paymentData.success && paymentData.data) {
            setPaymentSettings(paymentData.data);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug]);

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader
          currentUser={
            session?.user
              ? {
                  name: session.user.name || "",
                  email: session.user.email || "",
                  role: session.user.role,
                }
              : null
          }
          onLoginClick={handleLoginClick}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
          <p className="text-foreground/60 mb-8">{error}</p>
          <button
            onClick={() => router.push("/events")}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a redemption event
  const isRedemptionEvent = event.isRedemptionEvent;

  // Redemption events require login
  if (isRedemptionEvent && !session) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader currentUser={null} onLoginClick={handleLoginClick} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Login Required
          </h1>
          <p className="text-foreground/60 mb-8">
            You need to be logged in to redeem this event.
          </p>
          <button
            onClick={handleLoginClick}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader
        currentUser={
          session?.user
            ? {
                name: session.user.name || "",
                email: session.user.email || "",
                role: session.user.role,
              }
            : null
        }
        onLoginClick={handleLoginClick}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRedemptionEvent ? (
          <RedemptionForm
            event={event}
            currentUser={session?.user || null}
            onCancel={handleCancel}
          />
        ) : (
          <RegistrationSteps
            event={event}
            currentUser={session?.user || null}
            paymentSettings={paymentSettings}
            onCancel={handleCancel}
            onLoginRequest={handleLoginClick}
          />
        )}
      </div>
    </div>
  );
}
