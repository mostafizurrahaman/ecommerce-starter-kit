import { generateOtp, hashPassword } from "@/app/utils";
import { configs } from "@/app/configs";
import moment from "moment";
import { BadRequest } from "@/app/errors";
import { db } from "@/app/db";
import {
  otps,
  type TOtpGetType,
  type TOtpInsertType,
  type TOtpType,
} from "@/app/db/schemas";
import { eq } from "drizzle-orm";
import type { TTransaction } from "@/app/interfaces";

// ?? 1. Create OTP: A user will have only one otp at the same time
export const createOrReplaceOTP = async (
  user_id: string,
  type: TOtpType,
  tx?: TTransaction,
) => {
  const database = tx ?? db;

  // ?? Generate OTP:
  const otp = generateOtp({
    length: configs.otpSettings.digits,
    numericOnly: true,
  });

  // ?? Hash OTP:
  const otp_hash = await hashPassword(otp, configs.passwordSaltRound);

  // ?? Calculate five me from now:
  const now = moment().toDate();
  const expiresAt = moment()
    .add(configs.otpSettings.expiresIn, "minutes")
    .toDate();

  const otpPayload: TOtpInsertType = {
    user_id,
    otp_hash,
    expires_at: expiresAt,
    type,
    updated_at: now,
  };

  const [result] = await database
    .insert(otps)
    .values(otpPayload)
    .onConflictDoUpdate({
      target: otps.user_id,
      set: {
        type,
        otp_hash,
        expires_at: expiresAt,
        updated_at: now,
      },
    })
    .returning();

  if (!result) {
    throw new BadRequest("Failed to generate otp.");
  }

  return { otp, ...result };
};

// ?? Check OTP resend cooldown:
export const checkResendCoolDown = (lastSentAt: Date) => {
  // ?? Resend cooldown window:
  const elapsed = moment().diff(lastSentAt);
  const cooldownMs = configs.otpSettings.resendWindowInSeconds * 1000;

  if (elapsed < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);

    throw new BadRequest(
      `Please wait ${remainingSeconds} seconds before requesting another OTP`,
    );
  }
};
