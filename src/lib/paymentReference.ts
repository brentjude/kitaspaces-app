import { prisma } from '@/lib/prisma';

export type ReferenceType = 'event' | 'membership' | 'meeting-room' | 'room'; // 🔧 Add 'room' as alias

/**
 * Generate payment reference number
 * Format: 
 * - ev_kita[YEAR]_XXX for events
 * - mem_kita[YEAR]_XXXX for memberships
 * - mrb_kita[YEAR]_XXX for meeting room bookings
 */
export async function generatePaymentReference(type: ReferenceType): Promise<string> {
  const year = new Date().getFullYear();
  
  let prefix: string;
  let digits: number;
  
  switch (type) {
    case 'event':
      prefix = 'ev_kita';
      digits = 3;
      break;
    case 'membership':
      prefix = 'mem_kita';
      digits = 4;
      break;
    case 'meeting-room':
    case 'room': // 🔧 Handle both 'meeting-room' and 'room'
      prefix = 'mrb_kita';
      digits = 3;
      break;
    default:
      throw new Error(`Invalid reference type: ${type}`);
  }

  const searchPrefix = `${prefix}${year}_`;

  // Find the latest payment reference for this type and year from all payment tables
  const [latestPayment, latestCustomerPayment] = await Promise.all([
    prisma.payment.findFirst({
      where: { paymentReference: { startsWith: searchPrefix } },
      orderBy: { paymentReference: 'desc' },
    }),
    prisma.customerPayment.findFirst({
      where: { paymentReference: { startsWith: searchPrefix } },
      orderBy: { paymentReference: 'desc' },
    }),
  ]);

  let nextNumber = 1;

  // Get the highest number from both tables
  const allReferences = [
    latestPayment?.paymentReference,
    latestCustomerPayment?.paymentReference,
  ].filter(Boolean);

  for (const ref of allReferences) {
    if (ref) {
      const match = ref.match(/_(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        nextNumber = Math.max(nextNumber, num + 1);
      }
    }
  }

  // Format with leading zeros
  const numberStr = nextNumber.toString().padStart(digits, '0');
  return `${prefix}${year}_${numberStr}`;
}

/**
 * Check if payment reference already exists
 */
export async function isReferenceUnique(paymentReference: string): Promise<boolean> {
  const [existingPayment, existingCustomerPayment] = await Promise.all([
    prisma.payment.findFirst({ where: { paymentReference } }),
    prisma.customerPayment.findFirst({ where: { paymentReference } }),
  ]);

  return !existingPayment && !existingCustomerPayment;
}

/**
 * Generate unique payment reference with retry logic
 */
export async function generateUniqueReference(type: ReferenceType, maxRetries = 10): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const reference = await generatePaymentReference(type);
    const isUnique = await isReferenceUnique(reference);
    
    if (isUnique) {
      return reference;
    }
    
    // If not unique, wait a bit and retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
  }

  throw new Error('Failed to generate unique payment reference number after multiple attempts');
}