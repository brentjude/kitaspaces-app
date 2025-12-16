import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Heading,
} from '@react-email/components';

interface MeetingRoomBookingEmailProps {
  customerName: string;
  roomName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentReference: string;
  paymentMethod: string;
  status: string;
  company?: string;
  purpose?: string;
}

export default function MeetingRoomBookingEmail({
  customerName = 'Valued Customer',
  roomName = 'Conference Room',
  bookingDate = 'January 1, 2024',
  startTime = '09:00',
  endTime = '12:00',
  totalAmount = 0,
  paymentReference = 'mrb_kita2024_001',
  company,
  purpose,
}: MeetingRoomBookingEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Meeting Room Booking Confirmed!</Heading>
            <Text style={tagline}>KITA Spaces</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Great news! Your meeting room booking has been confirmed. We look forward to hosting you at KITA Spaces.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Booking Details */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              📋 Booking Details
            </Heading>

            <div style={detailsCard}>
              <div style={detailRow}>
                <Text style={detailLabel}>Room:</Text>
                <Text style={detailValue}>{roomName}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Date:</Text>
                <Text style={detailValue}>{bookingDate}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Time:</Text>
                <Text style={detailValue}>{startTime} - {endTime}</Text>
              </div>

              {company && (
                <div style={detailRow}>
                  <Text style={detailLabel}>Company:</Text>
                  <Text style={detailValue}>{company}</Text>
                </div>
              )}

              {purpose && (
                <div style={detailRow}>
                  <Text style={detailLabel}>Purpose:</Text>
                  <Text style={detailValue}>{purpose}</Text>
                </div>
              )}

              <Hr style={{ margin: '16px 0', borderColor: '#E5E7EB' }} />

              <div style={detailRow}>
                <Text style={{ ...detailLabel, fontSize: '16px', fontWeight: '700' }}>
                  Total Amount:
                </Text>
                <Text style={{ ...detailValue, fontSize: '20px', fontWeight: '700', color: '#FF8E49' }}>
                  ₱{totalAmount.toFixed(2)}
                </Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Reference Number:</Text>
                <Text style={{ ...detailValue, fontFamily: 'monospace', fontWeight: '700' }}>
                  {paymentReference}
                </Text>
              </div>
            </div>
          </Section>

          <Hr style={divider} />

          {/* What's Next */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ✅ What's Next?
            </Heading>

            <div style={infoBox}>
              <Text style={infoParagraph}>
                <strong>Arrival</strong>
                <br />
                Please arrive 5-10 minutes before your scheduled time. Our staff will greet you at the reception and guide you to your meeting room.
              </Text>

              <Text style={infoParagraph}>
                <strong>Payment</strong>
                <br />
                Payment can be made on the day of your booking at our reception. We accept cash and credit cards. Please bring your reference number.
              </Text>

              <Text style={infoParagraph}>
                <strong>Room Access</strong>
                <br />
                You will receive access instructions and any required codes or keys when you check in at reception.
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Important Notes */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ⚠️ Important Notes
            </Heading>

            <div style={warningBox}>
              <Text style={warningText}>
                • <strong>Property Care:</strong> Please do not damage any property or equipment in the meeting room. Any damages will be charged accordingly.
              </Text>
              <Text style={warningText}>
                • <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before booking time. Please notify us as soon as possible if you need to cancel.
              </Text>
              <Text style={warningText}>
                • <strong>Late Arrival:</strong> If you're running more than 15 minutes late, please contact us to ensure your room remains available.
              </Text>
              <Text style={warningText}>
                • <strong>Room Rules:</strong> Please maintain cleanliness, respect noise levels, and leave the room as you found it.
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Contact Information */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              📞 Need Help?
            </Heading>
            <Text style={paragraph}>
              If you have any questions or need to make changes to your booking, please contact us:
            </Text>
            <div style={contactInfo}>
              <Text style={contactText}>📧 bookings@kitaspaces.com</Text>
              <Text style={contactText}>📱 +63 123 456 7890</Text>
              <Text style={contactText}>🕐 Monday - Saturday, 8:00 AM - 6:00 PM</Text>
            </div>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated confirmation email from KITA Spaces.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} KITA Spaces. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#FFF6EF',
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#343535',
  padding: '32px 24px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const tagline = {
  color: '#FF8E49',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const content = {
  backgroundColor: '#FFFFFF',
  padding: '24px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#343535',
  margin: '0 0 16px 0',
};

const h2 = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#343535',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0 0 16px 0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '0',
};

const detailsCard = {
  backgroundColor: '#FFF6EF',
  border: '2px solid #FF8E49',
  borderRadius: '12px',
  padding: '20px',
};

const detailRow = {
  marginBottom: '12px',
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'flex-start' as const,
};

const detailLabel = {
  fontSize: '14px',
  color: '#666666',
  fontWeight: '500',
  margin: '0',
};

const detailValue = {
  fontSize: '14px',
  color: '#343535',
  fontWeight: '700',
  margin: '0',
  textAlign: 'right' as const,
};

const infoBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '8px',
  padding: '16px',
};

const infoParagraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#1E40AF',
  margin: '0 0 16px 0',
};

const warningBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #FDE68A',
  borderRadius: '8px',
  padding: '16px',
};

const warningText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#92400E',
  margin: '0 0 8px 0',
};

const contactInfo = {
  backgroundColor: '#FFF6EF',
  borderRadius: '8px',
  border: '2px solid #FF8E49',
  padding: '16px',
  marginTop: '16px',
};

const contactText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#343535',
  margin: '4px 0',
  fontWeight: '500',
};

const footer = {
  backgroundColor: '#F9FAFB',
  padding: '24px',
  borderRadius: '0 0 12px 12px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#6B7280',
  margin: '4px 0',
  lineHeight: '1.5',
};