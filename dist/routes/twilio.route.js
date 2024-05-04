"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const twilio_controller_1 = require("../controllers/twilio.controller");
const twilioRoutes = (0, express_1.Router)();
twilioRoutes.post("/send-otp", twilio_controller_1.sendOTP);
twilioRoutes.post("/verify-otp", twilio_controller_1.verifyOTP);
exports.default = twilioRoutes;
