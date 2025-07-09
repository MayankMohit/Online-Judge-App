import { resend, sender } from './resend.js';
import VerifyEmail from './templates/verificationEmail.js';
import WelcomeEmail from './templates/welcomeEmail.js';
import ForgotPasswordEmail from './templates/passwordResetRequest.js';
import ResetSuccessEmail from './templates/passwordResetSuccess.js';
export const sendVerificationEmail = async (email, name, verificationToken) => {
    try {
        await resend.emails.send({
            from: sender.email,
            to: email,
            subject: 'Verify your email',
            react: VerifyEmail({ name: name, verificationToken: verificationToken }),
        });
    }
    catch (error) {
        throw error;
    }
};
export const sendWelcomeEmail = async (email, name) => {
    try {
        await resend.emails.send({
            from: sender.email,
            to: email,
            subject: 'Welcome to CodeJunkie!',
            react: WelcomeEmail({ name }),
        });
    }
    catch (error) {
        throw error;
    }
};
export const sendPasswordResetEmail = async (email, name, resetURL) => {
    try {
        await resend.emails.send({
            from: sender.email,
            to: email,
            subject: "Reset Your Password",
            react: ForgotPasswordEmail({
                name: name,
                resetLink: resetURL
            }),
        });
    }
    catch (error) {
        throw new Error(`Error Sending password reset email ${error}`);
    }
};
export const sendResetSuccessEmail = async (email, name) => {
    try {
        await resend.emails.send({
            from: sender.email,
            to: email,
            subject: "Reset Password Successful",
            react: ResetSuccessEmail({
                name: name
            }),
        });
    }
    catch (error) {
        throw new Error(`Error Sending reset success email: ${error}`);
    }
};
