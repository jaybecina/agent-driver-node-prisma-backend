"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statistic_controller_1 = require("../controllers/statistic.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const statisticRoutes = (0, express_1.Router)();
statisticRoutes.get("/get-statistics", verifyToken_1.auth, statistic_controller_1.getStatistics);
statisticRoutes.get("/get-statistic/:id", verifyToken_1.auth, statistic_controller_1.getStatistic);
statisticRoutes.post("/create-statistic", verifyToken_1.auth, statistic_controller_1.createStatistic);
statisticRoutes.put("/update-statistic/:id", verifyToken_1.auth, statistic_controller_1.updateStatistic);
statisticRoutes.delete("/delete-statistic/:id", verifyToken_1.auth, statistic_controller_1.deleteStatistic);
exports.default = statisticRoutes;
