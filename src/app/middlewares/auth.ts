import httpStatus from "http-status";

import {
  catchAsync,
  isJwtIssuedBeforePasswordChanged,
  verifyToken,
} from "@/app/utils";
import { AppError, ForbiddenError, UnauthorizedError } from "@/app/errors";
import { configs } from "@/app/configs";
import type { TInsertUser, TUserRole } from "../db/schemas";
import { db } from "../db";
import { users } from "./../db/schemas/users";
import { eq } from "drizzle-orm";

export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    /**
     * 1. Extract access token
     */
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token is missing");
    }

    const token = authHeader.split(" ")[1];

    /**
     * 2. Verify and decode token
     */
    const decoded = verifyToken(
      token as string,
      configs.jwt.accessToken.secret,
    );

    if (!decoded?.email) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token");
    }

    /**
     * 3. Fetch user
     */
    const user = await db.query.users.findFirst({
      where: {
        email: decoded.email,
      },
    });
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    /**
     * 4. Account status checks
     */
    if (user.status === "blocked") {
      throw new ForbiddenError("Your account has been blocked");
    }

    if (user.status === "deactivated") {
      throw new AppError(httpStatus.GONE, "Your account has been deactivated");
    }

    if (!user.is_otp_verified) {
      throw new AppError(httpStatus.FORBIDDEN, "Please verify your account");
    }

    if (user.status !== "active") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is not active");
    }

    /**
     * 5. Token invalidation check
     */
    if (
      user.password_changed_at &&
      isJwtIssuedBeforePasswordChanged(
        user.password_changed_at,
        decoded.iat as number,
      )
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Token has expired. Please log in again",
      );
    }

    /**
     * 6. Role-based access control (RBAC)
     */
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to access this resource",
      );
    }

    /**
     * 7. Attach user to request
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;

    const userActivity: Partial<TInsertUser> = {};

    if (req.path.includes("login")) {
      userActivity.last_login = new Date();
    }
    userActivity.last_activity = new Date();

    await db.update(users).set(userActivity).where(eq(users.id, user.id));

    next();
  });
};
