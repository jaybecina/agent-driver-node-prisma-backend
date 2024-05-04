"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer = require("multer");
const resubmit_image_controller_1 = require("../controllers/resubmit-image.controller");
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
const resubmitImageRoutes = (0, express_1.Router)();
resubmitImageRoutes.get("/get-account/:userId", resubmit_image_controller_1.getAccount);
resubmitImageRoutes.post("/resubmit-image", upload.array("imagesSource"), resubmit_image_controller_1.resubmitImage);
resubmitImageRoutes.post("/email-resubmitted-image", resubmit_image_controller_1.emailResubmittedImageDriver);
exports.default = resubmitImageRoutes;
