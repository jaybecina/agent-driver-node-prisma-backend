"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableEntity = void 0;
const roots_1 = require("./roots");
class UnprocessableEntity extends roots_1.HttpException {
    constructor(error, message, errorCode) {
        super(message, errorCode, 422, error);
    }
}
exports.UnprocessableEntity = UnprocessableEntity;
