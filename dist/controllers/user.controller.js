"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const server_1 = require("../server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getUsers = async (req, res) => {
    const users = await server_1.prismaClient.user.findMany();
    return res.status(200).json({
        message: "Fetched all users success",
        result: "true",
        data: { users },
    });
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    const userId = req.params.id;
    const user = await server_1.prismaClient.user.findUnique({
        where: { id: parseInt(userId) },
    });
    return res.status(200).json({
        message: "Fetched a user success",
        result: "true",
        data: { user },
    });
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, dateOfBirth, addressLine1, addressLine2, city, state, country, zipCode, email, } = req.body;
    const user = await server_1.prismaClient.user.update({
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
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    const user = await server_1.prismaClient.user.delete({
        where: { id: parseInt(userId) },
    });
    return res.status(200).json({
        message: "Deleted a user success",
        result: "true",
        data: { user },
    });
};
exports.deleteUser = deleteUser;
