import { prisma } from '@/lib/prisma';

export type ReferenceType = 'event' | 'membership';

/**
 * Generate payment reference number
 * Format: ev_kita[YEAR]_XXX for events, mem_kita[YEAR]_XXXX for memberships
 */
export async function generatePaymentReference(type: ReferenceType): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'event' ? 'ev_kita' : 'mem_kita';
  const digits = type === 'event' ? 3 : 4;

  // Find the latest payment reference for this type and year
  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: 'desc',
    },
  });

  const latestCustomerPayment = await prisma.customerPayment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}${year}_`,
      },
    },
    orderBy: {
      paymentReference: 'desc',
    },
  });

  let nextNumber = 1;

  // Get the highest number from both tables
  if (latestPayment?.paymentReference) {
    const match = latestPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
    }
  }

  if (latestCustomerPayment?.paymentReference) {
    const match = latestCustomerPayment.paymentReference.match(/_(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      nextNumber = Math.max(nextNumber, num + 1);
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
  const existingPayment = await prisma.payment.findFirst({
    where: { paymentReference },
  });

  const existingCustomerPayment = await prisma.customerPayment.findFirst({
    where: { paymentReference },
  });

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