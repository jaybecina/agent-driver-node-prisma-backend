import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface IGetUserAuthInfoRequest extends Request {
  user: any; // or any other type
}

export const SECRET_KEY: any = process.env.JWT_SECRET;

export interface CustomRequest extends Request {
  token: string | JwtPayload;
  user?: any;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // const token = req.header("Authorization")?.replace("Bearer ", "");
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    // const decoded = jwt.verify(token, SECRET_KEY);
    // (req as CustomRequest).token = decoded;

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
      if (err) {
        console.log("Invalid token. Unauthenticated!");
        return res.status(401).json({
          status: 401,
          message: "Invalid token. Unauthenticated!",
          error: "Invalid token. Unauthenticated!",
        });
      }

      (req as CustomRequest).user = user;
      next();
    });
  } else {
    res.status(401).json({
      status: 401,
      message: "Unauthenticated!",
      error: "Unauthenticated!",
    });
  }
};
