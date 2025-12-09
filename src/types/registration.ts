export interface AttendeeFormData {
  id: string;
  name: string;
  email: string;
  selectedFreebies: Record<string, string>; // freebieId -> selected option
}

export interface RegistrationFormData {
  attendees: AttendeeFormData[];
  paymentMethod: 'GCASH' | 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD' | 'FREE';
  paymentProofUrl?: string;
  referenceNumber?: string; // User's payment reference (GCash/Bank ref)
}

export interface EventRegistrationRequest {
  eventId: string;
  attendees: Array<{
    name: string;
    email: string;
    freebieSelections: Array<{
      freebieId: string;
      selectedOption: string;
    }>;
  }>;
  paymentMethod?: 'GCASH' | 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';
  paymentProofUrl?: string;
  referenceNumber?: string; // User's payment reference
}

export interface RedemptionRequest {
  eventId: string;
  freebieSelections: Array<{
    freebieId: string;
    selectedOption: string;
  }>;
}

export interface RegistrationConfirmation {
  registrationIds: string[];
  paymentReference: string; // Changed from referenceNumber - our internal reference
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED';
  attendees: Array<{
    name: string;
    email: string;
  }>;
  event: {
    id: string;
    title: string;
    date: string;
    slug: string;
  };
}