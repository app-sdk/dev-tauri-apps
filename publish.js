import path from "node:path";
import { pipeline } from "node:stream/promises";
import {
  GetObjectCommand as S3GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Extract } from "unzipper";

const isMain = process.env.GITHUB_REF_NAME === "main";

const s3Client = new S3Client(
  isMain
    ? {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: false,
      }
    : {
        credentials: {
          accessKeyId: "minioadmin",
          secretAccessKey: "minioadmin",
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
      },
);

const s3Response = await s3Client.send(
  new S3GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: process.env.S3_KEY,
  }),
);

await pipeline(
  s3Response.Body,
  Extract({ path: path.join(process.env.RUNNER_TEMP, "project") }),
);
