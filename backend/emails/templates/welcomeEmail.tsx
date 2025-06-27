
import {
  Html,
  Head,
  Tailwind,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Img,
} from '@react-email/components';
import React from 'react';


const WelcomeEmail = ({ name = 'User' }) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-purple-950 text-white font-sans">
          {/* Header Gradient */}
          <Section className="bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center">
            <Heading className="text-purple-300 text-2xl font-bold m-0">Welcome to CodeJunkie!</Heading>
          </Section>

          {/* Main Body */}
          <Container className="bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg">
            
            {/* Logo */}
            <Section className="text-center">
              <Img
                src="dark_short.png"
                alt="CodeJunkie Logo"
                width="100"
                height="100"
                className="mx-auto mb-4"
              />
            </Section>

            <Text className="text-base text-zinc-300 mb-4">
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-base text-zinc-300 mb-4">
              Welcome to <strong>CodeJunkie</strong> — your new home for solving coding challenges and leveling up your skills!
            </Text>

            <Text className="text-base text-zinc-300 mb-4">
              Stay consistent, keep submitting, and grow with the community. We're excited to see what you build.
            </Text>

            <Text className="mt-6 text-sm text-zinc-400">
              Happy coding,  
              <br />
              The CodeJunkie Team ⚡
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

export default WelcomeEmail;
