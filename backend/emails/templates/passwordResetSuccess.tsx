
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

interface ResetSuccessEmailProps {
  name: string;
}

const ResetSuccessEmail = ({ name }: ResetSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-black text-white font-sans">
          <Section className="bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center">
            <Heading className="text-white text-2xl font-bold m-0">Password Reset Successful</Heading>
          </Section>

          <Container className="bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg">
            <Text className="text-zinc-300 mb-4">
              Hi <strong>{name}</strong>,
            </Text>

            <Text className="text-zinc-300 mb-4">
              Your password was reset successfully. You can now log in with your new password.
            </Text>

            <Text className="text-zinc-400 text-sm">
              If this wasn’t you, please contact our support team immediately.
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

export default ResetSuccessEmail;
