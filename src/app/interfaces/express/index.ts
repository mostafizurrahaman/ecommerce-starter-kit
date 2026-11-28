import type { TGetUser } from "@/app/db/schemas";

declare global {
  namespace Express {
    interface Request {
      user: TGetUser;
      validQuery: any;
    }
  }
}

export {};
