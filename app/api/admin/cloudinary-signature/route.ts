import { NextResponse } from "next/server";
import { requireStaff, UnauthorizedError } from "@/lib/authorization";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  try {
    await requireStaff();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_* env vars to enable image uploads." },
      { status: 503 },
    );
  }

  const folder = "renish-collections";
  const { timestamp, signature } = createUploadSignature({ folder });

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  });
}
