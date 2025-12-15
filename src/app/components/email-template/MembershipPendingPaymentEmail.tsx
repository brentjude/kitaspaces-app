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
  Img,
} from '@react-email/components';

interface MembershipPendingPaymentEmailProps {
  name: string;
  planName: string;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
}

export function MembershipPendingPaymentEmail({
  name,
  planName,
  amount,
  paymentReference,
  paymentMethod,
}: MembershipPendingPaymentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your KITA Spaces membership registration is pending payment verification</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://community.kitaspaces.com/logo/kita-primary-logo.png"
              alt="KITA Spaces Logo"
              width="180"
              height="auto"
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={h1}>Registration Received!</Heading>
            <Text style={heroText}>We're processing your membership</Text>
          </Section>
          
          <Section style={content}>
            <Text style={text}>Hi {name},</Text>
            
            <Text style={text}>
              Thank you for registering for a <strong>{planName}</strong> membership at KITA Spaces!
            </Text>

            {/* Info Box */}
            <Section style={infoBox}>
              <Text style={infoTitle}>📋 Registration Details</Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Plan:</td>
                  <td style={infoValue}>{planName}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Amount:</td>
                  <td style={infoValue}>₱{amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Payment Method:</td>
                  <td style={infoValue}>{paymentMethod}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Reference:</td>
                  <td style={infoValue}>{paymentReference}</td>
                </tr>
              </table>
            </Section>

            {/* Warning Box */}
            <Section style={warningBox}>
              <Text style={warningText}>
                ⏳ <strong>Payment Verification Pending</strong>
              </Text>
              <Text style={warningDescription}>
                Your payment is currently being verified by our team. This usually takes 1-2 business hours.
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={stepsSection}>
              <Text style={sectionTitle}>What Happens Next?</Text>
              <table style={stepsList}>
                <tr>
                  <td style={stepNumber}>1</td>
                  <td style={stepText}>Our team will verify your payment</td>
                </tr>
                <tr>
                  <td style={stepNumber}>2</td>
                  <td style={stepText}>You'll receive a confirmation email once approved</td>
                </tr>
                <tr>
                  <td style={stepNumber}>3</td>
                  <td style={stepText}>Your membership will be activated immediately</td>
                </tr>
              </table>
            </Section>

            <Hr style={hr} />

            <Text style={helpText}>
              If you have any questions, feel free to contact us at{' '}
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
              <a href="http://localhost:3000" style={footerLink}>Website</a> |{' '}
              <a href="http://localhost:3000/about" style={footerLink}>About</a> |{' '}
              <a href="http://localhost:3000/contact" style={footerLink}>Contact</a>
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
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
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

const infoBox = {
  backgroundColor: '#FFF6EF',
  border: '2px solid #FFCBA4',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#D4652A',
  margin: '0 0 16px 0',
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

const warningBox = {
  backgroundColor: '#fefce8',
  border: '2px solid #fde047',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const warningText = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#854d0e',
  margin: '0 0 12px 0',
};

const warningDescription = {
  color: '#713f12',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const stepsSection = {
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#343535',
  margin: '0 0 16px 0',
};

const stepsList = {
  width: '100%',
};

const stepNumber = {
  backgroundColor: '#FF8E49',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  padding: '8px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
};

const stepText = {
  color: '#343535',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '8px 0 8px 16px',
  verticalAlign: 'top' as const,
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