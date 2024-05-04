"use strict";
// message, status code, error codes, error
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(message, errorCode, statusCode, error) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = error;
    }
}
exports.HttpException = HttpException;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["USER_NOT_FOUND"] = 1001] = "USER_NOT_FOUND";
    ErrorCode[ErrorCode["USER_ALREADY_EXISTS"] = 1002] = "USER_ALREADY_EXISTS";
    ErrorCode[ErrorCode["INCORRECT_PASSWORD"] = 1003] = "INCORRECT_PASSWORD";
    ErrorCode[ErrorCode["INVALID_ROLE_PROVIDED"] = 1004] = "INVALID_ROLE_PROVIDED";
    ErrorCode[ErrorCode["PASSWORD_NOT_MATCH"] = 1005] = "PASSWORD_NOT_MATCH";
    ErrorCode[ErrorCode["UNPROCESSABLE_ENTITY"] = 1006] = "UNPROCESSABLE_ENTITY";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
