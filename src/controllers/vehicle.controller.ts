import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getVehicles = async (req: Request, res: Response) => {
  const vehicles = await prismaClient.vehicle.findMany();

  return res.status(200).json({
    message: "Fetched all vehicles success",
    result: "true",
    data: { vehicles },
  });
};

export const getVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.id;
  const vehicle = await prismaClient.vehicle.findUnique({
    where: { id: parseInt(vehicleId) },
  });

  return res.status(200).json({
    message: "Fetched a vehicle success",
    result: "true",
    data: { vehicle },
  });
};

export const createVehicle = async (req: Request, res: Response) => {
  const { vehicleMake, vehicleModel, vehicleYear, driverId } = req.body;

  console.log("createVehicle");

  const vehicle = await prismaClient.vehicle.create({
    data: {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      driverId,
    },
  });

  return res.status(200).json({
    message: "Created a vehicle success",
    result: "true",
    data: { vehicle },
  });
};

export const updateVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.id;
  const { vehicleMake, vehicleModel, vehicleYear } = req.body;

  const vehicle = await prismaClient.vehicle.update({
    where: { id: parseInt(vehicleId) },
    data: {
      vehicleMake,
      vehicleModel,
      vehicleYear,
    },
  });

  return res.status(200).json({
    message: "Updated a vehicle success",
    result: "true",
    data: { vehicle },
  });
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const vehicleId = req.params.id;

  console.log("deleteVehicle");

  const vehicle = await prismaClient.vehicle.delete({
    where: { id: parseInt(vehicleId) },
  });

  return res.status(200).json({
    message: "Deleted a vehicle success",
    result: "true",
    data: { vehicle },
  });
};
