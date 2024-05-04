"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneTimePaymentWebhook = exports.createCheckoutSession = exports.createCharge = exports.addCard = exports.createCustomer = exports.createProduct = exports.createPaymentIntent = void 0;
const server_1 = require("../server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const micro_1 = require("micro");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(`${process.env.STRIPE_SECRET_KEY}`);
const createPaymentIntent = async (req, res) => {
    var _a;
    const { amount, currency } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
        });
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error("Error creating payment intent:", error);
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const createProduct = async (req, res) => {
    var _a;
    try {
        const { name, description, active, default_price } = req.body;
        const productInfo = {
            name: "Screen 1",
            description: "Roof Screen Size 50 inches",
            active: true,
        };
        const product = await stripe.products.create(productInfo);
        console.log("product: ", product);
        if (product === null || product === void 0 ? void 0 : product.id) {
            // Create price for the product
            const price = await stripe.prices.create({
                unit_amount: default_price, // Price in cents
                currency: "usd", // Change this to your desired currency
                product: product.id,
            });
            console.log("price: ", price);
            if (price === null || price === void 0 ? void 0 : price.id) {
                const productTbl = await server_1.prismaClient.product.create({
                    data: {
                        name,
                        description,
                        active,
                        default_price,
                        stripeProductId: product.id,
                        stripePriceId: price.id,
                    },
                });
                console.log("productTbl: ", productTbl);
                return res.status(200).json({
                    message: "Created a payment success",
                    result: "true",
                    data: { product },
                });
            }
        }
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.createProduct = createProduct;
const createCustomer = async (req, res) => {
    var _a;
    try {
        const { name, email, phone } = req.body;
        const customer = await stripe.customers.create({
            name,
            email,
            phone,
        });
        if (customer === null || customer === void 0 ? void 0 : customer.id) {
            const customerTbl = await server_1.prismaClient.customer.create({
                data: {
                    name,
                    email,
                    phone,
                    stripeCustomerId: customer.id,
                },
            });
            console.log("customer: ", customer);
            console.log("customerTbl: ", customerTbl);
            return res.status(200).send({
                message: "Created a vehicle success",
                result: "true",
                data: { customer },
            });
            console.log(customer.id);
        }
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.createCustomer = createCustomer;
const addCard = async (req, res) => {
    var _a;
    try {
        const { customer_id, card_name, card_expYear, card_expMonth, card_number, card_cvc, } = req.body;
        const card_token = await stripe.tokens.create({
            card: {
                name: card_name,
                number: card_number,
                exp_year: card_expYear,
                exp_month: card_expMonth,
                cvc: card_cvc,
            },
        });
        const card = await stripe.customers.createSource(customer_id, {
            source: `${card_token.id}`,
        });
        return res.status(200).send({
            message: "Created a vehicle success",
            result: "true",
            data: { card },
        });
    }
    catch (error) {
        console.log(error);
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.addCard = addCard;
const createCharge = async (req, res) => {
    var _a;
    try {
        const { email, amount, card_id, description, customer_id } = req.body;
        const createCharges = await stripe.charges.create({
            receipt_email: email,
            amount: amount,
            currency: "USD",
            description,
            customer: customer_id,
        });
        if (createCharges) {
            const charges = await server_1.prismaClient.charges.create({
                data: {
                    email,
                    amount,
                    card_id,
                    description,
                    customer_id,
                    stripeChargeId: createCharges.id,
                },
            });
            console.log("charges: ", charges);
            return res.status(200).send({
                message: "Created a vehicle success",
                result: "true",
                data: { createCharges },
            });
        }
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.createCharge = createCharge;
// easiest way to have payment
const createCheckoutSession = async (req, res) => {
    var _a;
    try {
        const { productName, productDescription, productPrice } = req.body;
        const lineItem = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: productName,
                        description: productDescription,
                    },
                    unit_amount: Math.round(productPrice * 100),
                },
                quantity: 1,
            },
        ];
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItem,
            mode: "payment",
            success_url: `${process.env.FRONTEND_BASE_URL}/agent-driver/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_BASE_URL}/agent-driver/payment`,
        }, {
            apiKey: process.env.STRIPE_SECRET_KEY,
        });
        return res.status(200).json({ id: session.id });
        // if (session) {
        //   const charges = await prismaClient.charges.create({
        //     data: {
        //       email,
        //       amount,
        //       card_id,
        //       description,
        //       customer_id,
        //       stripeChargeId: createCharges.id,
        //     },
        //   });
        //   console.log("charges: ", charges);
        //   res.status(200).send({
        //     message: "Created a vehicle success",
        //     result: "true",
        //     data: { createCharges },
        //   });
        // }
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.createCheckoutSession = createCheckoutSession;
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
const getOneTimePaymentWebhook = async (req, res) => {
    var _a;
    console.log("getPaymentWebhook");
    const reqBuffer = await (0, micro_1.buffer)(req);
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        // Handle the event
        if (event.type === "checkout.session.completed") {
            console.log(event);
            const sessionDetails = await stripe.checkout.sessions.retrieve(event.data.object.id, {
                expand: ["line_items", "customer"],
            });
            const lineItems = sessionDetails.line_items;
            console.log("Paid for items: - \n", lineItems === null || lineItems === void 0 ? void 0 : lineItems.data);
            const customerDetails = sessionDetails.customer_details;
            if (event.data.object.payment_status === "paid") {
                console.log("Payment Success for customer:-", customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.email);
                console.log("Payment Success line items:-", lineItems === null || lineItems === void 0 ? void 0 : lineItems.data);
                // const paymentIntentSucceeded = await prismaClient.payment.create({
                //   data: {
                //     customer_email: customerDetails?.email,
                //     amount: event.data.object.amount_total
                //       ? event.data.object.amount_total / 100
                //       : 0,
                //     paymentId: event.data.object.id,
                //     paymentStatus: event.data.object.payment_status,
                //     paymentDate: event.data.object.created,
                //   },
                // });
                // console.log("paymentIntentSucceeded : ", paymentIntentSucceeded);
            }
            return res
                .status(200)
                .send({
                message: "Payment successful",
                result: "true",
            })
                .end();
        }
        console.log("event.type: ", event.type);
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.getOneTimePaymentWebhook = getOneTimePaymentWebhook;
