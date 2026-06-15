import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || "fra1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

const bucket = process.env.DO_SPACES_BUCKET || "";
const cdnUrl = process.env.DO_SPACES_CDN_URL || "";

export function getPublicUrl(key: string): string {
  if (cdnUrl) {
    return `${cdnUrl}/${key}`;
  }
  return `${process.env.DO_SPACES_ENDPOINT}/${bucket}/${key}`;
}

export async function uploadToSpaces(
  key: string,
  buffer: Buffer,
  contentType = "image/webp"
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return getPublicUrl(key);
}

export async function deleteFromSpaces(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\//, "");
    return path.includes("/") ? path.split("/").slice(1).join("/") : path;
  } catch {
    return null;
  }
}
