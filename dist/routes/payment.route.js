"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
// import { upload } from "../lib/s3Config";
const paymentRoutes = (0, express_1.Router)();
paymentRoutes.post("/create-customer", payment_controller_1.createCustomer);
paymentRoutes.post("/add-card", payment_controller_1.addCard);
paymentRoutes.post("/create-charge", payment_controller_1.createCharge);
paymentRoutes.post("/create-product", payment_controller_1.createProduct);
paymentRoutes.post("/create-checkout-session", payment_controller_1.createCheckoutSession);
paymentRoutes.post("/create-payment-intent", payment_controller_1.createPaymentIntent); // used for onInit in FE payment elements
paymentRoutes.post("/webhook-onetime-payment", payment_controller_1.getOneTimePaymentWebhook);
// paymentRoutes.post(
//   "/webhook-onetime-payment",
//   bodyParser.raw({ type: "application/json" }),
//   getOneTimePaymentWebhook
// );
exports.default = paymentRoutes;
