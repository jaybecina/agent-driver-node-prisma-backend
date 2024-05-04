"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Uploadv3 = void 0;
const { S3 } = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;
const aws = require("aws-sdk");
aws.config.update({
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
});
exports.s3Uploadv2 = async (files) => {
    const s3 = new S3();
    const params = files.map((file) => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer,
        };
    });
    return await Promise.all(params.map((param) => s3.upload(param).promise()));
};
const s3Uploadv3 = async (files) => {
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
    const params = files.map((file) => {
        return {
            Bucket: process.env.DO_BUCKET_NAME,
            Key: `uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer,
            ACL: "public-read",
        };
    });
    return await Promise.all(params.map((param) => s3client.send(new PutObjectCommand(param))));
};
exports.s3Uploadv3 = s3Uploadv3;
