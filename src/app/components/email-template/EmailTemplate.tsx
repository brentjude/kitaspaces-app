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
} from '@react-email/components';

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to KITA Spaces!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {firstName}!</Heading>
          <Text style={text}>
            Thank you for joining KITA Spaces. We're excited to have you as part of our community.
          </Text>
          <Section style={section}>
            <Text style={text}>
              Your membership gives you access to:
            </Text>
            <Text style={bulletPoint}>• Coworking spaces</Text>
            <Text style={bulletPoint}>• Meeting rooms</Text>
            <Text style={bulletPoint}>• Exclusive events</Text>
            <Text style={bulletPoint}>• And much more!</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            KITA Spaces - Your Creative Workspace
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const section = {
  padding: '20px 40px',
};

const bulletPoint = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
};