'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Event, EventCategory } from '@/types/database';
import { fetchPublicEventBySlug } from '@/lib/api/public';
import PublicHeader from '@/app/components/Header';
import Image from 'next/image';
import Link from 'next/link';

// Use the same type as defined in the API client
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
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const response = await fetchPublicEventBySlug(slug);

        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError(response.error || 'Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const handleLoginClick = () => {
    router.push('/auth/signin');
  };

  const handleReserveSpot = () => {
    if (!event) return;
    // Navigate to registration page
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
                  name: session.user.name || '', 
                  email: session.user.email || '',
                  role: session.user.role 
                }
              : null
          }
          onLoginClick={handleLoginClick}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
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

  const getCategoryColor = (color: string | null) => {
    if (!color) return 'bg-gray-100 text-gray-800';
    
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-100 text-blue-800',
      '#10B981': 'bg-green-100 text-green-800',
      '#F59E0B': 'bg-orange-100 text-orange-800',
      '#EC4899': 'bg-pink-100 text-pink-800',
      '#8B5CF6': 'bg-purple-100 text-purple-800',
      '#EF4444': 'bg-red-100 text-red-800',
      '#6366F1': 'bg-indigo-100 text-indigo-800',
      '#6B7280': 'bg-gray-100 text-gray-800',
    };

    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicHeader
        currentUser={
          session?.user
            ? { 
                name: session.user.name || '', 
                email: session.user.email || '',
                role: session.user.role 
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
            <div className="absolute top-6 right-6 flex gap-2">
              <span
                className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg backdrop-blur-md ${
                  isCompleted
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-white text-primary'
                }`}
              >
                {isCompleted ? 'Event Ended' : 'Registration Open'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Meta */}
              <div>
                {event.category && (
                  <div className="flex items-center gap-2 mb-3">
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
                  </div>
                )}

                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-foreground/60">
                  <div className="flex items-center bg-foreground/5 px-3 py-1.5 rounded-lg">
                    <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
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

              {/* Description */}
              <div className="prose prose-orange max-w-none text-foreground/60 leading-relaxed">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  About this Event
                </h3>
                <p className="text-lg whitespace-pre-wrap">
                  {event.description || 'Join us for an exciting gathering at KITA Spaces.'}
                </p>
              </div>

              {/* Freebies */}
              {event.freebies && event.freebies.length > 0 && (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                    <StarIcon className="w-5 h-5 fill-primary text-primary mr-2" />
                    What's Included
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.freebies.map((freebie) => (
                      <div key={freebie.id} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-primary mt-0.5 mr-2 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">{freebie.name}</p>
                          {freebie.description && (
                            <p className="text-sm text-foreground/60">
                              {freebie.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-foreground/10 p-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-foreground/50 font-medium uppercase tracking-wide mb-1">
                    Price per person
                  </p>
                  <div className="flex items-end">
                    <span className="text-4xl font-extrabold text-foreground">
                      {isFree ? 'Free' : `₱${event.price}`}
                    </span>
                    {event.isFreeForMembers && !isFree && (
                      <span className="text-sm text-blue-600 font-semibold mb-1 ml-2">
                        (Free for members)
                      </span>
                    )}
                  </div>
                </div>

               <button
                onClick={handleReserveSpot}
                disabled={isCompleted}
                className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-200 transition-transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 bg-primary hover:bg-primary/90"
              >
                {isCompleted ? (
                  'Event Ended'
                ) : event.isRedemptionEvent ? (
                  <>
                    Redeem Now
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Reserve Your Spot
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

                {!isCompleted && (
                  <p className="text-center text-xs text-foreground/40 mt-4">
                    Limited spots available. Book now to secure your entry.
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