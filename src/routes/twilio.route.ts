import { Router } from "express";
import { sendOTP, verifyOTP } from "../controllers/twilio.controller";

const twilioRoutes: Router = Router();

twilioRoutes.post("/send-otp", sendOTP);
twilioRoutes.post("/verify-otp", verifyOTP);

export default twilioRoutes;
