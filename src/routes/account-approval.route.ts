import { Router } from "express";
import {
  getAccount,
  updateAccount,
} from "../controllers/account-approval.controller";
import { auth } from "../middlewares/verifyToken";

const accountApprovalRoutes: Router = Router();

accountApprovalRoutes.get("/get-account/:userId", auth, getAccount);
accountApprovalRoutes.put("/update-account/:userId", auth, updateAccount);

export default accountApprovalRoutes;
