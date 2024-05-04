"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_approval_controller_1 = require("../controllers/account-approval.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const accountApprovalRoutes = (0, express_1.Router)();
accountApprovalRoutes.get("/get-account/:userId", verifyToken_1.auth, account_approval_controller_1.getAccount);
accountApprovalRoutes.put("/update-account/:userId", verifyToken_1.auth, account_approval_controller_1.updateAccount);
exports.default = accountApprovalRoutes;
