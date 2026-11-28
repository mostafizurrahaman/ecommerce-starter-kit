import type { JwtPayload } from "jsonwebtoken";
import type { TUserRole, TUserStatus } from "../db/schemas";

export interface IJwtUserPayload extends JwtPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TUserRole;
  profile_image: string;
  status: TUserStatus;
}
