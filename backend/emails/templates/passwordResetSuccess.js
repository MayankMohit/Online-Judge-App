import { Html, Head, Tailwind, Body, Container, Text, Heading, Section, } from '@react-email/components';
import React from 'react';
const ResetSuccessEmail = ({ name }) => {
    return (React.createElement(Html, null,
        React.createElement(Head, null),
        React.createElement(Tailwind, null,
            React.createElement(Body, { className: "bg-black text-white font-sans" },
                React.createElement(Section, { className: "bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-center" },
                    React.createElement(Heading, { className: "text-white text-2xl font-bold m-0" }, "Password Reset Successful")),
                React.createElement(Container, { className: "bg-zinc-900 rounded-md shadow-md p-6 my-6 mx-auto w-full max-w-lg" },
                    React.createElement(Text, { className: "text-zinc-300 mb-4" },
                        "Hi ",
                        React.createElement("strong", null, name),
                        ","),
                    React.createElement(Text, { className: "text-zinc-300 mb-4" }, "Your password was reset successfully. You can now log in with your new password."),
                    React.createElement(Text, { className: "text-zinc-400 text-sm" }, "If this wasn\u2019t you, please contact our support team immediately.")),
                React.createElement(Text, { className: "text-center text-xs text-zinc-500 mt-8" }, "This is an automated message. Please do not reply.")))));
};
export default ResetSuccessEmail;
