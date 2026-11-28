import express, { Router } from "express";
import { authRoutes } from "../module/Auth";

const router: Router = express();

const routes = [
  {
    path: "/auth",
    route: authRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export const allRoutes = router;
