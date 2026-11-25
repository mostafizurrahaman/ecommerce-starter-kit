import { defineRelations } from "drizzle-orm";
import { users } from "../schemas/users";
import { otps } from "../schemas/otp";
import { categories } from "../schemas/categories";

export const relations = defineRelations({ users, otps, categories }, (r) => ({
  //   user relations: (ami hocce user)
  users: {
    otps: r.one.otps({
      from: r.users.id, // ami users a aci
      to: r.otps.user_id, // jacci otp te
    }),
  },

  // otp relations:
  otps: {
    users: r.one.users({
      from: r.otps.user_id, // ami otp te
      to: r.users.id, // jacci otp te
      optional: false, // users kokhono optoinal hove na.
    }),
  },

  categories: {
    parent: r.one.categories({
      from: r.categories.parent_id,
      to: r.categories.id
    }),
    children: r.many.categories({
      from: r.categories.id,
      to: r.categories.parent_id,
    })
  }
}));
