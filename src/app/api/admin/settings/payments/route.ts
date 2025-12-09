import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, you'd have a settings table. For now, we'll use env vars or hardcode
    // You can create a Settings table in Prisma if needed
    
    const settings = {
      bankName: process.env.BANK_NAME || 'BPI',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234 5678 9012',
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'KITA Spaces Inc.',
      gcashNumber: process.env.GCASH_NUMBER || '0917-123-4567',
      qrCodeUrl: process.env.QR_CODE_URL || null,
    };

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}