import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 10;

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOTP(otp: string, email: string): string {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET || 'default-secret-key')
    .update(`${otp}:${email}`)
    .digest('hex');
}

export function verifyOTP(otp: string, email: string, hash: string): boolean {
  const computedHash = hashOTP(otp, email);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function isOTPExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}