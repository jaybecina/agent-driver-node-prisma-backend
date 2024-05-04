import dotenv from "dotenv";
dotenv.config();
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  // s3ForcePathStyle: true,  //Optional if you use services like Digital Ocean spaces
  region: process.env.DO_SPACES_REGION,
  signatureVersion: "v4", // Use version 4 of the signature
});

export default s3;
