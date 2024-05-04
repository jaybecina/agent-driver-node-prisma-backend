import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  getVehicles,
  updateVehicle,
} from "../controllers/vehicle.controller";
import { auth } from "../middlewares/verifyToken";

const vehicleRoutes: Router = Router();

vehicleRoutes.get("/get-vehicles", auth, getVehicles);
vehicleRoutes.get("/get-vehicle/:id", auth, getVehicle);
vehicleRoutes.post("/create-vehicle", createVehicle);
vehicleRoutes.put("/update-vehicle/:id", auth, updateVehicle);
vehicleRoutes.delete("/delete-vehicle/:id", auth, deleteVehicle);

export default vehicleRoutes;
