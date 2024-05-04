import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
var crypto = require("crypto");

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_SID
);

export const sendOTP = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    // Zod validation errors
    let errorMessage: string = "Something went wrong!";

    if (typeof error.message === "string") {
      try {
        const errorObj: any[] = JSON.parse(error.message);
        errorMessage = errorObj[0]?.message || errorMessage;
      } catch (e) {
        // If parsing fails, fallback to default error message
      }
    }

    return res.status(error?.status || 400).json({
      status: error?.status || 400,
      message: errorMessage,
      error: errorMessage,
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  try {
    const verifiedResponse = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `${phoneNumber}`,
        code: otp,
      });

    return res.status(200).send({
      message: `OTP verified successfully!: ${JSON.stringify(
        verifiedResponse
      )}`,
      result: "true",
      data: { otpVerified: true },
    });
  } catch (error: any) {
    // Zod validation errors
    let errorMessage: string = "Something went wrong!";

    if (typeof error.message === "string") {
      try {
        const errorObj: any[] = JSON.parse(error.message);
        errorMessage = errorObj[0]?.message || errorMessage;
      } catch (e) {
        // If parsing fails, fallback to default error message
      }
    }

    return res.status(error?.status || 400).json({
      status: error?.status || 400,
      message: errorMessage,
      error: errorMessage,
    });
  }
};
