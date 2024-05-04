import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../server";
import { hashSync, compareSync } from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { BadRequestsException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/roots";
import { UnprocessableEntity } from "../exceptions/validation";
import { SignUpSchema } from "../schema/user";

const SECRET_KEY = process.env.JWT_SECRET!;

// Define your role
const roleArr: string[] = ["ADMIN", "AGENT_DRIVER", "AGENT", "ADVERTISER"];

// Function to check if role is valid
export function isValidRole(role: string): boolean {
  return roleArr.includes(role);
}

export const signup = async (req: Request, res: Response) => {
  try {
    SignUpSchema.parse(req.body);

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      dateOfBirth,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zipCode,
      role,
    } = req.body;

    let user = await prismaClient.user.findFirst({ where: { email } });

    console.log("signup user: ", user);

    if (user) {
      return res.status(500).json({
        status: 500,
        message: "User already exists!",
        error: "User already exists!",
      });
      // next(
      //   new BadRequestsException(
      //     "User already exists!",
      //     ErrorCode.USER_ALREADY_EXISTS
      //   )
      // );
    }

    if (!isValidRole(role)) {
      return res.status(500).json({
        status: 500,
        message: "Invalid role provided!",
        error: "Invalid role provided!",
      });
      // throw new Error("Invalid role provided");
      // next(
      //   new BadRequestsException(
      //     "Invalid role provided!",
      //     ErrorCode.INVALID_ROLE_PROVIDED
      //   )
      // );
    }

    if (confirmPassword !== password) {
      return res.status(500).send({
        status: 500,
        message: "Password does not match with confirm password!",
        error: "Password does not match with confirm password!",
      });
      // throw new Error("Password does not match with confirm password!");
      // next(
      //   new BadRequestsException(
      //     "Password does not match with confirm password!",
      //     ErrorCode.PASSWORD_NOT_MATCH
      //   )
      // );
    }

    if (role === "AGENT_DRIVER") {
      user = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
          dateOfBirth,
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          zipCode,
          email,
          password: hashSync(password, 10),
          role,
        },
      });
    } else {
      user = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
          dateOfBirth,
          city,
          state,
          country,
          zipCode,
          addressLine1,
          addressLine2,
          email,
          password: hashSync(password, 10),
          role,
        },
      });
    }

    return res.status(200).json({
      message:
        "Created a driver account successfully. Please check your email for approval of your account",
      result: "true",
      data: { user },
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
    // return res.status(422).json({
    //   status: 422,
    //   message: "Please fill all the required fields!",
    //   error: "Please fill all the required fields!",
    // });
    // throw new Error("There is something wrong in your input field!");
    // next(
    //   new UnprocessableEntity(
    //     error?.issues,
    //     "There is something wrong in your input field!",
    //     ErrorCode.UNPROCESSABLE_ENTITY
    //   )
    // );
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log(req.body);

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    return res.status(500).json({
      status: 500,
      message: "User does not exists!",
      error: "User does not exists!",
    });
  }

  if (!compareSync(password, user!.password)) {
    return res.status(500).json({
      status: 500,
      message: "Password is incorrect!",
      error: "Password is incorrect!",
    });
  }
  const accessToken = jwt.sign(
    {
      userId: user!.id,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign({ user }, SECRET_KEY, { expiresIn: "7d" });

  return res.status(200).json({
    message: "Login success",
    result: "true",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const refresh = async (req: Request, res: Response) => {
  // Retrieve the refresh token from the request payload
  const { email, refreshToken } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    return res.status(500).json({
      status: 500,
      message: "User does not exists!",
      error: "User does not exists!",
    });
  }

  if (!refreshToken) {
    return res.status(401).json({
      status: 401,
      message: "Access Denied. No refresh token provided!",
      error: "Access Denied. No refresh token provided!",
    });
  }

  try {
    // Verify the refresh token
    const decoded: any = jwt.verify(refreshToken, SECRET_KEY);

    // If the token is valid, generate a new access token
    const newAccessToken = jwt.sign({ user: decoded.user }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Refresh token success",
      result: "true",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: "Invalid refresh token!",
      error: "Invalid refresh token!",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Generate a random token for password reset
  const token = randomBytes(20).toString("hex");

  console.log("forgotPassword email: ", email);

  try {
    // Check existing user
    let user = await prismaClient.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(500).json({
        status: 500,
        message: "Email does not exists!",
        error: "Email does not exists!",
      });
    }

    // Save the token in the database
    await prismaClient.user.update({
      where: { id: user?.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // Token expires in 1 hour
      },
    });

    // Send email with the password reset link
    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: email,
      subject: "Password Reset",
      html: `<p>You are receiving this email because you  have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p><a href="${process.env.FRONTEND_BASE_URL}/reset/${token}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: 500,
          message: "Failed to send email",
          error: "Failed to send email",
        });
      }
      console.log("Email sent:", info.response);
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
      error: "Something went wrong!",
    });
  }

  return res.status(200).json({ message: "Email sent successfully" });
};

export const resetPassword = async (req: Request, res: Response) => {
  console.log("reset password");
  const { resetPasswordToken, newPassword, confirmPassword } = req.body;

  try {
    // Find the user by the reset password token
    const user = await prismaClient.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpires: {
          gte: new Date(), // Check if the token hasn't expired
        },
      },
    });

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).json({
        status: 400,
        message: "Invalid or expired token",
        error: "Invalid or expired token",
      });
      // throw new Error("New password does not match with confirm password!");
    }

    if (confirmPassword !== newPassword) {
      console.log("New password does not match with confirm password!");
      return res.status(500).json({
        status: 500,
        message: "New password does not match with confirm password!",
        error: "New password does not match with confirm password!",
      });
      // throw new Error("New password does not match with confirm password!");
    }

    console.log("userid : ", user.id);

    // Update the user's password and clear the reset token and expiration
    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        password: hashSync(newPassword, 10),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
      error: "Something went wrong!",
    });
  }

  return res.status(200).json({ message: "Password reset successfully" });
};
