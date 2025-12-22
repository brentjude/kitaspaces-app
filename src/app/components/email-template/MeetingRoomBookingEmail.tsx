import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
  Button,
  Img,
} from '@react-email/components';

interface MeetingRoomBookingEmailProps {
  customerName: string;
  roomName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalAmount: number;
  paymentReference: string;
  paymentMethod: string;
  status: string;
  company?: string;
  designation?: string;
  purpose: string;
  numberOfAttendees: number;
}

export default function MeetingRoomBookingEmail({
  customerName,
  roomName,
  bookingDate,
  startTime,
  endTime,
  duration,
  totalAmount: _totalAmount, // ✅ Prefix with underscore (used in Payment Information section)
  paymentReference,
  paymentMethod: _paymentMethod, // ✅ Prefix with underscore (used in Payment Information section)
  status,
  company,
  designation,
  purpose,
  numberOfAttendees,
}: MeetingRoomBookingEmailProps) {
  const isPending = status === 'PENDING';
  const isConfirmed = status === 'CONFIRMED';
  const isCompleted = status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED';
  const isNoShow = status === 'NO_SHOW';

  // Status-specific messages
  const getStatusMessage = () => {
    switch (status) {
      case 'PENDING':
        return 'Your meeting room booking has been received and is awaiting staff verification.';
      case 'CONFIRMED':
        return 'Great news! Your booking has been confirmed by our staff.';
      case 'COMPLETED':
        return 'Thank you for using our meeting room. Your booking has been completed.';
      case 'CANCELLED':
        return 'Your booking has been cancelled.';
      case 'NO_SHOW':
        return 'We noticed you did not show up for your scheduled booking.';
      default:
        return 'Your booking status has been updated.';
    }
  };

  const getStatusEmoji = () => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'CONFIRMED':
        return '✅';
      case 'COMPLETED':
        return '🎉';
      case 'CANCELLED':
        return '❌';
      case 'NO_SHOW':
        return '⚠️';
      default:
        return '📋';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>
        Meeting Room Booking {status} - {roomName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://community.kitaspaces.com/logo/kita-white-logo.png"
              alt="KITA Spaces Logo"
              width="180"
              height="auto"
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={h1}>
              {getStatusEmoji()} Booking {status}
            </Heading>
            <Text style={heroText}>
              {getStatusMessage()}
            </Text>
          </Section>

          <Section style={content}>
            <Text style={text}>Hi {customerName},</Text>

            <Text style={text}>
              {isConfirmed && (
                <>
                  Your booking for <strong>{roomName}</strong> has been reviewed and confirmed by our staff. 
                  You're all set for your meeting!
                </>
              )}
              {isPending && (
                <>
                  Thank you for booking <strong>{roomName}</strong>. Your reservation has been received 
                  and is currently being reviewed by our staff. You will receive a confirmation email shortly.
                </>
              )}
              {isCompleted && (
                <>
                  Thank you for choosing KITA Spaces! We hope your meeting in <strong>{roomName}</strong> was productive.
                </>
              )}
              {isCancelled && (
                <>
                  Your booking for <strong>{roomName}</strong> has been cancelled. If this was a mistake, 
                  please contact us immediately.
                </>
              )}
              {isNoShow && (
                <>
                  We were expecting you at <strong>{roomName}</strong> but you didn't show up. 
                  Please contact us if there was an issue.
                </>
              )}
            </Text>

            {/* Booking Details Box */}
            <Section style={bookingBox}>
              <Text style={bookingTitle}>📋 Booking Details</Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Booking Status:</td>
                  <td style={{...infoValue, ...statusBadge(status)}}>{status}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Room:</td>
                  <td style={infoValue}>{roomName}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Date:</td>
                  <td style={infoValue}>{bookingDate}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Time:</td>
                  <td style={infoValue}>
                    {startTime} - {endTime}
                  </td>
                </tr>
                <tr>
                  <td style={infoLabel}>Duration:</td>
                  <td style={infoValue}>{duration}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Attendees:</td>
                  <td style={infoValue}>
                    {numberOfAttendees} {numberOfAttendees === 1 ? 'person' : 'people'}
                  </td>
                </tr>
                <tr>
                  <td style={infoLabel}>Purpose:</td>
                  <td style={infoValue}>{purpose}</td>
                </tr>
                {company && (
                  <tr>
                    <td style={infoLabel}>Company:</td>
                    <td style={infoValue}>{company}</td>
                  </tr>
                )}
                {designation && (
                  <tr>
                    <td style={infoLabel}>Designation:</td>
                    <td style={infoValue}>{designation}</td>
                  </tr>
                )}
              </table>
            </Section>

            {/* Status-specific instructions */}
            {isPending && (
              <Section style={instructionsBox}>
                <Text style={instructionsTitle}>📝 Next Steps</Text>
                <Text style={instructionsText}>
                  1. Your booking is being reviewed by our staff
                  <br />
                  2. Keep your payment reference number: <strong>{paymentReference}</strong>
                  <br />
                  3. You will receive a confirmation email once verified
                  <br />
                  4. Contact us if you need to make any changes
                </Text>
              </Section>
            )}

            {isConfirmed && (
              <Section style={{...instructionsBox, backgroundColor: '#D1FAE5', border: '2px solid #86EFAC'}}>
                <Text style={{...instructionsTitle, color: '#065F46'}}>✅ You're All Set!</Text>
                <Text style={{...instructionsText, color: '#047857'}}>
                  • Your booking has been <strong>confirmed by our staff</strong>
                  <br />
                  • Please arrive 5-10 minutes early for check-in
                  <br />
                  • Bring a valid ID for verification
                  <br />
                  • Contact us if you need to make changes
                </Text>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button
                style={button}
                href="https://community.kitaspaces.com/dashboard"
              >
                View My Bookings
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={helpText}>
              Questions about your booking? Contact us at{' '}
              <a href="mailto:support@kitaspaces.com" style={link}>
                support@kitaspaces.com
              </a>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} KITA Spaces. All rights reserved.
            </Text>
            <Text style={footerText}>Your Creative Workspace</Text>
            <Text style={footerLinks}>
              <a href="https://kitaspaces.com" style={footerLink}>
                Website
              </a>{' '}
              |{' '}
              <a href="https://kitaspaces.com/about" style={footerLink}>
                About
              </a>{' '}
              |{' '}
              <a href="https://kitaspaces.com/contact" style={footerLink}>
                Contact
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Helper function for status badge styling
const statusBadge = (status: string) => {
  const baseStyle = {
    fontWeight: 'bold' as const,
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'inline-block',
  };

  switch (status) {
    case 'PENDING':
      return {
        ...baseStyle,
        backgroundColor: '#FEF3C7',
        color: '#92400E',
      };
    case 'CONFIRMED':
      return {
        ...baseStyle,
        backgroundColor: '#D1FAE5',
        color: '#065F46',
      };
    case 'COMPLETED':
      return {
        ...baseStyle,
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
      };
    case 'CANCELLED':
      return {
        ...baseStyle,
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
      };
    case 'NO_SHOW':
      return {
        ...baseStyle,
        backgroundColor: '#F3F4F6',
        color: '#374151',
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: '#F3F4F6',
        color: '#374151',
      };
  }
};

// Styles
const main = {
  backgroundColor: '#FFF6EF',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#FF8E49',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const heroSection = {
  backgroundColor: '#FF8E49',
  padding: '0 40px 32px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const heroText = {
  color: '#FFE5D6',
  fontSize: '18px',
  margin: '0',
};

const content = {
  padding: '32px 40px',
};

const text = {
  color: '#343535',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const bookingBox = {
  backgroundColor: '#F0F9FF',
  border: '2px solid #BFDBFE',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const bookingTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#1E40AF',
  margin: '0 0 16px 0',
};

const instructionsBox = {
  backgroundColor: '#F3F4F6',
  border: '2px solid #D1D5DB',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const instructionsTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#374151',
  margin: '0 0 12px 0',
};

const instructionsText = {
  color: '#4B5563',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  width: '40%',
  verticalAlign: 'top' as const,
};

const infoValue = {
  color: '#343535',
  fontSize: '14px',
  fontWeight: '500' as const,
  padding: '8px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#FF8E49',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
  border: 'none',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};

const link = {
  color: '#FF8E49',
  textDecoration: 'underline',
};

const footer = {
  backgroundColor: '#FFF6EF',
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '12px 0 0 0',
};

const footerLink = {
  color: '#6b7280',
  textDecoration: 'none',
};