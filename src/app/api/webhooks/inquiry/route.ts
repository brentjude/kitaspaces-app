import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InquiryReason, InquiryType } from '@/generated/prisma';

interface InquiryWebhookPayload {
  name: string;
  email: string;
  contactNumber?: string;
  reason: string;
  type?: string;
  subject?: string;
  message: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Add webhook secret validation
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (process.env.INQUIRY_WEBHOOK_SECRET && webhookSecret !== process.env.INQUIRY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    const body: InquiryWebhookPayload = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.reason || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, email, reason, message' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate reason enum
    const validReasons = Object.values(InquiryReason);
    if (!validReasons.includes(body.reason.toUpperCase() as InquiryReason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reason. Must be one of: INQUIRY, FEEDBACK, COMPLAINT, SUPPORT, OTHER' },
        { status: 400 }
      );
    }

    // Validate type if reason is INQUIRY
    let inquiryType: InquiryType | undefined;
    if (body.reason.toUpperCase() === 'INQUIRY') {
      if (!body.type) {
        return NextResponse.json(
          { success: false, error: 'Type is required when reason is INQUIRY' },
          { status: 400 }
        );
      }

      const validTypes = Object.values(InquiryType);
      if (!validTypes.includes(body.type.toUpperCase() as InquiryType)) {
        return NextResponse.json(
          { success: false, error: 'Invalid type. Must be one of: EVENT, MEETING_ROOM, MEMBERSHIP, GENERAL, OTHER' },
          { status: 400 }
        );
      }

      inquiryType = body.type.toUpperCase() as InquiryType;
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create inquiry record
    const inquiry = await prisma.inquiry.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        contactNumber: body.contactNumber?.trim(),
        reason: body.reason.toUpperCase() as InquiryReason,
        type: inquiryType,
        subject: body.subject?.trim(),
        message: body.message.trim(),
        source: body.source || 'WEBSITE',
        ipAddress,
        userAgent,
        status: 'PENDING',
      },
    });

    // Optional: Send notification email to admin
    // You can integrate this later with your email service

    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id,
        message: 'Inquiry received successfully. We will get back to you soon.',
      },
    });

  } catch (error) {
    console.error('Error processing inquiry webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process inquiry',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test webhook is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Inquiry webhook endpoint is active',
    endpoints: {
      submit: 'POST /api/webhooks/inquiry',
    },
    requiredFields: ['name', 'email', 'reason', 'message'],
    optionalFields: ['contactNumber', 'type', 'subject', 'source'],
    enums: {
      reason: ['INQUIRY', 'FEEDBACK', 'COMPLAINT', 'SUPPORT', 'OTHER'],
      type: ['EVENT', 'MEETING_ROOM', 'MEMBERSHIP', 'GENERAL', 'OTHER'],
    },
  });
}