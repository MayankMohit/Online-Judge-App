
import {
  Html,
  Head,
  Tailwind,
  Body,
  Container,
  Text,
  Heading,
  Section,
} from '@react-email/components';
import React from 'react';

interface VerifyEmailProps {
  name: string;
  verificationToken: string;
}

const VerifyEmail = ({ name, verificationToken }: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800">
          <Section className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
            <Heading className="text-white text-2xl font-bold m-0">Verify Your Email on CodeJunkie</Heading>
          </Section>

          <Container className="bg-gray-50 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg">
            <Text className="text-base mb-4">Hello <strong>{name}</strong>,</Text>

            <Text className="text-base mb-4">
              Thank you for signing up! Please use the following code to verify your email address:
            </Text>

            <Section className="text-center my-6">
              <Text className="text-3xl font-bold tracking-widest text-purple-700">
                {verificationToken}
              </Text>
            </Section>

            <Text className="text-sm text-gray-600">
              This code will expire in 24 hours. If you didn’t create an account with us, you can safely ignore this email.
            </Text>

            <Text className="mt-6 text-sm text-gray-600">
              Best regards,  
              <br />
              The Team
            </Text>
          </Container>

          <Text className="text-center text-xs text-gray-400 mt-8">
            This is an automated message. Please do not reply.
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
