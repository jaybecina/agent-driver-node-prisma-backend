import { Router } from "express";
import {
  createStatistic,
  deleteStatistic,
  getStatistics,
  getStatistic,
  updateStatistic,
} from "../controllers/statistic.controller";
import { auth } from "../middlewares/verifyToken";

const statisticRoutes: Router = Router();

statisticRoutes.get("/get-statistics", auth, getStatistics);
statisticRoutes.get("/get-statistic/:id", auth, getStatistic);
statisticRoutes.post("/create-statistic", auth, createStatistic);
statisticRoutes.put("/update-statistic/:id", auth, updateStatistic);
statisticRoutes.delete("/delete-statistic/:id", auth, deleteStatistic);

export default statisticRoutes;
