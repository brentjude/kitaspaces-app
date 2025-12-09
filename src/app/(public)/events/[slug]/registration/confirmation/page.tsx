'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RegistrationConfirmation } from '@/types/registration';
import ConfirmationSuccess from '../components/ConfirmationSuccess';
import CreateAccountPrompt from '../components/CreateAccountPrompt';

export default function RegistrationConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<RegistrationConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  useEffect(() => {
    // Get confirmation data from URL params or sessionStorage
    const confirmationData = searchParams.get('data');
    
    if (confirmationData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(confirmationData));
        setConfirmation(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse confirmation data:', error);
        // Don't set to null, keep loading to try sessionStorage
      }
    }
    
    // Always try sessionStorage as fallback or if URL parsing failed
    if (!confirmation) {
      const stored = sessionStorage.getItem('registrationConfirmation');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setConfirmation(parsed);
          // Clear after use
          sessionStorage.removeItem('registrationConfirmation');
        } catch (error) {
          console.error('Failed to parse stored confirmation:', error);
        }
      }
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-2 text-sm text-foreground/60">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  // Only show error if we really have no confirmation data
  if (!confirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Session Expired</h2>
          <p className="text-foreground/60 mb-6">
            Your registration session has expired. If you already registered, you should receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground/5 text-foreground font-medium rounded-lg hover:bg-foreground/10 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Always show confirmation success, whether payment is pending or confirmed
  return (
    <>
      <ConfirmationSuccess 
        confirmation={confirmation} 
        onCreateAccount={() => setShowCreateAccount(true)}
      />
      
      {showCreateAccount && (
        <CreateAccountPrompt
          email={confirmation.attendees[0].email}
          name={confirmation.attendees[0].name}
          onClose={() => setShowCreateAccount(false)}
          onSuccess={() => {
            setShowCreateAccount(false);
            // Optionally redirect to sign in
            router.push('/auth/signin');
          }}
        />
      )}
    </>
  );
}