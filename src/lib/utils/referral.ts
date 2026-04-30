const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

/**
 * Generates a 6-character alphanumeric referral code (A-Z, 0-9).
 * No special characters. Safe to call on client or server.
 */
export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Server-side: generates a referral code guaranteed unique in the DB.
 * Import `prisma` only when calling this server-side.
 */
export async function generateUniqueReferralCode(prisma: {
  eventReferral: {
    findUnique: (args: {
      where: { code: string };
    }) => Promise<{ id: string } | null>;
  };
}): Promise<string> {
  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 10) {
    const existing = await prisma.eventReferral.findUnique({ where: { code } });
    if (!existing) return code;
    code = generateReferralCode();
    attempts++;
  }

  // Fallback: append timestamp suffix to guarantee uniqueness
  return (
    generateReferralCode() + Date.now().toString(36).slice(-2).toUpperCase()
  );
}
