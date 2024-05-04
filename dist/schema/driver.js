"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverSchema = void 0;
const zod_1 = require("zod");
exports.DriverSchema = zod_1.z.object({
    dl: zod_1.z.string(),
    lp: zod_1.z.string(),
    driveHours: zod_1.z.string(),
    ssn: zod_1.z.string(),
    preferredLoc: zod_1.z.string(),
    dateRegistered: zod_1.z.string(),
});
