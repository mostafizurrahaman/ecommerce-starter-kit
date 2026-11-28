/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request } from "express";
import type { IJwtUserPayload } from "@/app/interfaces";
// import { User } from "@/app/modules/User";
import { UnauthorizedError } from "@/app/errors";
import { db } from "../db";

export const getUserFromRequest = async (req: Request) => {
  const jwtUser = (req as any)?.user as IJwtUserPayload;

  const user = await db.query.users.findFirst({
    where: {
      email: jwtUser.email,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found.");
  }

  return user;
};
