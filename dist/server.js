"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const routes_1 = __importDefault(require("./routes"));
const client_1 = require("@prisma/client");
const errors_1 = require("./middlewares/errors");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
const whitelist = [
    "http://localhost:4000",
    "http://localhost:5000",
    "http://104.131.18.87:5000",
];
var corsOptions = {
    origin: whitelist,
    optionsSuccessStatus: 200,
};
//cors
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
// Set up rate limiter: maximum of twenty requests per minute
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);
const PORT = process.env.PORT || 8000;
app.options("*", (0, cors_1.default)());
app.use("/api", routes_1.default);
app.get("/api", (req, res) => {
    return res.status(200).json({
        status: `screenzads backend started on port: ${PORT} in environment ${process.env.TEST_ENV}!`,
    });
});
exports.prismaClient = new client_1.PrismaClient({
    log: ["query"],
});
app.use(errors_1.errorMiddleware);
app.listen(PORT, () => console.log(`listening on ${PORT}`));
