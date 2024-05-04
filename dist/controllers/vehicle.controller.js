"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicle = exports.getVehicles = void 0;
const server_1 = require("../server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getVehicles = async (req, res) => {
    const vehicles = await server_1.prismaClient.vehicle.findMany();
    return res.status(200).json({
        message: "Fetched all vehicles success",
        result: "true",
        data: { vehicles },
    });
};
exports.getVehicles = getVehicles;
const getVehicle = async (req, res) => {
    const vehicleId = req.params.id;
    const vehicle = await server_1.prismaClient.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
    });
    return res.status(200).json({
        message: "Fetched a vehicle success",
        result: "true",
        data: { vehicle },
    });
};
exports.getVehicle = getVehicle;
const createVehicle = async (req, res) => {
    const { vehicleMake, vehicleModel, vehicleYear, driverId } = req.body;
    console.log("createVehicle");
    const vehicle = await server_1.prismaClient.vehicle.create({
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
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    const vehicleId = req.params.id;
    const { vehicleMake, vehicleModel, vehicleYear } = req.body;
    const vehicle = await server_1.prismaClient.vehicle.update({
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
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    const vehicleId = req.params.id;
    console.log("deleteVehicle");
    const vehicle = await server_1.prismaClient.vehicle.delete({
        where: { id: parseInt(vehicleId) },
    });
    return res.status(200).json({
        message: "Deleted a vehicle success",
        result: "true",
        data: { vehicle },
    });
};
exports.deleteVehicle = deleteVehicle;
