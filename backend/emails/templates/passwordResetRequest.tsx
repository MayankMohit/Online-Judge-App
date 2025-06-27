
import {
  Html,
  Head,
  Tailwind,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Link,
} from '@react-email/components';
import React from 'react';

interface ForgotPasswordEmailProps {
  name: string;
  resetLink: string;
}

const ForgotPasswordEmail = ({ name, resetLink }: ForgotPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-black text-white font-sans">
          <Section className="bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center">
            <Heading className="text-white text-2xl font-bold m-0">Reset Your Password</Heading>
          </Section>

          <Container className="bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg">
            <Text className="text-zinc-300 mb-4">
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-zinc-300 mb-4">
              We received a request to reset your password. Click the link below to proceed:
            </Text>

            <Section className="text-center my-6">
              <Link
                href={resetLink}
                className="inline-block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-500"
              >
                Reset Password
              </Link>
            </Section>

            <Text className="text-zinc-400 text-sm">
              If you didn’t request this, you can safely ignore this email.
            </Text>
          </Container>

          <Text className="text-center text-xs text-zinc-500 mt-8">
            This is an automated message. Please do not reply.
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
