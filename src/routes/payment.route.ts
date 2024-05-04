import { Router } from "express";
import express from "express";
import bodyParser from "body-parser";
import {
  addCard,
  createCustomer,
  createCharge,
  createProduct,
  createCheckoutSession,
  getOneTimePaymentWebhook,
  createPaymentIntent,
} from "../controllers/payment.controller";
import { auth } from "../middlewares/verifyToken";
// import { upload } from "../lib/s3Config";

const paymentRoutes: Router = Router();

paymentRoutes.post("/create-customer", createCustomer);
paymentRoutes.post("/add-card", addCard);
paymentRoutes.post("/create-charge", createCharge);
paymentRoutes.post("/create-product", createProduct);
paymentRoutes.post("/create-checkout-session", createCheckoutSession);
paymentRoutes.post("/create-payment-intent", createPaymentIntent); // used for onInit in FE payment elements
paymentRoutes.post("/webhook-onetime-payment", getOneTimePaymentWebhook);
// paymentRoutes.post(
//   "/webhook-onetime-payment",
//   bodyParser.raw({ type: "application/json" }),
//   getOneTimePaymentWebhook
// );

export default paymentRoutes;
