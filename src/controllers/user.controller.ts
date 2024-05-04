import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany();

  return res.status(200).json({
    message: "Fetched all users success",
    result: "true",
    data: { users },
  });
};

export const getUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = await prismaClient.user.findUnique({
    where: { id: parseInt(userId) },
  });

  return res.status(200).json({
    message: "Fetched a user success",
    result: "true",
    data: { user },
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const {
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
  } = req.body;

  const user = await prismaClient.user.update({
    where: { id: parseInt(userId) },
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
    },
  });

  return res.status(200).json({
    message: "Updated a user success",
    result: "true",
    data: { user },
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await prismaClient.user.delete({
    where: { id: parseInt(userId) },
  });

  return res.status(200).json({
    message: "Deleted a user success",
    result: "true",
    data: { user },
  });
};
