"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestsException = void 0;
const roots_1 = require("./roots");
class BadRequestsException extends roots_1.HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 400, null);
    }
}
exports.BadRequestsException = BadRequestsException;
