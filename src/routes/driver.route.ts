import { Router } from "express";
const aws = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
import dotenv from "dotenv";
dotenv.config();
import {
  createDriver,
  deleteDriver,
  deleteImage,
  emailCreatedDriver,
  getDriver,
  getDrivers,
  updateDriver,
} from "../controllers/driver.controller";
import { auth } from "../middlewares/verifyToken";

// Change bucket property to your Space name
const storage = multer.memoryStorage();
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
});

const driverRoutes: Router = Router();

driverRoutes.get("/get-drivers", auth, getDrivers);
driverRoutes.get("/get-driver/:id", auth, getDriver);
driverRoutes.post("/create-driver", upload.array("imagesSource"), createDriver);
driverRoutes.put("/update-driver/:id", auth, updateDriver);
driverRoutes.delete("/delete-driver/:id", auth, deleteDriver);
driverRoutes.post("/email-created-driver", emailCreatedDriver);
driverRoutes.delete("/delete-image/:userId", deleteImage);

export default driverRoutes;
