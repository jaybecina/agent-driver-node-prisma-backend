const { S3 } = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;
const aws = require("aws-sdk");
import * as mime from "mime-types";

aws.config.update({
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
});

exports.s3Uploadv2 = async (files: any) => {
  const s3 = new S3();

  const params = files.map((file: any) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param: any) => s3.upload(param).promise())
  );
};

export const s3Uploadv3 = async (files: any) => {
  console.log("s3Uploadv3");
  const s3client = new S3Client({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION,
    credentials: {
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
  });

  const params = files.map((file: any) => {
    return {
      Bucket: process.env.DO_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
      ACL: "public-read",
    };
  });

  return await Promise.all(
    params.map((param: any) => s3client.send(new PutObjectCommand(param)))
  );
};
