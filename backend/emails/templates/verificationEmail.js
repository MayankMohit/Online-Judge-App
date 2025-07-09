import { Html, Head, Tailwind, Body, Container, Text, Heading, Section, } from '@react-email/components';
import React from 'react';
const VerifyEmail = ({ name, verificationToken }) => {
    return (React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Tailwind, null,
            React.createElement(Body, { className: "bg-white font-sans text-gray-800" },
                React.createElement(Section, { className: "bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center" },
                    React.createElement(Heading, { className: "text-white text-2xl font-bold m-0" }, "Verify Your Email on CodeJunkie")),
                React.createElement(Container, { className: "bg-gray-50 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg" },
                    React.createElement(Text, { className: "text-base mb-4" },
                        "Hello ",
                        React.createElement("strong", null, name),
                        ","),
                    React.createElement(Text, { className: "text-base mb-4" }, "Thank you for signing up! Please use the following code to verify your email address:"),
                    React.createElement(Section, { className: "text-center my-6" },
                        React.createElement(Text, { className: "text-3xl font-bold tracking-widest text-purple-700" }, verificationToken)),
                    React.createElement(Text, { className: "text-sm text-gray-600" }, "This code will expire in 24 hours. If you didn\u2019t create an account with us, you can safely ignore this email."),
                    React.createElement(Text, { className: "mt-6 text-sm text-gray-600" },
                        "Best regards,",
                        React.createElement("br", null),
                        "The Team")),
                React.createElement(Text, { className: "text-center text-xs text-gray-400 mt-8" }, "This is an automated message. Please do not reply.")))));
};
export default VerifyEmail;
