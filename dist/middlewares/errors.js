"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (error, req, res, next) => {
    return res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        errorCode: error.errorCode,
        error: error.errors,
    });
};
exports.errorMiddleware = errorMiddleware;
