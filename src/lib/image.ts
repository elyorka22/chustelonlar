import sharp from "sharp";
import { IMAGE_CONFIG } from "@/lib/constants";
import { generateFilename } from "@/lib/utils";
import { uploadToSpaces } from "@/lib/spaces";

export interface ProcessedImage {
  fullUrl: string;
  thumbUrl: string;
  fullKey: string;
  thumbKey: string;
}

export async function processAndUploadImage(
  buffer: Buffer
): Promise<ProcessedImage> {
  const filename = generateFilename();
  const fullKey = `ads/full/${filename}`;
  const thumbKey = `ads/thumb/${filename}`;

  const fullBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: IMAGE_CONFIG.fullMaxWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_CONFIG.webpQuality })
    .toBuffer();

  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: IMAGE_CONFIG.thumbWidth,
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toBuffer();

  const [fullUrl, thumbUrl] = await Promise.all([
    uploadToSpaces(fullKey, fullBuffer),
    uploadToSpaces(thumbKey, thumbBuffer),
  ]);

  return { fullUrl, thumbUrl, fullKey, thumbKey };
}

export async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return ["jpeg", "png", "webp"].includes(metadata.format || "");
  } catch {
    return false;
  }
}
