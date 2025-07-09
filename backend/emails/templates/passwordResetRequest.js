import { Html, Head, Tailwind, Body, Container, Text, Heading, Section, Link, } from '@react-email/components';
import React from 'react';
const ForgotPasswordEmail = ({ name, resetLink }) => {
    return (React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Tailwind, null,
            React.createElement(Body, { className: "bg-black text-white font-sans" },
                React.createElement(Section, { className: "bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center" },
                    React.createElement(Heading, { className: "text-white text-2xl font-bold m-0" }, "Reset Your Password")),
                React.createElement(Container, { className: "bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg" },
                    React.createElement(Text, { className: "text-zinc-300 mb-4" },
                        "Hello ",
                        React.createElement("strong", null, name),
                        ","),
                    React.createElement(Text, { className: "text-zinc-300 mb-4" }, "We received a request to reset your password. Click the link below to proceed:"),
                    React.createElement(Section, { className: "text-center my-6" },
                        React.createElement(Link, { href: resetLink, className: "inline-block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-500" }, "Reset Password")),
                    React.createElement(Text, { className: "text-zinc-400 text-sm" }, "If you didn\u2019t request this, you can safely ignore this email.")),
                React.createElement(Text, { className: "text-center text-xs text-zinc-500 mt-8" }, "This is an automated message. Please do not reply.")))));
};
export default ForgotPasswordEmail;
