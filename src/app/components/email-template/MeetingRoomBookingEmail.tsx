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
  Row,
  Column,
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
  paymentMethod = 'GCASH',
  status = 'PENDING',
  company,
  purpose,
}: MeetingRoomBookingEmailProps) {
  const statusColors = {
    PENDING: '#F59E0B',
    CONFIRMED: '#10B981',
    CANCELLED: '#EF4444',
    COMPLETED: '#3B82F6',
  };

  const statusColor = statusColors[status as keyof typeof statusColors] || '#6B7280';

  const paymentMethodDisplay: Record<string, string> = {
    GCASH: 'GCash',
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
    CREDIT_CARD: 'Credit Card',
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Meeting Room Booking Confirmation</Heading>
            <Text style={tagline}>KitaSpaces Coworking</Text>
          </Section>

          {/* Status Badge */}
          <Section style={statusSection}>
            <div
              style={{
                ...statusBadge,
                backgroundColor: `${statusColor}15`,
                borderLeft: `4px solid ${statusColor}`,
              }}
            >
              <Text style={{ ...statusText, color: statusColor }}>
                Status: {status}
              </Text>
            </div>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Thank you for booking a meeting room with us! Your booking has been received and is
              currently being processed.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Booking Details */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              📋 Booking Details
            </Heading>

            <div style={detailsCard}>
              <Row style={detailRow}>
                <Column style={detailLabel}>Room:</Column>
                <Column style={detailValue}>{roomName}</Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Date:</Column>
                <Column style={detailValue}>{bookingDate}</Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Time:</Column>
                <Column style={detailValue}>
                  {startTime} - {endTime}
                </Column>
              </Row>

              {company && (
                <Row style={detailRow}>
                  <Column style={detailLabel}>Company:</Column>
                  <Column style={detailValue}>{company}</Column>
                </Row>
              )}

              {purpose && (
                <Row style={detailRow}>
                  <Column style={detailLabel}>Purpose:</Column>
                  <Column style={detailValue}>{purpose}</Column>
                </Row>
              )}
            </div>
          </Section>

          <Hr style={divider} />

          {/* Payment Details */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              💳 Payment Information
            </Heading>

            <div style={detailsCard}>
              <Row style={detailRow}>
                <Column style={detailLabel}>Reference Number:</Column>
                <Column style={{ ...detailValue, fontFamily: 'monospace', fontWeight: '700' }}>
                  {paymentReference}
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Payment Method:</Column>
                <Column style={detailValue}>
                  {paymentMethodDisplay[paymentMethod] || paymentMethod}
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabel}>Payment Status:</Column>
                <Column style={detailValue}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    PENDING
                  </span>
                </Column>
              </Row>

              <Hr style={{ margin: '16px 0', borderColor: '#E5E7EB' }} />

              <Row style={detailRow}>
                <Column style={detailLabel}>
                  <Text style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    Total Amount:
                  </Text>
                </Column>
                <Column style={detailValue}>
                  <Text
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#FF8E49',
                      margin: 0,
                    }}
                  >
                    ₱{totalAmount.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Next Steps */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ✅ What's Next?
            </Heading>

            <div style={infoBox}>
              {status === 'PENDING' &&
                (paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && (
                  <>
                    <Text style={infoParagraph}>
                      <strong>1. Payment Verification</strong>
                      <br />
                      Our team will verify your payment within 24 hours. You will receive a
                      confirmation email once approved.
                    </Text>
                  </>
                )}

              {status === 'PENDING' &&
                (paymentMethod === 'CASH' || paymentMethod === 'CREDIT_CARD') && (
                  <>
                    <Text style={infoParagraph}>
                      <strong>1. Payment on Arrival</strong>
                      <br />
                      Please bring{' '}
                      {paymentMethod === 'CASH' ? 'exact amount' : 'your credit card'} when you
                      arrive. Payment will be collected before room access.
                    </Text>
                  </>
                )}

              <Text style={infoParagraph}>
                <strong>2. Access Instructions</strong>
                <br />
                You will receive detailed access instructions and any required codes or keys before
                your booking time.
              </Text>

              <Text style={infoParagraph}>
                <strong>3. Arrival</strong>
                <br />
                Please arrive 5-10 minutes before your scheduled time. Our staff will assist you
                with room setup.
              </Text>

              <Text style={infoParagraph}>
                <strong>4. Payment Completion</strong>
                <br />
                After your meeting, payment status will be updated to COMPLETED. You will receive a
                final receipt via email.
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
                • <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before
                booking time
              </Text>
              <Text style={warningText}>
                • <strong>Late Arrival:</strong> Please notify us if you'll be more than 15 minutes
                late
              </Text>
              <Text style={warningText}>
                • <strong>Room Rules:</strong> Please maintain cleanliness and respect noise levels
              </Text>
              <Text style={warningText}>
                • <strong>Equipment:</strong> Report any issues with room equipment immediately
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
            <Text style={contactInfo}>
              📧 Email: bookings@kitaspaces.com
              <br />
              📱 Phone: +63 123 456 7890
              <br />
              🕐 Hours: Monday - Saturday, 8:00 AM - 6:00 PM
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated email. Please do not reply directly to this message.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} KitaSpaces Coworking. All rights reserved.
            </Text>
            <Text style={footerText}>
              Keep this email for your records. Your reference number is: {paymentReference}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#F3F4F6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1F2937',
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

const statusSection = {
  backgroundColor: '#FFFFFF',
  padding: '20px 24px',
};

const statusBadge = {
  padding: '12px 16px',
  borderRadius: '8px',
  display: 'inline-block',
};

const statusText = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const content = {
  backgroundColor: '#FFFFFF',
  padding: '24px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1F2937',
  margin: '0 0 16px 0',
};

const h2 = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1F2937',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#4B5563',
  margin: '0 0 16px 0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '0',
};

const detailsCard = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6B7280',
  fontWeight: '500',
  width: '40%',
  paddingRight: '8px',
};

const detailValue = {
  fontSize: '14px',
  color: '#1F2937',
  fontWeight: '600',
  width: '60%',
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
  margin: '0 0 12px 0',
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
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#4B5563',
  margin: '16px 0 0 0',
  padding: '16px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
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