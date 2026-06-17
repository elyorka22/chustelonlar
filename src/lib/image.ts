import { generateFilename } from "@/lib/utils";
import { uploadToSpaces } from "@/lib/spaces";

export interface ProcessedImage {
  fullUrl: string;
  thumbUrl: string;
  fullKey: string;
  thumbKey: string;
}

function detectImageFormat(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return "unknown";
}

function getImageMetadata(buffer: Buffer): {
  width: null;
  height: null;
  format: string;
} {
  return {
    width: null,
    height: null,
    format: detectImageFormat(buffer),
  };
}

export async function processAndUploadImage(
  buffer: Buffer
): Promise<ProcessedImage> {
  const filename = generateFilename();
  const fullKey = `ads/full/${filename}`;
  const thumbKey = `ads/thumb/${filename}`;

  // Temporary: skip sharp optimization (Alpine/libvips missing in Docker)
  const fullBuffer = buffer;
  const thumbBuffer = buffer;

  const [fullUrl, thumbUrl] = await Promise.all([
    uploadToSpaces(fullKey, fullBuffer),
    uploadToSpaces(thumbKey, thumbBuffer),
  ]);

  return { fullUrl, thumbUrl, fullKey, thumbKey };
}

export async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = getImageMetadata(buffer);
    return ["jpeg", "png", "webp"].includes(metadata.format);
  } catch {
    return false;
  }
}
