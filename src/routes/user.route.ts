import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller";
import { auth } from "../middlewares/verifyToken";

const userRoutes: Router = Router();

userRoutes.get("/get-users", auth, getUsers);
userRoutes.get("/get-user/:id", auth, getUser);
userRoutes.put("/update-user/:id", auth, updateUser);
userRoutes.delete("/delete-user/:id", auth, deleteUser);

export default userRoutes;
