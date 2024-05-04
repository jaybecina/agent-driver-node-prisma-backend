"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.SECRET_KEY = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SECRET_KEY = process.env.JWT_SECRET;
const auth = async (req, res, next) => {
    // const token = req.header("Authorization")?.replace("Bearer ", "");
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        // const decoded = jwt.verify(token, SECRET_KEY);
        // (req as CustomRequest).token = decoded;
        jsonwebtoken_1.default.verify(token, exports.SECRET_KEY, (err, user) => {
            if (err) {
                console.log("Invalid token. Unauthenticated!");
                return res.status(401).json({
                    status: 401,
                    message: "Invalid token. Unauthenticated!",
                    error: "Invalid token. Unauthenticated!",
                });
            }
            req.user = user;
            next();
        });
    }
    else {
        res.status(401).json({
            status: 401,
            message: "Unauthenticated!",
            error: "Unauthenticated!",
        });
    }
};
exports.auth = auth;
