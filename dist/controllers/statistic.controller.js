"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStatistic = exports.updateStatistic = exports.createStatistic = exports.getStatistic = exports.getStatistics = void 0;
const server_1 = require("../server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getStatistics = async (req, res) => {
    const statistics = await server_1.prismaClient.statistic.findMany();
    return res.status(200).json({
        message: "Fetched all statistics success",
        result: "true",
        data: { statistics },
    });
};
exports.getStatistics = getStatistics;
const getStatistic = async (req, res) => {
    const statisticId = req.params.id;
    const statistic = await server_1.prismaClient.statistic.findUnique({
        where: { id: parseInt(statisticId) },
    });
    return res.status(200).json({
        message: "Fetched a statistic success",
        result: "true",
        data: { statistic },
    });
};
exports.getStatistic = getStatistic;
const createStatistic = async (req, res) => {
    const { earnings, milesDriven, dateStart, dateEnd, driverId, vehicleId } = req.body;
    console.log("createStatistic");
    const statistic = await server_1.prismaClient.statistic.create({
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
exports.createStatistic = createStatistic;
const updateStatistic = async (req, res) => {
    const statisticId = req.params.id;
    const { earnings, milesDriven, dateStart } = req.body;
    const statistic = await server_1.prismaClient.statistic.update({
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
exports.updateStatistic = updateStatistic;
const deleteStatistic = async (req, res) => {
    const statisticId = req.params.id;
    console.log("deleteStatistic");
    const statistic = await server_1.prismaClient.statistic.delete({
        where: { id: parseInt(statisticId) },
    });
    return res.status(200).json({
        message: "Deleted a statistic success",
        result: "true",
        data: { statistic },
    });
};
exports.deleteStatistic = deleteStatistic;
