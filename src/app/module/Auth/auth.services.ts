import httpStatus from "http-status";
import type {
  TCreateUserPayloadType,
  TResendSignupOTPPayloadType,
  TVerifySignupOTPPayloadType,
  TLoginPayloadType,
  TForgotPasswordPayloadType,
  TResetPasswordPayloadType,
  TChangePasswordPayload,
} from "./auth.validations";
import {
  AppError,
  BadRequest,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/app/errors";

import type { TMulterFile } from "@/app/interfaces/multer.types";
import uploadFileIntoCloudinary from "@/app/utils/cloudinary/upload-file";
import { File_FOLDER_NAME } from "@/app/constants/folder_name";
import {
  comparePassword,
  createToken,
  hashPassword,
  isJwtIssuedBeforePasswordChanged,
  verifyToken,
} from "@/app/utils";
import { configs } from "@/app/configs";

import { deleteFileByUrl } from "@/app/utils/cloudinary/delete-file";
import { sendEmail } from "@/app/utils/send-email";
import type { IJwtUserPayload } from "@/app/interfaces";
import moment from "moment";
import { db } from "@/app/db";
import {
  users,
  type TGetUser,
  type TInsertUser,
} from "./../../db/schemas/users";
import { and, eq } from "drizzle-orm";
import { otps } from "@/app/db/schemas";
import { checkResendCoolDown, createOrReplaceOTP } from "../Otp";

/**
 * CREATE USER:
 */
const createUser = async (
  payload: TCreateUserPayloadType,
  profileImage: TMulterFile,
) => {
  const { email, name, phone, password } = payload;

  // ?? Check with this email is any user exists?
  const existingUser = await db.query.users.findFirst({
    where: {
      email,
    },
  });

  if (existingUser) {
    if (existingUser.is_otp_verified) {
      throw new BadRequest(
        `This email already in use. Account status "${existingUser.status}"`,
      );
    } else {
      // ?? Find the otp for this user :
      const existingOTP = await db.query.otps.findFirst({
        where: {
          user_id: existingUser.id,
          type: "signup",
        },
      });

      // ?? Cooldown:
      if (existingOTP) {
        checkResendCoolDown(existingOTP.updated_at);
      }

      const otp = await createOrReplaceOTP(existingUser.id, "signup");

      if (!otp) {
        throw new BadRequest("Failed to generate otp.");
      }

      sendEmail(
        existingUser?.email,
        "Your account verification OTP has been resent",
        `Your Account OTP is ${otp.otp}`,
        `<h1>Your Account OTP is ${otp.otp}</h1>`,
        configs.nodeMailer.replyTo,
      );

      return {
        message: `OTP resent successfully. Verify your account.`,
        data: null,
      };
    }
  }

  // ?? Check this phone number already in use?:
  const associatedUserWithPhone = await db.query.users.findFirst({
    where: {
      phone: phone?.trim(),
    },
  });

  if (associatedUserWithPhone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This phone number already in use.",
    );
  }

  let newProfileUrl: string | null = null;

  // ?? File Upload:
  if (profileImage) {
    const uploadedFile = await uploadFileIntoCloudinary(
      profileImage,
      File_FOLDER_NAME.PROFILE_IMAGES,
    );
    newProfileUrl = uploadedFile?.url!;
  }

  // ?? Hash the password:
  const hashedPassword = await hashPassword(
    password,
    configs.passwordSaltRound,
  );

  try {
    const result = await db.transaction(async (tx) => {
      const userPayload: TInsertUser = {
        name,
        email,
        phone,
        password_hash: hashedPassword,
        profile_image: newProfileUrl,
      };

      const [newUser] = await tx.insert(users).values(userPayload).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        profile_image: users.profile_image,
        phone: users.phone,
        status: users.status,
        role: users.role,
        is_otp_verified: users.is_otp_verified,
        created_at: users.created_at,
      });

      if (!newUser) {
        throw new BadRequest("Failed to create user.");
      }

      const otp = await createOrReplaceOTP(newUser.id, "signup", tx);

      if (!otp) {
        throw new BadRequest("Failed to create otp.");
      }

      return { newUser, otp };
    });

    sendEmail(
      result.newUser?.email,
      "Your account verification OTP has been sent",
      `Your Account OTP is ${result.otp.otp}`,
      `<h1>Your Account OTP is ${result.otp.otp}</h1>`,
      configs.nodeMailer.replyTo,
    );

    return {
      message:
        "Your account is created successfully. Please verify your account.",
      data: result.newUser,
    };
  } catch (error) {
    if (newProfileUrl) {
      deleteFileByUrl(newProfileUrl).catch((err) => console.log(err));
    }
    throw error;
  }
};

// /**
//  * RESEND SIGNUP OTP:
//  */
const resendSignupOTP = async (payload: TResendSignupOTPPayloadType) => {
  const { email } = payload;

  // ?? Find User with email:
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // ?? Check  is OTP already verified:
  if (user.is_otp_verified) {
    throw new BadRequest("You account has already been verified.");
  }

  // ?? Check NOT
  if (user.status !== "pending") {
    throw new BadRequest(
      `You account is not pending, current status "${user.status}".`,
    );
  }

  // ?? Find OTP:
  const otp = await db.query.otps.findFirst({
    where: {
      user_id: user.id,
    },
  });

  // ?? Check  Cooldown period:
  if (otp) {
    checkResendCoolDown(otp.updated_at);
  }

  // ?? Generate a new OTP:
  const newOtp = await createOrReplaceOTP(user?.id, "signup");

  if (!newOtp) {
    throw new BadRequest("Failed to generate new OTP.");
  }

  sendEmail(
    user?.email,
    "Your account verification OTP has been resent (masum)",
    `Your Account OTP is ${newOtp.otp}`,
    `<h1>Your Account OTP is ${newOtp.otp}</h1>`,
    configs.nodeMailer.replyTo,
  );

  return {
    resendAvailableAt: moment(newOtp.updated_at)
      .add(configs.otpSettings.resendWindowInSeconds, "seconds")
      ?.toDate(),
  };
};

// /**
//  * VERIFY SIGNUP OTP:
//  */
const verifySignupOTP = async (payload: TVerifySignupOTPPayloadType) => {
  const { email, otp } = payload;

  // ?? Find User with email:
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // ?? Check  is OTP already verified:
  if (user.is_otp_verified) {
    throw new BadRequest("You account has already been verified.");
  }

  // ?? Check NOT
  if (user.status !== "pending") {
    throw new BadRequest(
      `You account is not pending, current status "${user.status}".`,
    );
  }

  // ?? Find OTP:
  const existingOTP = await db.query.otps.findFirst({
    where: {
      user_id: user?.id,
      type: "signup",
    },
  });

  if (!existingOTP) {
    throw new BadRequest("Invalid OTP");
  }

  if (existingOTP.expires_at < moment().toDate()) {
    throw new BadRequest("OTP has been expired.");
  }

  // ?? Is OTP Matched?:
  const isOtpMatched = await comparePassword(otp, existingOTP.otp_hash);
  if (!isOtpMatched) {
    throw new BadRequest("Invalid OTP");
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Update the otp status and user status to active:
      const [updatedUser] = await tx
        .update(users)
        .set({
          is_otp_verified: true,
          status: "active",
          verified_at: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          profile_image: users.profile_image,
          phone: users.phone,
          status: users.status,
          role: users.role,
          is_otp_verified: users.is_otp_verified,
          created_at: users.created_at,
        });

      if (!updatedUser) {
        throw new BadRequest("Failed to update user.");
      }

      await tx.delete(otps).where(eq(otps.user_id, updatedUser.id));

      return updatedUser;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// /**
//  * Customer LOGIN
//  */
const customerLogin = async (payload: TLoginPayloadType) => {
  const { email, password } = payload;

  // ?? Find User with email:
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (user.role !== "user") {
    throw new BadRequest("You are not allowed to login in this portal.");
  }

  // ?? Check  is OTP already verified:
  if (!user.is_otp_verified) {
    throw new BadRequest(
      "Your account is not verified yet. Please verify with signup OTP.",
    );
  }

  // ?? Check is account still pending?:
  if (user.status === "pending") {
    throw new ForbiddenError(`Your account is Pending yet. Please verify OTP.`);
  }

  // ?? Check is account blocked:
  if (user.status === "blocked") {
    throw new ForbiddenError(`Your account is blocked.`);
  }

  // ?? Check is account deleted ?:
  if (user.status === "deactivated") {
    throw new ForbiddenError("You account has been deleted.");
  }

  // ?? Verify is password matched:
  const isPasswordMatched = await comparePassword(password, user.password_hash);
  if (!isPasswordMatched) {
    throw new BadRequest("Credential not matched.");
  }

  //  ?? Prepare token payload
  const tokenPayload: IJwtUserPayload = {
    id: user.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    profile_image: user?.profile_image!,
    status: user?.status,
    role: user?.role,
  };

  // ?? Generate JWT Token:
  const accessToken = createToken(
    tokenPayload,
    configs.jwt.accessToken.secret,
    configs.jwt.accessToken.expiresIn,
  );

  const refreshToken = createToken(
    tokenPayload,
    configs.jwt.refreshToken.secret,
    configs.jwt.refreshToken.expiresIn,
  );

  return {
    accessToken,
    refreshToken,
    id: user.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    profile_image: user?.profile_image!,
    status: user?.status,
    role: user?.role,
    is_otp_verified: user.is_otp_verified,
    is_two_factor_enabled: user.is_two_factor_enabled,
  };
};

// /**
//  * Forgot password
//  */
const forgotPassword = async (payload: TForgotPasswordPayloadType) => {
  const { email } = payload;

  // ?? Find User with email:
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // ?? Check  is OTP already verified:
  if (!user.is_otp_verified) {
    throw new BadRequest(
      "Your account is not verified yet. Please verify with signup OTP.",
    );
  }

  // ?? Check is account still pending?:
  if (user.status === "pending") {
    throw new ForbiddenError(
      `Your account is Pending yet. Please verify your account.`,
    );
  }

  // ?? Check is account blocked:
  if (user.status === "blocked") {
    throw new ForbiddenError(`Your account is blocked.`);
  }

  // ?? Check is account deleted ?:
  if (user.status === "deactivated") {
    throw new ForbiddenError("You account has been deactivated.");
  }

  // ?? Check is account active ?:
  if (user.status !== "active") {
    throw new ForbiddenError("You account is not active yet.");
  }

  //  ?? Has any existing OTP?:
  const otp = await db.query.otps.findFirst({
    where: {
      user_id: user.id,
    },
  });

  if (otp) {
    checkResendCoolDown(otp.updated_at);
  }

  // ?? Generate a new OTP:
  const newOTP = await createOrReplaceOTP(user.id, "reset-password");

  sendEmail(
    user?.email,
    "Your Password Reset OTP",
    `Your password reset OTP is ${newOTP.otp}. This OTP will expire shortly. If you did not request a password reset, please ignore this email.`,
    `<h1>Password Reset OTP</h1>
   <p>Your password reset OTP is:</p>
   <h2>${newOTP.otp}</h2>
   <p>This OTP will expire shortly.</p>
   <p>If you did not request a password reset, please ignore this email.</p>`,
    configs.nodeMailer.replyTo,
  );

  return {
    resendAvailableAt: moment(newOTP.updated_at)
      .add(configs.otpSettings.resendWindowInSeconds, "seconds")
      ?.toDate(),
  };
};

// /**
//  * Forgot password
//  */
const verifyResetPasswordOTP = async (payload: TVerifySignupOTPPayloadType) => {
  const { email, otp } = payload;

  // ?? Find User with email:
  const user = await db.query.users.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // ?? Check  is OTP already verified:
  if (!user.is_otp_verified) {
    throw new BadRequest(
      "Your account is not verified yet. Please verify with signup OTP.",
    );
  }

  // ?? Check is account still pending?:
  if (user.status === "pending") {
    throw new ForbiddenError(
      `Your account is Pending yet. Please verify your account.`,
    );
  }

  // ?? Check is account blocked:
  if (user.status === "blocked") {
    throw new ForbiddenError(`Your account is blocked.`);
  }

  // ?? Check is account deleted ?:
  if (user.status === "deactivated") {
    throw new ForbiddenError("You account has been deleted.");
  }

  // ?? Check is account active ?:
  if (user.status !== "active") {
    throw new ForbiddenError("You account is not active yet.");
  }

  //  ?? Has any existing OTP?:
  const existingOTP = await db.query.otps.findFirst({
    where: {
      user_id: user?.id,
      type: "reset-password",
    },
  });

  if (!existingOTP) {
    throw new BadRequest("Invalid OTP.");
  }

  if (existingOTP.expires_at < moment().toDate()) {
    throw new BadRequest("OTP has been expired.");
  }

  // ?? Check is OTP matched:
  const isOtpMatched = await comparePassword(otp, existingOTP?.otp_hash);
  if (!isOtpMatched) {
    throw new BadRequest("Invalid OTP.");
  }

  // ?? Reset Password Token Payload:
  const resetPasswordTokenPayload: IJwtUserPayload = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    profile_image: user?.profile_image!,
    status: user?.status,
    role: user?.role,
  };

  await db
    .delete(otps)
    .where(and(eq(otps.user_id, user.id), eq(otps.type, "reset-password")));

  // ?? Generate Reset password Token:
  const token = createToken(
    resetPasswordTokenPayload,
    configs.jwt.resetToken.secret,
    configs.jwt.resetToken.expiresIn,
  );

  return {
    token,
  };
};

// /**
//  * Reset Password:
//  */

const resetPassword = async (payload: TResetPasswordPayloadType) => {
  const { token, password } = payload;

  // ?? Valid the token :
  const decoded = verifyToken(token, configs.jwt.resetToken.secret);
  if (!decoded.email) {
    throw new ForbiddenError("Invalid reset token.");
  }

  //  ?? Find user with this  email:
  const user = await db.query.users.findFirst({
    where: {
      email: decoded.email,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  // ?? Check  is OTP already verified:
  if (!user.is_otp_verified) {
    throw new BadRequest(
      "Your account is not verified yet. Please verify with signup OTP.",
    );
  }

  // ?? Check is account still pending?:
  if (user.status === "pending") {
    throw new ForbiddenError(
      `Your account is Pending yet. Please verify your account.`,
    );
  }

  // ?? Check is account blocked:
  if (user.status === "blocked") {
    throw new ForbiddenError(`Your account is blocked.`);
  }

  // ?? Check is account deleted ?:
  if (user.status === "deactivated") {
    throw new ForbiddenError("You account has been deactivated.");
  }

  // ?? Check is account active ?:
  if (user.status !== "active") {
    throw new ForbiddenError("You account is not active yet.");
  }

  // ?? Is jwt issued before password changed ?:
  if (
    isJwtIssuedBeforePasswordChanged(
      user.password_changed_at!,
      decoded.iat as number,
    )
  ) {
    throw new UnauthorizedError("Token is expired. Please login");
  }

  // ?? Hash password:
  const hashedPassword = await hashPassword(
    password,
    configs.passwordSaltRound,
  );

  await db
    .update(users)
    .set({
      password_hash: hashedPassword,
      password_changed_at: new Date(),
    })
    .where(eq(users.id, user.id));

  return null;
};

// /**
//  * Change password:
//  */

const changePassword = async (
  user: TGetUser,
  payload: TChangePasswordPayload,
) => {
  const { newPassword, oldPassword } = payload;

  // ?? Compare both password:
  const isPasswordMatched = await comparePassword(
    oldPassword,
    user.password_hash,
  );
  if (!isPasswordMatched) {
    throw new BadRequest("Credential not matched.");
  }

  // ?? Hash password:
  const hashedPassword = await hashPassword(
    newPassword,
    configs.passwordSaltRound,
  );

  // ?? update user password:
  await db
    .update(users)
    .set({
      password_hash: hashedPassword,
      password_changed_at: new Date(),
    })
    .where(eq(users.id, user.id));

  //  ?? Prepare token payload
  const tokenPayload: IJwtUserPayload = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    profile_image: user?.profile_image!,
    status: user?.status,
    role: user?.role,
  };

  // ?? Generate JWT Token:
  const accessToken = createToken(
    tokenPayload,
    configs.jwt.accessToken.secret,
    configs.jwt.accessToken.expiresIn,
  );

  const refreshToken = createToken(
    tokenPayload,
    configs.jwt.refreshToken.secret,
    configs.jwt.refreshToken.expiresIn,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// /**
//  * Refresh Token
//  */
const refreshToken = async (token: string) => {
  // ?? Decode Token :
  const decoded = verifyToken(token, configs.jwt.refreshToken.secret);
  if (!decoded.email) {
    throw new UnauthorizedError("Invalid token");
  }

  //  ?? Find user with this  email:
  const user = await db.query.users.findFirst({
    where: {
      email: decoded.email,
    },
  });
  if (!user) {
    throw new UnauthorizedError("User not found.");
  }

  //  ?? Otp verification :
  if (!user.is_otp_verified) {
    throw new UnauthorizedError(
      "Your account is not verified yet. Please verify your account.",
    );
  }

  // ?? Check is account still pending?:
  if (user.status === "pending") {
    throw new ForbiddenError(
      `Your account is Pending yet. Please verify your account.`,
    );
  }

  // ?? Check is account blocked:
  if (user.status === "blocked") {
    throw new ForbiddenError(`Your account is blocked.`);
  }

  // ?? Check is account deleted ?:
  if (user.status === "deactivated") {
    throw new ForbiddenError("You account has been deactivated.");
  }

  // ?? Check is account active ?:
  if (user.status !== "active") {
    throw new ForbiddenError("You account is not active yet.");
  }

  // ?? Is Refresh token
  if (
    isJwtIssuedBeforePasswordChanged(
      user.password_changed_at,
      decoded.iat as number,
    )
  ) {
    throw new UnauthorizedError("You are not authorized.");
  }

  //  ?? Prepare token payload
  const tokenPayload: IJwtUserPayload = {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    phone: user.phone,
    profile_image: user?.profile_image!,
    status: user?.status,
    role: user?.role,
  };

  // ?? Generate JWT Token:
  const accessToken = createToken(
    tokenPayload,
    configs.jwt.accessToken.secret,
    configs.jwt.accessToken.expiresIn,
  );

  const refreshToken = createToken(
    tokenPayload,
    configs.jwt.refreshToken.secret,
    configs.jwt.refreshToken.expiresIn,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authServices = {
  createUser,
  resendSignupOTP,
  verifySignupOTP,
  customerLogin,
  forgotPassword,
  verifyResetPasswordOTP,
  resetPassword,
  changePassword,
  refreshToken,
};
