import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getStatistics = async (req: Request, res: Response) => {
  const statistics = await prismaClient.statistic.findMany();

  return res.status(200).json({
    message: "Fetched all statistics success",
    result: "true",
    data: { statistics },
  });
};

export const getStatistic = async (req: Request, res: Response) => {
  const statisticId = req.params.id;
  const statistic = await prismaClient.statistic.findUnique({
    where: { id: parseInt(statisticId) },
  });

  return res.status(200).json({
    message: "Fetched a statistic success",
    result: "true",
    data: { statistic },
  });
};

export const createStatistic = async (req: Request, res: Response) => {
  const { earnings, milesDriven, dateStart, dateEnd, driverId, vehicleId } =
    req.body;

  console.log("createStatistic");

  const statistic = await prismaClient.statistic.create({
    data: {
      earnings,
      milesDriven,
      dateStart,
      dateEnd,
      driverId,
      vehicleId,
    },
  });

  return res.status(200).json({
    message: "Created a statistic success",
    result: "true",
    data: { statistic },
  });
};

export const updateStatistic = async (req: Request, res: Response) => {
  const statisticId = req.params.id;
  const { earnings, milesDriven, dateStart } = req.body;

  const statistic = await prismaClient.statistic.update({
    where: { id: parseInt(statisticId) },
    data: {
      earnings,
      milesDriven,
      dateStart,
    },
  });

  return res.status(200).json({
    message: "Updated a statistic success",
    result: "true",
    data: { statistic },
  });
};

export const deleteStatistic = async (req: Request, res: Response) => {
  const statisticId = req.params.id;

  console.log("deleteStatistic");

  const statistic = await prismaClient.statistic.delete({
    where: { id: parseInt(statisticId) },
  });

  return res.status(200).json({
    message: "Deleted a statistic success",
    result: "true",
    data: { statistic },
  });
};
