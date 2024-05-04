"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const driver_route_1 = __importDefault(require("./driver.route"));
const vehicle_route_1 = __importDefault(require("./vehicle.route"));
const statistic_route_1 = __importDefault(require("./statistic.route"));
const payment_route_1 = __importDefault(require("./payment.route"));
const twilio_route_1 = __importDefault(require("./twilio.route"));
const account_approval_route_1 = __importDefault(require("./account-approval.route"));
const resubmit_image_route_1 = __importDefault(require("./resubmit-image.route"));
const rootRouter = (0, express_1.Router)();
rootRouter.use("/auth", auth_route_1.default);
rootRouter.use("/user", user_route_1.default);
rootRouter.use("/driver", driver_route_1.default);
rootRouter.use("/vehicle", vehicle_route_1.default);
rootRouter.use("/statistic", statistic_route_1.default);
rootRouter.use("/payment", payment_route_1.default);
rootRouter.use("/otp", twilio_route_1.default);
rootRouter.use("/account-approval", account_approval_route_1.default);
rootRouter.use("/resubmit-image", resubmit_image_route_1.default);
exports.default = rootRouter;
