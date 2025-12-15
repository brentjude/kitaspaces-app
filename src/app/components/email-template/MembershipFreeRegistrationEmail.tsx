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

interface MembershipFreeRegistrationEmailProps {
  name: string;
  planName: string;
  couponCode: string;
  startDate: string;
  endDate: string;
}

export function MembershipFreeRegistrationEmail({
  name,
  planName,
  couponCode,
  startDate,
  endDate,
}: MembershipFreeRegistrationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to KITA Spaces! Your membership is now active.</Preview>
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
            <Heading style={h1}>🎉 Welcome to KITA Spaces!</Heading>
            <Text style={heroText}>Your membership is now active</Text>
          </Section>
          
          <Section style={content}>
            <Text style={text}>Hi {name},</Text>
            
            <Text style={text}>
              Congratulations! Your <strong>{planName}</strong> membership has been successfully activated using coupon code <strong>{couponCode}</strong>.
            </Text>

            {/* Success Box */}
            <Section style={successBox}>
              <Text style={successText}>
                ✅ <strong>Membership Active</strong>
              </Text>
              <table style={infoTable}>
                <tr>
                  <td style={infoLabel}>Plan:</td>
                  <td style={infoValue}>{planName}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Coupon Used:</td>
                  <td style={infoValue}>{couponCode}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Start Date:</td>
                  <td style={infoValue}>
                    {new Date(startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
                <tr>
                  <td style={infoLabel}>Valid Until:</td>
                  <td style={infoValue}>
                    {new Date(endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              </table>
            </Section>

            {/* Benefits */}
            <Section style={benefitsSection}>
              <Text style={sectionTitle}>Your Membership Includes:</Text>
              <table style={benefitsList}>
                <tr>
                  <td style={bulletCell}>✓</td>
                  <td style={benefitText}>Access to coworking spaces</td>
                </tr>
                <tr>
                  <td style={bulletCell}>✓</td>
                  <td style={benefitText}>Meeting room hours</td>
                </tr>
                <tr>
                  <td style={bulletCell}>✓</td>
                  <td style={benefitText}>Printing credits</td>
                </tr>
                <tr>
                  <td style={bulletCell}>✓</td>
                  <td style={benefitText}>Exclusive member events</td>
                </tr>
                <tr>
                  <td style={bulletCell}>✓</td>
                  <td style={benefitText}>And much more!</td>
                </tr>
              </table>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={button} href="http://localhost:3000/user/dashboard">
                View My Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={helpText}>
              Have questions? We're here to help! Contact us anytime at{' '}
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

const successBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const successText = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#166534',
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

const benefitsSection = {
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#343535',
  margin: '0 0 16px 0',
};

const benefitsList = {
  width: '100%',
};

const bulletCell = {
  color: '#FF8E49',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '6px 12px 6px 0',
  verticalAlign: 'top' as const,
  width: '24px',
};

const benefitText = {
  color: '#343535',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '6px 0',
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