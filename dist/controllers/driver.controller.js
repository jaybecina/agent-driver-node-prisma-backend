"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.emailCreatedDriver = exports.deleteDriver = exports.updateDriver = exports.createDriver = exports.getDriver = exports.getDrivers = void 0;
const server_1 = require("../server");
const s3Config_1 = __importDefault(require("../lib/s3Config"));
const mime = __importStar(require("mime-types"));
const uuid = require("uuid").v4;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getDrivers = async (req, res) => {
    const drivers = await server_1.prismaClient.driver.findMany();
    return res.status(200).json({
        message: "Fetched all drivers success",
        result: "true",
        data: { drivers },
    });
};
exports.getDrivers = getDrivers;
const getDriver = async (req, res) => {
    const driverId = req.params.id;
    const driver = await server_1.prismaClient.driver.findUnique({
        where: { id: parseInt(driverId) },
    });
    return res.status(200).json({
        message: "Fetched a driver success",
        result: "true",
        data: { driver },
    });
};
exports.getDriver = getDriver;
const createDriver = async (req, res) => {
    var _a, _b;
    try {
        // DriverSchema.parse(req.body);
        const { dl, ssn, lp, driveHours, employedDC, preferredLoc, dateRegistered, userId, } = req.body;
        console.log("createDriver req.body: ", req.body);
        console.log("req.files: ", req.files);
        const driver = await server_1.prismaClient.driver.create({
            data: {
                dl,
                ssn,
                lp,
                driveHours,
                employedDC,
                preferredLoc,
                dateRegistered,
                userId: parseInt(userId),
            },
        });
        let images = {
            images: null,
        };
        // Save metadata to Prisma database
        if (driver && req.files) {
            console.log("if (driver): ", driver);
            const files = Array.isArray(req.files) ? req.files : [req.files];
            try {
                await Promise.all(files.map(async (file) => {
                    if (!file)
                        return;
                    const imageData = Buffer.from(file.buffer);
                    console.log("imageData: ", imageData);
                    console.log("uploading fileSource...");
                    console.log("file.mimetype: ", file.mimetype);
                    const type = mime.extension(file.mimetype);
                    const originalname = `${uuid()}.${type}`;
                    console.log("originalname: ", originalname);
                    const data = {
                        Bucket: process.env.DO_BUCKET_NAME,
                        Key: `drivers/${originalname}`,
                        Body: imageData,
                        ContentType: file.mimetype,
                        ACL: "public-read",
                    };
                    await s3Config_1.default
                        .putObject(data, function (err, data) {
                        if (err) {
                            console.log(err);
                            console.log("Error uploading data: ", data);
                        }
                        else {
                            console.log("successfully uploaded the image!");
                        }
                    })
                        .promise();
                    const driverImage = await server_1.prismaClient.driverImage.create({
                        data: {
                            originalname,
                            driverId: driver.id,
                        },
                    });
                    console.log("saving image succes: ", driverImage);
                    console.log("success upload: ", data);
                }));
            }
            catch (error) {
                // Zod validation errors
                let errorMessage = "Something went wrong!";
                if (typeof error.message === "string") {
                    try {
                        const errorObj = JSON.parse(error.message);
                        errorMessage = ((_a = errorObj[0]) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
                    }
                    catch (e) {
                        // If parsing fails, fallback to default error message
                    }
                }
                return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
                    status: (error === null || error === void 0 ? void 0 : error.status) || 400,
                    message: errorMessage,
                    error: errorMessage,
                });
            }
            return res.status(200).json({
                message: "Created a driver success",
                result: "true",
                data: { driver },
            });
        }
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_b = errorObj[0]) === null || _b === void 0 ? void 0 : _b.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
        // return res.status(422).json({
        //   status: 422,
        //   message: "Please fill all the required fields!",
        //   error: "Please fill all the required fields!",
        // });
        // throw new Error("There is something wrong in your input field!");
        // next(
        //   new UnprocessableEntity(
        //     error?.issues,
        //     "There is something wrong in your input field!",
        //     ErrorCode.UNPROCESSABLE_ENTITY
        //   )
        // );
    }
};
exports.createDriver = createDriver;
const updateDriver = async (req, res) => {
    const driverId = req.params.id;
    const { dl, ssn, lp, driveHours, employedDC, preferredLoc, dateRegistered, dateApproved, } = req.body;
    const driver = await server_1.prismaClient.driver.update({
        where: { id: parseInt(driverId) },
        data: {
            dl,
            ssn,
            lp,
            driveHours,
            employedDC,
            preferredLoc,
            dateRegistered,
            dateApproved,
        },
    });
    return res.status(200).json({
        message: "Updated a driver success",
        result: "true",
        data: { driver },
    });
};
exports.updateDriver = updateDriver;
const deleteDriver = async (req, res) => {
    const driverId = req.params.id;
    console.log("deleteDriver");
    const driver = await server_1.prismaClient.driver.delete({
        where: { id: parseInt(driverId) },
    });
    return res.status(200).json({
        message: "Deleted a driver success",
        result: "true",
        data: { driver },
    });
};
exports.deleteDriver = deleteDriver;
const emailCreatedDriver = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const { userId } = req.body;
    console.log("createDriver");
    const user = await server_1.prismaClient.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            driver: true,
        },
    });
    if (!user) {
        return res
            .status(404)
            .json({ status: 404, message: "No user found", error: "No user found" });
    }
    if (user === null || user === void 0 ? void 0 : user.driver) {
        console.log("driverid: ", (_a = user === null || user === void 0 ? void 0 : user.driver) === null || _a === void 0 ? void 0 : _a.id);
        const driverImages = await server_1.prismaClient.driverImage.findMany({
            where: {
                driverId: (_b = user === null || user === void 0 ? void 0 : user.driver) === null || _b === void 0 ? void 0 : _b.id,
            },
        });
        const vehicle = await server_1.prismaClient.vehicle.findUnique({
            where: {
                driverId: (_c = user === null || user === void 0 ? void 0 : user.driver) === null || _c === void 0 ? void 0 : _c.id,
            },
        });
        const mergedDriverData = {
            user: {
                ...user,
                vehicle,
                driverImages,
            },
        };
        console.log("before upload do s3");
        let imgURLArray = [];
        if ((driverImages === null || driverImages === void 0 ? void 0 : driverImages.length) > 0) {
            driverImages === null || driverImages === void 0 ? void 0 : driverImages.map((imgItem) => {
                // s3 DO spaces fetch images linked
                const url = s3Config_1.default.getSignedUrl("getObject", {
                    Bucket: process.env.DO_BUCKET_NAME,
                    Key: `drivers/${imgItem.originalname}`,
                    Expires: 604800, // 7 days in seconds
                });
                imgURLArray.push(url);
            });
        }
        console.log("after upload do s3");
        console.log("imgURLArray: ", imgURLArray);
        // Gmail SMTP configuration
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        if (vehicle) {
            // Send email with the new created agent driver account link
            const mailOptions = {
                from: process.env.SMTP_SENDER,
                to: process.env.EMAIL_APPROVER,
                subject: "Approval Notification: New Agent Driver Created",
                html: `
          <p>Dear [Admin/Recipient's Name],</p>
          <p>A new agent driver has been created and is pending approval. Please review the details below and take appropriate action.</p>
          <p>Account Details:</p>
          <ul>
            <li>First Name: ${user === null || user === void 0 ? void 0 : user.firstName}</li>
            <li>Last Name: ${user === null || user === void 0 ? void 0 : user.lastName}</li>
            <li>Date of Birth: ${user === null || user === void 0 ? void 0 : user.dateOfBirth}</li>
            <li>Address Line 1: ${user === null || user === void 0 ? void 0 : user.addressLine1}</li>
            <li>Address Line 2: ${user === null || user === void 0 ? void 0 : user.addressLine2}</li>
            <li>Address Line 2: ${user === null || user === void 0 ? void 0 : user.city}</li>
            <li>Address Line 2: ${user === null || user === void 0 ? void 0 : user.state}</li>
            <li>Address Line 2: ${user === null || user === void 0 ? void 0 : user.country}</li>
            <li>Address Line 2: ${user === null || user === void 0 ? void 0 : user.zipCode}</li>
            <li>Email: ${user === null || user === void 0 ? void 0 : user.email}</li>
            <li>Role: ${user === null || user === void 0 ? void 0 : user.role}</li>
          </ul>
          <br>
          <ul>
            <li>Drivers License: ${(_d = user === null || user === void 0 ? void 0 : user.driver) === null || _d === void 0 ? void 0 : _d.dl}</li>
            <li>Drivers License: ${(_e = user === null || user === void 0 ? void 0 : user.driver) === null || _e === void 0 ? void 0 : _e.lp}</li>
            <li>Drivers License: ${(_f = user === null || user === void 0 ? void 0 : user.driver) === null || _f === void 0 ? void 0 : _f.driveHours}</li>
            <li>Drivers License: ${(_g = user === null || user === void 0 ? void 0 : user.driver) === null || _g === void 0 ? void 0 : _g.employedDC}</li>
            <li>SSN: ${(_h = user === null || user === void 0 ? void 0 : user.driver) === null || _h === void 0 ? void 0 : _h.ssn}</li>
            <li>Preferred Location: ${(_j = user === null || user === void 0 ? void 0 : user.driver) === null || _j === void 0 ? void 0 : _j.preferredLoc}</li>
            <li>Date Registered: ${(_k = user === null || user === void 0 ? void 0 : user.driver) === null || _k === void 0 ? void 0 : _k.dateRegistered}</li>
            <li>Date Approved: ${(_l = user === null || user === void 0 ? void 0 : user.driver) === null || _l === void 0 ? void 0 : _l.dateApproved}</li>
          </ul>
          <br>
          <ul>
            <li>Vehicle Make: ${vehicle === null || vehicle === void 0 ? void 0 : vehicle.vehicleMake}</li>
            <li>Vehicle Model: ${vehicle === null || vehicle === void 0 ? void 0 : vehicle.vehicleModel}</li>
            <li>Vehicle Year: ${vehicle === null || vehicle === void 0 ? void 0 : vehicle.vehicleYear}</li>
          </ul>
          <br>
          
          <ul>
            ${imgURLArray
                    .map((url, index) => `<li>${index + 1}. <a href="${url}">${url}</a></li>`)
                    .join("")}
          </ul>
          <br>
          
          <p>Click the link below to approve or decline:</p>
          <p><a href="${process.env.FRONTEND_BASE_URL}/admin/account-agent-driver-approval/${user === null || user === void 0 ? void 0 : user.id}">Approve/Decline</a></p>
      
          
          <p>Once approved, the user will be granted access to the system.</p>
          <p>Thank you.</p>
          <p>Best Regards,<br>Screenzads</p>
        `,
            };
            console.log("before email");
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res.status(500).json({
                        status: 500,
                        message: "Failed to send email",
                        error: "Failed to send email",
                    });
                }
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "Email sent successfully" });
            });
            console.log("after email");
        }
        else {
            return res.status(400).json({
                status: 400,
                message: "Something went wrong in vehicle data",
                error: "Something went wrong in vehicle data",
            });
        }
        return res.status(200).json({
            message: "Created a new driver account successfully and check your email for approval of your account",
            result: "true",
            data: { ...mergedDriverData },
        });
    }
    else {
        return res.status(400).json({
            status: 400,
            message: "Something went wrong in driver data",
            error: "Something went wrong in driver data",
        });
    }
};
exports.emailCreatedDriver = emailCreatedDriver;
const deleteImage = async (req, res) => {
    var _a, _b;
    const userId = req.params.userId;
    try {
        const user = await server_1.prismaClient.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                driver: true,
            },
        });
        if (!user || !userId) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
                errors: "User not found",
            });
        }
        else {
            // delete old images first
            const driverImages = await server_1.prismaClient.driverImage.findMany({
                where: {
                    driverId: (_a = user === null || user === void 0 ? void 0 : user.driver) === null || _a === void 0 ? void 0 : _a.id,
                },
            });
            if ((driverImages === null || driverImages === void 0 ? void 0 : driverImages.length) > 0) {
                console.log("driverImages: ", driverImages);
                driverImages === null || driverImages === void 0 ? void 0 : driverImages.map((imgItem) => {
                    // s3 DO spaces fetch images linked
                    const params = {
                        Bucket: process.env.DO_BUCKET_NAME,
                        Key: `drivers/${imgItem.originalname}`, // Specify the key (filename) of the object to delete
                    };
                    let isS3ImageDelete = false;
                    // delete DO driver images
                    const url = s3Config_1.default.deleteObject(params, (err, data) => {
                        var _a;
                        if (err) {
                            console.error("Error deleting object:", err);
                            isS3ImageDelete = true;
                            return res.status(500).json({
                                status: 500,
                                message: "DO Images deleting error",
                                error: "DO Images deleting error",
                            });
                        }
                        else {
                            console.log("Object deleted successfully:", data);
                            deleteDBDriverImages((_a = user === null || user === void 0 ? void 0 : user.driver) === null || _a === void 0 ? void 0 : _a.id);
                        }
                    });
                    console.log("success deleting old image in digitalocean spaces: ", url);
                });
            }
        }
        const deleteDBDriverImages = async (driverId) => {
            const deletedResponse = await server_1.prismaClient.driverImage.deleteMany({
                where: {
                    driverId: driverId,
                },
            });
            console.log("deletedResponse success: ", deletedResponse);
        };
        return res.status(200).json({
            message: "Images deleted successfully",
            result: "true",
        });
    }
    catch (error) {
        // Zod validation errors
        let errorMessage = "Something went wrong!";
        if (typeof error.message === "string") {
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = ((_b = errorObj[0]) === null || _b === void 0 ? void 0 : _b.message) || errorMessage;
            }
            catch (e) {
                // If parsing fails, fallback to default error message
            }
        }
        return res.status((error === null || error === void 0 ? void 0 : error.status) || 400).json({
            status: (error === null || error === void 0 ? void 0 : error.status) || 400,
            message: errorMessage,
            error: errorMessage,
        });
    }
};
exports.deleteImage = deleteImage;
