import { Request, Response } from "express";
import { prismaClient } from "../server";
import asyncHandler from "express-async-handler";
import { s3Uploadv3 } from "../lib/driverS3Service";
import s3 from "../lib/s3Config";
import * as mime from "mime-types";
const uuid = require("uuid").v4;
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { DriverSchema } from "../schema/driver";

export const getDrivers = async (req: Request, res: Response) => {
  const drivers = await prismaClient.driver.findMany();

  return res.status(200).json({
    message: "Fetched all drivers success",
    result: "true",
    data: { drivers },
  });
};

export const getDriver = async (req: Request, res: Response) => {
  const driverId = req.params.id;
  const driver = await prismaClient.driver.findUnique({
    where: { id: parseInt(driverId) },
  });

  return res.status(200).json({
    message: "Fetched a driver success",
    result: "true",
    data: { driver },
  });
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    // DriverSchema.parse(req.body);

    const {
      dl,
      ssn,
      lp,
      driveHours,
      employedDC,
      preferredLoc,
      dateRegistered,
      userId,
    } = req.body;

    console.log("createDriver req.body: ", req.body);
    console.log("req.files: ", req.files);

    const driver = await prismaClient.driver.create({
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

    let images: any = {
      images: null,
    };

    // Save metadata to Prisma database
    if (driver && req.files) {
      console.log("if (driver): ", driver);
      const files = Array.isArray(req.files) ? req.files : [req.files];

      try {
        await Promise.all(
          files.map(async (file: any) => {
            if (!file) return;

            const imageData = Buffer.from(file.buffer);

            console.log("imageData: ", imageData);

            console.log("uploading fileSource...");
            console.log("file.mimetype: ", file.mimetype);

            const type = mime.extension(file.mimetype);

            const originalname = `${uuid()}.${type}`;

            console.log("originalname: ", originalname);

            const data: any = {
              Bucket: process.env.DO_BUCKET_NAME,
              Key: `drivers/${originalname}`,
              Body: imageData,
              ContentType: file.mimetype,
              ACL: "public-read",
            };

            await s3
              .putObject(data, function (err, data) {
                if (err) {
                  console.log(err);
                  console.log("Error uploading data: ", data);
                } else {
                  console.log("successfully uploaded the image!");
                }
              })
              .promise();

            const driverImage = await prismaClient.driverImage.create({
              data: {
                originalname,
                driverId: driver.id,
              },
            });
            console.log("saving image succes: ", driverImage);

            console.log("success upload: ", data);
          })
        );
      } catch (error: any) {
        // Zod validation errors
        let errorMessage: string = "Something went wrong!";

        if (typeof error.message === "string") {
          try {
            const errorObj: any[] = JSON.parse(error.message);
            errorMessage = errorObj[0]?.message || errorMessage;
          } catch (e) {
            // If parsing fails, fallback to default error message
          }
        }

        return res.status(error?.status || 400).json({
          status: error?.status || 400,
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
  } catch (error: any) {
    // Zod validation errors
    let errorMessage: string = "Something went wrong!";

    if (typeof error.message === "string") {
      try {
        const errorObj: any[] = JSON.parse(error.message);
        errorMessage = errorObj[0]?.message || errorMessage;
      } catch (e) {
        // If parsing fails, fallback to default error message
      }
    }

    return res.status(error?.status || 400).json({
      status: error?.status || 400,
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

export const updateDriver = async (req: Request, res: Response) => {
  const driverId = req.params.id;
  const {
    dl,
    ssn,
    lp,
    driveHours,
    employedDC,
    preferredLoc,
    dateRegistered,
    dateApproved,
  } = req.body;

  const driver = await prismaClient.driver.update({
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

export const deleteDriver = async (req: Request, res: Response) => {
  const driverId = req.params.id;

  console.log("deleteDriver");

  const driver = await prismaClient.driver.delete({
    where: { id: parseInt(driverId) },
  });

  return res.status(200).json({
    message: "Deleted a driver success",
    result: "true",
    data: { driver },
  });
};

export const emailCreatedDriver = async (req: Request, res: Response) => {
  const { userId } = req.body;

  console.log("createDriver");

  const user = await prismaClient.user.findUnique({
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

  if (user?.driver) {
    console.log("driverid: ", user?.driver?.id);
    const driverImages = await prismaClient.driverImage.findMany({
      where: {
        driverId: user?.driver?.id,
      },
    });

    const vehicle = await prismaClient.vehicle.findUnique({
      where: {
        driverId: user?.driver?.id,
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

    let imgURLArray: any[] = [];
    if (driverImages?.length > 0) {
      driverImages?.map((imgItem: any) => {
        // s3 DO spaces fetch images linked
        const url = s3.getSignedUrl("getObject", {
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
    const transporter = nodemailer.createTransport({
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
            <li>First Name: ${user?.firstName}</li>
            <li>Last Name: ${user?.lastName}</li>
            <li>Date of Birth: ${user?.dateOfBirth}</li>
            <li>Address Line 1: ${user?.addressLine1}</li>
            <li>Address Line 2: ${user?.addressLine2}</li>
            <li>Address Line 2: ${user?.city}</li>
            <li>Address Line 2: ${user?.state}</li>
            <li>Address Line 2: ${user?.country}</li>
            <li>Address Line 2: ${user?.zipCode}</li>
            <li>Email: ${user?.email}</li>
            <li>Role: ${user?.role}</li>
          </ul>
          <br>
          <ul>
            <li>Drivers License: ${user?.driver?.dl}</li>
            <li>Drivers License: ${user?.driver?.lp}</li>
            <li>Drivers License: ${user?.driver?.driveHours}</li>
            <li>Drivers License: ${user?.driver?.employedDC}</li>
            <li>SSN: ${user?.driver?.ssn}</li>
            <li>Preferred Location: ${user?.driver?.preferredLoc}</li>
            <li>Date Registered: ${user?.driver?.dateRegistered}</li>
            <li>Date Approved: ${user?.driver?.dateApproved}</li>
          </ul>
          <br>
          <ul>
            <li>Vehicle Make: ${vehicle?.vehicleMake}</li>
            <li>Vehicle Model: ${vehicle?.vehicleModel}</li>
            <li>Vehicle Year: ${vehicle?.vehicleYear}</li>
          </ul>
          <br>
          
          <ul>
            ${imgURLArray
              .map(
                (url, index) =>
                  `<li>${index + 1}. <a href="${url}">${url}</a></li>`
              )
              .join("")}
          </ul>
          <br>
          
          <p>Click the link below to approve or decline:</p>
          <p><a href="${
            process.env.FRONTEND_BASE_URL
          }/admin/account-agent-driver-approval/${
          user?.id
        }">Approve/Decline</a></p>
      
          
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
    } else {
      return res.status(400).json({
        status: 400,
        message: "Something went wrong in vehicle data",
        error: "Something went wrong in vehicle data",
      });
    }

    return res.status(200).json({
      message:
        "Created a new driver account successfully and check your email for approval of your account",
      result: "true",
      data: { ...mergedDriverData },
    });
  } else {
    return res.status(400).json({
      status: 400,
      message: "Something went wrong in driver data",
      error: "Something went wrong in driver data",
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const user = await prismaClient.user.findUnique({
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
    } else {
      // delete old images first
      const driverImages = await prismaClient.driverImage.findMany({
        where: {
          driverId: user?.driver?.id,
        },
      });

      if (driverImages?.length > 0) {
        console.log("driverImages: ", driverImages);

        driverImages?.map((imgItem: any) => {
          // s3 DO spaces fetch images linked
          const params = {
            Bucket: process.env.DO_BUCKET_NAME!,
            Key: `drivers/${imgItem.originalname}`, // Specify the key (filename) of the object to delete
          };

          let isS3ImageDelete = false;

          // delete DO driver images
          const url = s3.deleteObject(params, (err, data) => {
            if (err) {
              console.error("Error deleting object:", err);
              isS3ImageDelete = true;

              return res.status(500).json({
                status: 500,
                message: "DO Images deleting error",
                error: "DO Images deleting error",
              });
            } else {
              console.log("Object deleted successfully:", data);

              deleteDBDriverImages(user?.driver?.id);
            }
          });

          console.log(
            "success deleting old image in digitalocean spaces: ",
            url
          );
        });
      }
    }

    const deleteDBDriverImages = async (driverId: any) => {
      const deletedResponse = await prismaClient.driverImage.deleteMany({
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
  } catch (error: any) {
    // Zod validation errors
    let errorMessage: string = "Something went wrong!";

    if (typeof error.message === "string") {
      try {
        const errorObj: any[] = JSON.parse(error.message);
        errorMessage = errorObj[0]?.message || errorMessage;
      } catch (e) {
        // If parsing fails, fallback to default error message
      }
    }

    return res.status(error?.status || 400).json({
      status: error?.status || 400,
      message: errorMessage,
      error: errorMessage,
    });
  }
};
