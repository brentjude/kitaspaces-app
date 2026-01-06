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

interface MembershipBenefit {
  name: string;
  description: string;
  quantity: number;
  unit: string;
}

interface AdminAddedMemberWelcomeEmailProps {
  name: string;
  email: string;
  password: string; // ✅ ADD THIS
  planName: string;
  startDate: string;
  endDate: string;
  adminNote: string;
  benefits: MembershipBenefit[];
}

export function AdminAddedMemberWelcomeEmail({
  name,
  email,
  password, // ✅ ADD THIS
  planName,
  startDate,
  endDate,
  adminNote,
  benefits,
}: AdminAddedMemberWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to kita co-working space! Your membership has been activated.</Preview>
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
            <Heading style={h1}>🎉 Welcome to kita Co-working Space!</Heading>
            <Text style={heroText}>Your membership is now active</Text>
          </Section>
          
          <Section style={content}>
            <Text style={text}>Hi {name},</Text>
            
            <Text style={text}>
              Great news! Your <strong>{planName}</strong> membership has been activated by our team.
              We're excited to have you as part of the kita Co-working Space community!
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
                  <td style={infoLabel}>Email:</td>
                  <td style={infoValue}>{email}</td>
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

            {/* Admin Note Section */}
            {adminNote && (
              <Section style={noteSection}>
                <Text style={noteTitle}>📝 Note from our team:</Text>
                <Text style={noteContent}>
                  {adminNote.replace(/^Added by Admin:\s*/i, '')}
                </Text>
              </Section>
            )}

            {/* Benefits Section */}
            {benefits && benefits.length > 0 && (
              <Section style={benefitsSection}>
                <Text style={sectionTitle}>Your Membership Benefits:</Text>
                <table style={benefitsList}>
                  {benefits.map((benefit, index) => (
                    <tr key={index}>
                      <td style={bulletCell}>✓</td>
                      <td style={benefitText}>
                        <strong>
                          {benefit.quantity > 0 && `${benefit.quantity} ${benefit.unit} - `}
                          {benefit.name}
                        </strong>
                        {benefit.description && (
                          <>
                            <br />
                            <span style={benefitDescription}>{benefit.description}</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </table>
                
                {/* Tip Box */}
                <Section style={tipBox}>
                  <Text style={tipText}>
                    💡 <strong>Tip:</strong> Track your perk usage and remaining balance in your Member Dashboard.
                  </Text>
                </Section>
              </Section>
            )}

            {/* Login Instructions */}
            <Section style={loginSection}>
        <Text style={loginTitle}>🔐 Access Your Account</Text>
        <Text style={loginText}>
          You can now log in to your member dashboard using these credentials:
        </Text>
        
        {/* Login Credentials Box */}
        <Section style={credentialsBox}>
          <table style={credentialsTable}>
            <tr>
              <td style={credentialLabel}>Email:</td>
              <td style={credentialValue}>{email}</td>
            </tr>
            <tr>
              <td style={credentialLabel}>Temporary Password:</td>
              <td style={credentialValue}>
                <code style={passwordCode}>{password}</code>
              </td>
            </tr>
          </table>
        </Section>

        <Text style={securityNote}>
          🔒 <strong>Important Security Notice:</strong> This is a temporary password created by our admin team. 
          For your security, please change it immediately after logging in.
        </Text>
        
        <Text style={loginSteps}>
          <strong>How to change your password:</strong>
        </Text>
        <ol style={stepsList}>
          <li style={stepItem}>Log in using the credentials above</li>
          <li style={stepItem}>Go to Settings → Change Password</li>
          <li style={stepItem}>Enter the temporary password and create a new one</li>
        </ol>
      </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={button} href="https://community.kitaspaces.com/dashboard">
                Access Member Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={readyText}>
              Ready to start working? Visit us anytime during operating hours!
            </Text>

            <Text style={helpText}>
              Questions? Contact us at{' '}
              <a href="mailto:support@kitaspaces.com" style={link}>
                support@kitaspaces.com
              </a>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} kita Co-working Space. All rights reserved.
            </Text>
            <Text style={footerText}>Your Creative Workspace</Text>
            <Text style={footerLinks}>
              <a href="https://kitaspaces.com" style={footerLink}>Website</a> |{' '}
              <a href="https://kitaspaces.com/about" style={footerLink}>About</a> |{' '}
              <a href="https://kitaspaces.com/contact" style={footerLink}>Contact</a>
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
  width: '35%',
  verticalAlign: 'top' as const,
};

const infoValue = {
  color: '#343535',
  fontSize: '14px',
  fontWeight: '500' as const,
  padding: '8px 0',
};

const noteSection = {
  backgroundColor: '#eff6ff',
  border: '2px solid #93c5fd',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const noteTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#1e40af',
  margin: '0 0 12px 0',
};

const noteContent = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#1e3a8a',
  margin: '0',
  fontStyle: 'italic' as const,
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

const benefitDescription = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'normal' as const,
};

const tipBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0 0 0',
};

const tipText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const loginSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const loginTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#343535',
  margin: '0 0 12px 0',
};

const loginText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '8px 0',
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

const readyText = {
  color: '#343535',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '16px 0',
  fontWeight: '500' as const,
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


const credentialsBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const credentialsTable = {
  width: '100%',
};

const credentialLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 12px 8px 0',
  fontWeight: '500' as const,
};

const credentialValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
  fontWeight: '600' as const,
};

const passwordCode = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '4px',
  padding: '4px 8px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#92400e',
  letterSpacing: '0.5px',
};

const securityNote = {
  fontSize: '13px',
  lineHeight: '18px',
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  padding: '12px',
  margin: '12px 0',
};

const loginSteps = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#1f2937',
  margin: '12px 0 8px 0',
};

const stepsList = {
  margin: '0 0 0 20px',
  padding: '0',
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '24px',
};

const stepItem = {
  marginBottom: '4px',
};