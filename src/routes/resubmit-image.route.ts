import { Router } from "express";
const multer = require("multer");
import {
  getAccount,
  resubmitImage,
  emailResubmittedImageDriver,
} from "../controllers/resubmit-image.controller";

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

const resubmitImageRoutes: Router = Router();

resubmitImageRoutes.get("/get-account/:userId", getAccount);
resubmitImageRoutes.post(
  "/resubmit-image",
  upload.array("imagesSource"),
  resubmitImage
);
resubmitImageRoutes.post(
  "/email-resubmitted-image",
  emailResubmittedImageDriver
);

export default resubmitImageRoutes;
