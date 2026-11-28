import type { db } from "../db";

export type TTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
