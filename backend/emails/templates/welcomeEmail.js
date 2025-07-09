import { Html, Head, Tailwind, Body, Container, Text, Heading, Section, Img, } from '@react-email/components';
import React from 'react';
const WelcomeEmail = ({ name = 'User' }) => {
    return (React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Tailwind, null,
            React.createElement(Body, { className: "bg-purple-950 text-white font-sans" },
                React.createElement(Section, { className: "bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center" },
                    React.createElement(Heading, { className: "text-purple-300 text-2xl font-bold m-0" }, "Welcome to CodeJunkie!")),
                React.createElement(Container, { className: "bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg" },
                    React.createElement(Section, { className: "text-center" },
                        React.createElement(Img, { src: "dark_short.png", alt: "CodeJunkie Logo", width: "100", height: "100", className: "mx-auto mb-4" })),
                    React.createElement(Text, { className: "text-base text-zinc-300 mb-4" },
                        "Hello ",
                        React.createElement("strong", null, name),
                        ","),
                    React.createElement(Text, { className: "text-base text-zinc-300 mb-4" },
                        "Welcome to ",
                        React.createElement("strong", null, "CodeJunkie"),
                        " \u2014 your new home for solving coding challenges and leveling up your skills!"),
                    React.createElement(Text, { className: "text-base text-zinc-300 mb-4" }, "Stay consistent, keep submitting, and grow with the community. We're excited to see what you build."),
                    React.createElement(Text, { className: "mt-6 text-sm text-zinc-400" },
                        "Happy coding,",
                        React.createElement("br", null),
                        "The CodeJunkie Team \u26A1")),
                React.createElement(Text, { className: "text-center text-xs text-zinc-500 mt-8" }, "This is an automated message. Please do not reply.")))));
};
export default WelcomeEmail;
