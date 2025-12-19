"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  GiftIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Event, EventCategory } from "@/types/database";
import { fetchPublicEventBySlug } from "@/lib/api/public";
import PublicHeader from "@/app/components/Header";
import Image from "next/image";
import Link from "next/link";

type PublicEvent = Event & {
  category?: EventCategory | null;
  registrationCount?: number;
  freebies?: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    imageUrl: string | null;
  }>;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const response = await fetchPublicEventBySlug(slug);

        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError(response.error || "Event not found");
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  const handleCTAClick = () => {
    if (!event) return;

    // If event is member-only and user is not a member, redirect to member registration
    if (event.isMemberOnly && (!session?.user || !session.user.isMember)) {
      router.push("/member-registration");
      return;
    }

    // If redemption event, go to redemption page
    if (event.isRedemptionEvent) {
      router.push(`/events/${slug}/redeem`);
      return;
    }

    // Otherwise, go to registration
    router.push(`/events/${slug}/registration`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-foreground/60">Loading event...</p>
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
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Event Not Found
          </h1>
          <p className="text-foreground/60 mb-8">{error}</p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = new Date(event.date) < new Date();
  const isFree = event.price === 0 || event.isFree;
  const isMember = session?.user?.isMember || false;
  const isMemberOnly = event.isMemberOnly || false;
  const canRegister = !isMemberOnly || isMember;

  // Calculate member discount details
  const hasMemberDiscount =
    !isFree &&
    event.price > 0 &&
    event.memberDiscount &&
    event.memberDiscount > 0;

  const getMemberPrice = () => {
    if (!hasMemberDiscount) return null;

    const price = event.price;
    const discount = event.memberDiscount || 0;

    if (event.memberDiscountType === "PERCENTAGE") {
      return price - (price * discount) / 100;
    }
    return price - discount;
  };

  const memberPrice = getMemberPrice();
  const hasFreebies = event.freebies && event.freebies.length > 0;

  const getCategoryColor = (color: string | null) => {
    if (!color) return "bg-gray-100 text-gray-800";

    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100 text-blue-800",
      "#10B981": "bg-green-100 text-green-800",
      "#F59E0B": "bg-orange-100 text-orange-800",
      "#EC4899": "bg-pink-100 text-pink-800",
      "#8B5CF6": "bg-purple-100 text-purple-800",
      "#EF4444": "bg-red-100 text-red-800",
      "#6366F1": "bg-indigo-100 text-indigo-800",
      "#6B7280": "bg-gray-100 text-gray-800",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const getButtonConfig = () => {
    if (isCompleted) {
      return {
        text: "Event Ended",
        icon: null,
        disabled: true,
        className: "bg-gray-400 cursor-not-allowed opacity-50",
      };
    }

    if (isMemberOnly && !canRegister) {
      return {
        text: "Become a KITA Member",
        icon: <ShieldCheckIcon className="w-5 h-5 ml-2" />,
        disabled: false,
        className:
          "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
      };
    }

    if (event.isRedemptionEvent) {
      return {
        text: "Redeem Now",
        icon: <ArrowRightIcon className="w-5 h-5 ml-2" />,
        disabled: false,
        className: "bg-primary hover:bg-primary/90",
      };
    }

    return {
      text: "Reserve Your Spot",
      icon: <ArrowRightIcon className="w-5 h-5 ml-2" />,
      disabled: false,
      className: "bg-primary hover:bg-primary/90",
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="min-h-screen bg-background pb-20">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link
            href="/"
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-foreground/40" />
          <Link
            href="/events"
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            Events
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-foreground/40" />
          <span className="text-foreground font-medium truncate max-w-xs">
            {event.title}
          </span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="rounded-3xl overflow-hidden h-64 sm:h-96 w-full relative shadow-lg mb-8">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary to-orange-200 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/30">KITA</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end">
              {isMemberOnly && (
                <span className="px-4 py-2 text-sm font-bold rounded-full shadow-lg backdrop-blur-md bg-blue-500 text-white flex items-center gap-1.5">
                  <LockClosedIcon className="w-4 h-4" />
                  Members Only
                </span>
              )}
              <span
                className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg backdrop-blur-md ${
                  isCompleted
                    ? "bg-gray-100 text-gray-500"
                    : "bg-white text-primary"
                }`}
              >
                {isCompleted ? "Event Ended" : "Registration Open"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Meta */}
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {event.category && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        event.category.color
                      )}`}
                    >
                      {event.category.icon && (
                        <span className="mr-1">{event.category.icon}</span>
                      )}
                      {event.category.name}
                    </span>
                  )}
                  {isMemberOnly && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <LockClosedIcon className="w-3 h-3 mr-1" />
                      Members Only
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-foreground/60">
                  <div className="flex items-center bg-foreground/5 px-3 py-1.5 rounded-lg">
                    <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {event.startTime && (
                    <div className="flex items-center bg-foreground/5 px-3 py-1.5 rounded-lg">
                      <ClockIcon className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">{event.startTime}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center bg-foreground/5 px-3 py-1.5 rounded-lg">
                      <MapPinIcon className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Only Notice */}
              {isMemberOnly && !canRegister && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <LockClosedIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        Members-Only Event
                      </h3>
                      <p className="text-foreground/70 mb-4">
                        This exclusive event is available only to KITA Spaces
                        members. Join our community to access this and other
                        member-only benefits!
                      </p>
                      <ul className="space-y-2 text-sm text-foreground/70">
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          Access to exclusive events and workshops
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          Priority registration and member pricing
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          Community networking opportunities
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-orange max-w-none text-foreground/60 leading-relaxed">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  About this Event
                </h3>
                <p className="text-lg whitespace-pre-wrap">
                  {event.description ||
                    "Join us for an exciting gathering at KITA Spaces."}
                </p>
              </div>

              {/* Freebies Section */}
              {hasFreebies && event.freebies && (
                <div className={`rounded-2xl p-6 border-2 ${
                  event.hasCustomerFreebies 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {event.hasCustomerFreebies ? (
                        <>
                          <StarIcon className="w-5 h-5 fill-primary text-primary" />
                          What's Included for All Attendees
                        </>
                      ) : (
                        <>
                          <GiftIcon className="w-5 h-5 text-blue-600" />
                          Member-Exclusive Perks
                        </>
                      )}
                    </h3>
                    
                    {/* Availability Badge */}
                    {event.hasCustomerFreebies ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <UserGroupIcon className="w-3.5 h-3.5" />
                        All Attendees
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        Members Only
                      </span>
                    )}
                  </div>

                  {/* Info Banner */}
                  {!event.hasCustomerFreebies && (
                    <div className="mb-4 bg-blue-100 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-blue-900">
                          <strong className="font-semibold">Members Only:</strong> These exclusive perks are reserved for KITA Spaces members. {!isMember && "Become a member to unlock these benefits!"}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.hasCustomerFreebies && (
                    <div className="mb-4 bg-green-100 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-900">
                          <strong className="font-semibold">Available to All:</strong> Every attendee can select from these perks during registration!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Freebie List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.freebies.map((freebie) => (
                      <div
                        key={freebie.id}
                        className={`p-4 rounded-lg border ${
                          event.hasCustomerFreebies
                            ? 'bg-white border-orange-200 hover:border-orange-300'
                            : 'bg-white border-blue-200 hover:border-blue-300'
                        } transition-colors`}
                      >
                        <div className="flex items-start">
                          <CheckCircleIcon className={`w-5 h-5 mt-0.5 mr-2 shrink-0 ${
                            event.hasCustomerFreebies ? 'text-primary' : 'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {freebie.name}
                            </p>
                            {freebie.description && (
                              <p className="text-sm text-foreground/60 mt-1">
                                {freebie.description}
                              </p>
                            )}
                            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              event.hasCustomerFreebies
                                ? 'bg-orange-200 text-orange-900'
                                : 'bg-blue-200 text-blue-900'
                            }`}>
                              ×{freebie.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-foreground/50 italic flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Each attendee can select from available perks during registration
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-foreground/10 p-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-foreground/50 font-medium uppercase tracking-wide mb-1">
                    {isMemberOnly && !canRegister
                      ? "Membership Required"
                      : "Price per person"}
                  </p>
                  {isMemberOnly && !canRegister ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <LockClosedIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-extrabold text-foreground">
                          Members Only
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">
                        Join KITA to access this event
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Regular Price - Always in primary color */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-primary">
                          {isFree ? "Free" : `₱${event.price.toFixed(2)}`}
                        </span>
                      </div>

                      {/* Member Price Display */}
                      {hasMemberDiscount && memberPrice !== null && memberPrice > 0 ? (
                        <div className="mt-3">
                          {isMember ? (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground/70 flex items-center gap-1">
                                  <ShieldCheckIcon className="w-3.5 h-3.5 text-primary" />
                                  Your Member Price:
                                </span>
                                <div className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">
                                  SAVE {event.memberDiscountType === 'PERCENTAGE' ? `${event.memberDiscount}%` : `₱${event.memberDiscount?.toFixed(2)}`}
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-primary">
                                ₱{memberPrice.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-green-800">
                                  Member Price:
                                </span>
                                <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                  {event.memberDiscountType === 'PERCENTAGE' ? `${event.memberDiscount}% OFF` : `₱${event.memberDiscount?.toFixed(2)} OFF`}
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-green-700">
                                ₱{memberPrice.toFixed(2)}
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Become a member to get this price!
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCTAClick}
                  disabled={buttonConfig.disabled}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${buttonConfig.className}`}
                >
                  {buttonConfig.text}
                  {buttonConfig.icon}
                </button>

                {!isCompleted && (
                  <p className="text-center text-xs text-foreground/40 mt-4">
                    {isMemberOnly && !canRegister
                      ? "Become a member to unlock exclusive access"
                      : "Limited spots available. Book now to secure your entry."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}