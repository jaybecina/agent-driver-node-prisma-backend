import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getAccounts = async (req: Request, res: Response) => {
  const account = await prismaClient.user.findMany();

  return res.status(200).json({
    message: "Fetched all account successfully",
    result: "true",
    data: { account },
  });
};

export const getAccount = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const account = await prismaClient.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      driver: true,
    },
  });

  if (!account || !userId) {
    return res.status(404).json({
      status: 404,
      message: "User not found",
      error: "User not found",
    });
  }

  return res.status(200).json({
    message: "Fetched a account successfully",
    result: "true",
    data: { account },
  });
};

export const updateAccount = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { status } = req.body;

  const existAccount = await prismaClient.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      driver: true,
    },
  });

  if (!existAccount) {
    return res.status(404).json({
      status: 404,
      message: "This account do not exists!!",
      error: "This account do not exists!!",
    });
  }

  if (existAccount?.driver?.status !== "VERIFICATION_PENDING") {
    return res.status(404).json({
      status: 404,
      message: "The status account is not VERIFICATION_PENDING!",
      error: "The status account is not VERIFICATION_PENDING!",
    });
  }

  let payload: any = {};

  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().split("T")[0]; // yyy-mm-dd

  if (!status) {
    return res.status(400).json({
      status: 400,
      message: "Status field is required",
      error: "Status field is required",
    });
  }

  if (status === "APPROVED") {
    payload = {
      status: "APPROVED",
      dateApproved: formattedCurrentDate,
    };
  } else if (status === "DECLINED") {
    payload = {
      status: "DECLINED",
      dateDeclined: formattedCurrentDate,
    };
  } else {
  }

  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptionsApproved = {
    from: process.env.SMTP_SENDER,
    to: existAccount?.email,
    subject: "Account Approval Status",
    html: `<p>Dear Agent Driver,</p>
              <p>Your account approval status has been updated.</p>
              <p>Status: ${status}</p>
              <pCongratulations! Your account has been approved.</p>
              <p>Please proceed to the next step by clicking the link below:</p>
              <p><a href="${process.env.FRONTEND_BASE_URL}/agent-driver/payment">Go to Next Step</a></p>
              <p>If you have any questions, feel free to reach out to us.</p>`,
  };

  const mailOptionsDeclined = {
    from: process.env.SMTP_SENDER,
    to: existAccount?.email,
    subject: "Account Approval Status",
    html: `<p>Dear Agent Driver,</p>
              <p>Your account approval status has been updated.</p>
              <p>Status: ${status}</p>
              <p>"We regret to inform you that your account has been declined.</p>
              <p>If you have any questions, feel free to reach out to us.</p>`,
  };

  const mailOptionsResubmitImage = {
    from: process.env.SMTP_SENDER,
    to: existAccount?.email,
    subject: "Account Approval Status",
    html: `<p>Dear Agent Driver,</p>
             <p>Your account was verified by the approver and you need to resubmit images with the requirements met and of good quality to process reverification.</p>
             <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
             <p>Please proceed to the next step by clicking the link below:</p>
             <p><a href="${process.env.FRONTEND_BASE_URL}/agent-driver/resubmit-image/${userId}">Go to Next Step</a></p>`,
  };

  transporter.sendMail(
    status === "APPROVED"
      ? mailOptionsApproved
      : status === "DECLINED"
      ? mailOptionsDeclined
      : mailOptionsResubmitImage,
    (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: 500,
          message: "Failed to send email!",
          error: "Failed to send email!",
        });
      }
      console.log("Email sent:", info.response);
      return res.status(200).json({
        message: "Email sent successfully to the Agent Driver",
      });
    }
  );

  if (status === "APPROVED" || status === "DECLINED") {
    const account = await prismaClient.driver.update({
      where: { id: existAccount?.driver?.id },
      data: {
        ...payload,
      },
    });

    return res.status(200).json({
      message: `You have successfully ${status} the account and email has been sent to the account`,
      result: "true",
      data: { account },
    });
  } else if (status === "RESUBMITTED_IMAGE") {
    return res.status(200).json({
      message: `You have issued resubmission of image to the account and email has been sent to the account`,
      result: "true",
    });
  }
};
