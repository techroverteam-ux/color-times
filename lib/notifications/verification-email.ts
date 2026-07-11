import "server-only";
import crypto from "crypto";
import { User } from "@/models/User";
import { siteConfig } from "@/lib/config/site";
import { sendTransactionalEmail } from "@/lib/notifications/brevo-email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function buildVerificationEmailHtml(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #1f2937;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">Verify your email</h1>
      <p>Hi ${name},</p>
      <p>Thanks for creating an account with ${siteConfig.name}. Please confirm your email address to activate your account.</p>
      <p style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background: #6d1238; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email Address
        </a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
    </div>
  `;
}

export async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_TTL_MS);

    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });

    const verifyUrl = `${siteConfig.url}/verify-email?token=${token}`;

    await sendTransactionalEmail({
      to: email,
      toName: name,
      subject: `Verify your email for ${siteConfig.name}`,
      htmlContent: buildVerificationEmailHtml(name, verifyUrl),
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}

export interface VerifyEmailResult {
  success: boolean;
  message: string;
}

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  if (!token) {
    return { success: false, message: "Missing verification token." };
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    return {
      success: false,
      message: "This verification link is invalid or has expired. Please request a new one.",
    };
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { success: true, message: "Your email has been verified." };
}
