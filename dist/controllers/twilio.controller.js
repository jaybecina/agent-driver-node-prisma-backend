"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var crypto = require("crypto");
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_SID);
const sendOTP = async (req, res) => {
    var _a;
    const { phoneNumber } = req.body;
    try {
        const otpResponse = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({
            to: `${phoneNumber}`,
            channel: "sms",
        });
        return res.status(200).send({
            message: `OTP send successfully!: ${JSON.stringify(otpResponse)}`,
            result: "true",
        });
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res) => {
    var _a;
    const { phoneNumber, otp } = req.body;
    try {
        const verifiedResponse = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({
            to: `${phoneNumber}`,
            code: otp,
        });
        return res.status(200).send({
            message: `OTP verified successfully!: ${JSON.stringify(verifiedResponse)}`,
            result: "true",
            data: { otpVerified: true },
        });
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.verifyOTP = verifyOTP;
