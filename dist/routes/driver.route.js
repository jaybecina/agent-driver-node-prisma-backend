"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aws = require("aws-sdk");
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const driver_controller_1 = require("../controllers/driver.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
// Change bucket property to your Space name
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    }
    else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1000000000, files: 2 },
});
const driverRoutes = (0, express_1.Router)();
driverRoutes.get("/get-drivers", verifyToken_1.auth, driver_controller_1.getDrivers);
driverRoutes.get("/get-driver/:id", verifyToken_1.auth, driver_controller_1.getDriver);
driverRoutes.post("/create-driver", upload.array("imagesSource"), driver_controller_1.createDriver);
driverRoutes.put("/update-driver/:id", verifyToken_1.auth, driver_controller_1.updateDriver);
driverRoutes.delete("/delete-driver/:id", verifyToken_1.auth, driver_controller_1.deleteDriver);
driverRoutes.post("/email-created-driver", driver_controller_1.emailCreatedDriver);
driverRoutes.delete("/delete-image/:userId", driver_controller_1.deleteImage);
exports.default = driverRoutes;
