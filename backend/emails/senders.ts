import { resend, sender } from './resend';
import VerifyEmail from './templates/verificationEmail';
import WelcomeEmail from './templates/welcomeEmail';
import ForgotPasswordEmail from './templates/passwordResetRequest';
import ResetSuccessEmail from './templates/passwordResetSuccess';

export const sendVerificationEmail = async (email: string, name: string, verificationToken: string) => {
   
  try {
    await resend.emails.send({
      from: sender.email,
      to: email,
      subject: 'Verify your email',
      react: VerifyEmail({ name:name, verificationToken: verificationToken }),
    });
    
  } catch (error) {
    throw error;
  }
}


export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: sender.email,
      to: email,
      subject: 'Welcome to CodeJunkie!',
      react: WelcomeEmail({ name }),
    });
  } catch (error) {
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, resetURL: string) => {
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
    } catch (error) {
        throw new Error(`Error Sending password reset email ${error}`)
    }
}

export const sendResetSuccessEmail = async (email: string, name: string) => {
    try {
        await resend.emails.send({
            from: sender.email,
            to: email,
            subject: "Reset Password Successful",
            react: ResetSuccessEmail({
                name: name
            }),
        });
    } catch (error) {
        throw new Error(`Error Sending reset success email: ${error}`)
    }
}