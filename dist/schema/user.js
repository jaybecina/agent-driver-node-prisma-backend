"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpSchema = void 0;
const zod_1 = require("zod");
const ROLE = ["ADMIN", "AGENT_DRIVER", "AGENT", "ADVERTISER"];
exports.SignUpSchema = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    dateOfBirth: zod_1.z.string(),
    addressLine1: zod_1.z.string(),
    addressLine2: zod_1.z.string().nullable(),
    city: zod_1.z.string(),
    state: zod_1.z.string().nullable(),
    country: zod_1.z.string(),
    zipCode: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    confirmPassword: zod_1.z.string().min(6),
    role: zod_1.z.enum(ROLE),
});
