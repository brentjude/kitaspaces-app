// Define payment method as a separate type
export type PaymentMethod =
  | "GCASH"
  | "BANK_TRANSFER"
  | "CASH"
  | "CREDIT_CARD"
  | "FREE";

export interface AttendeeFormData {
  id: string;
  name: string;
  email: string;
  selectedFreebies: Record<string, string>;
}

export interface RegistrationFormData {
  attendees: AttendeeFormData[];
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  referenceNumber?: string;
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
  paymentMethod?: PaymentMethod;
  paymentProofUrl?: string;
  referenceNumber?: string;
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
  paymentReference: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED";
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

export interface PaymentSettings {
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrCodeUrl: string | null;
  qrCodeNumber: string | null;
}
