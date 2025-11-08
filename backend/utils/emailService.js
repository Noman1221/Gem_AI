import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (email, subject, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'GemAI <onboarding@resend.dev>', // works without custom domain
      to: email,
      subject: subject,
      html: `<h3>Your OTP is <strong>${otp}</strong></h3>`,
    });

    console.log('Email sent:', data);
    return data;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send email');
  }
};