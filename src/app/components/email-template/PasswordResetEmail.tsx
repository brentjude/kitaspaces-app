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

interface PasswordResetEmailProps {
  userName: string;
  otp: string;
}

export default function PasswordResetEmail({
  userName = 'Valued Member',
  otp = '123456',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Password Reset Request</Heading>
            <Text style={tagline}>KITA Spaces</Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              We received a request to reset your password for your KITA Spaces account. 
              Use the code below to reset your password.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* OTP Code */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              🔐 Your Reset Code
            </Heading>

            <div style={otpContainer}>
              <Text style={otpCode}>{otp}</Text>
            </div>

            <div style={infoBox}>
              <Text style={infoParagraph}>
                <strong>⏱️ This code will expire in 10 minutes</strong>
                <br />
                Enter this code on the password reset page to continue.
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Security Warning */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ⚠️ Security Notice
            </Heading>

            <div style={warningBox}>
              <Text style={warningText}>
                • <strong>Didn't request this?</strong> If you didn't request a password reset, 
                please ignore this email or contact us immediately.
              </Text>
              <Text style={warningText}>
                • <strong>Never share this code</strong> with anyone. KITA staff will never ask 
                for your reset code.
              </Text>
              <Text style={warningText}>
                • <strong>One-time use only:</strong> This code can only be used once and expires 
                after 10 minutes.
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
              If you're having trouble resetting your password, please contact us:
            </Text>
            <div style={contactInfo}>
              <Text style={contactText}>📧 support@kitaspaces.com</Text>
              <Text style={contactText}>📱 +63 123 456 7890</Text>
              <Text style={contactText}>🕐 Monday - Saturday, 8:00 AM - 6:00 PM</Text>
            </div>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security email from KITA Spaces.
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

const otpContainer = {
  backgroundColor: '#FFF6EF',
  border: '3px dashed #FF8E49',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const otpCode = {
  fontSize: '48px',
  fontWeight: '800',
  color: '#FF8E49',
  letterSpacing: '0.2em',
  fontFamily: 'monospace',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
};

const infoParagraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#1E40AF',
  margin: '0',
  textAlign: 'center' as const,
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