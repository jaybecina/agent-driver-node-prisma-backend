import { Router } from "express";
import {
  forgotPassword,
  login,
  refresh,
  resetPassword,
  signup,
} from "../controllers/auth.controller";

const authRoutes: Router = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refresh);
authRoutes.post("/forgot", forgotPassword);
authRoutes.post("/reset", resetPassword);

export default authRoutes;
