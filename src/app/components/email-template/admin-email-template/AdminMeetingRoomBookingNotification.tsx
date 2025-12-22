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

interface AdminMeetingRoomBookingNotificationProps {
  customerName: string;
  customerEmail: string;
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
  bookingId: string;
}

export default function AdminMeetingRoomBookingNotification({
  customerName,
  customerEmail,
  roomName,
  bookingDate,
  startTime,
  endTime,
  duration,
  totalAmount,
  paymentReference,
  paymentMethod,
  status,
  company,
  designation,
  purpose,
  numberOfAttendees,
  bookingId,
}: AdminMeetingRoomBookingNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        New Meeting Room Booking - {roomName} by {customerName}
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
            <Heading style={h1}>🔔 New Booking Alert</Heading>
            <Text style={heroText}>
              A new meeting room booking has been created
            </Text>
          </Section>

          <Section style={content}>
            <Text style={text}>Hello Admin,</Text>

            <Text style={text}>
              A new meeting room booking has been submitted and requires your attention.
            </Text>

            {/* Customer Information */}
            <Section style={customerBox}>
              <Text style={customerTitle}>👤 Customer Information</Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Name:</td>
                  <td style={infoValue}>{customerName}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Email:</td>
                  <td style={infoValue}>{customerEmail}</td>
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

            {/* Booking Details Box */}
            <Section style={bookingBox}>
              <Text style={bookingTitle}>📋 Booking Details</Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Booking ID:</td>
                  <td style={infoValue}>{bookingId}</td>
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
              </table>
            </Section>

            {/* Payment Information */}
            <Section style={paymentBox}>
              <Text style={paymentTitle}>💳 Payment Information</Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Total Amount:</td>
                  <td style={infoValue}>₱{totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Payment Method:</td>
                  <td style={infoValue}>{paymentMethod}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Reference Number:</td>
                  <td style={infoValue}>{paymentReference}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Status:</td>
                  <td style={statusBadge(status)}>{status}</td>
                </tr>
              </table>
            </Section>

            {/* Action Required (if pending) */}
            {status === 'PENDING' && (
              <Section style={alertBox}>
                <Text style={alertTitle}>⚠️ Action Required</Text>
                <Text style={alertText}>
                  This booking is pending payment verification. Please review the payment details and update the booking status accordingly.
                </Text>
              </Section>
            )}

            {/* CTA Buttons */}
            <Section style={ctaSection}>
              <Button
                style={buttonPrimary}
                href={`https://community.kitaspaces.com/admin/bookings/${bookingId}`}
              >
                View Booking Details
              </Button>
              <Button
                style={buttonSecondary}
                href="https://community.kitaspaces.com/admin/bookings"
              >
                Manage All Bookings
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={helpText}>
              This is an automated notification from the KITA Spaces booking system.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} KITA Spaces. All rights reserved.
            </Text>
            <Text style={footerText}>Admin Notification System</Text>
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
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
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

const customerBox = {
  backgroundColor: '#F3E8FF',
  border: '2px solid #D8B4FE',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const customerTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#6B21A8',
  margin: '0 0 16px 0',
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

const paymentBox = {
  backgroundColor: '#FEF3C7',
  border: '2px solid #FDE68A',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const paymentTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#92400E',
  margin: '0 0 16px 0',
};

const alertBox = {
  backgroundColor: '#FEE2E2',
  border: '2px solid #FCA5A5',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const alertTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#991B1B',
  margin: '0 0 12px 0',
};

const alertText = {
  color: '#7F1D1D',
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

const buttonPrimary = {
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
  margin: '0 8px 8px 8px',
};

const buttonSecondary = {
  backgroundColor: '#6B7280',
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
  margin: '0 8px 8px 8px',
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
  fontStyle: 'italic' as const,
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