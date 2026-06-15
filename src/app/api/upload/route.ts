import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/redis";
import { processAndUploadImage, validateImageBuffer } from "@/lib/image";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(
    `upload:${session.user.id}`,
    20,
    3600
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Juda ko'p yuklash. Keyinroq urinib ko'ring." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Fayl hajmi 20MB dan oshmasligi kerak" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Faqat JPG, PNG, WEBP formatlari qabul qilinadi" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const isValid = await validateImageBuffer(buffer);
    if (!isValid) {
      return NextResponse.json(
        { error: "Noto'g'ri rasm fayli" },
        { status: 400 }
      );
    }

    const result = await processAndUploadImage(buffer);

    return NextResponse.json({
      fullUrl: result.fullUrl,
      thumbUrl: result.thumbUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Rasm yuklashda xatolik" },
      { status: 500 }
    );
  }
}
