import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "products";

  if (!file) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Sadece JPEG, PNG, WebP ve GIF kabul edilir" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Dosya boyutu 5MB'i gecemez" }, { status: 400 });
  }

  // Sanitize folder name
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 50) || "uploads";

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const fileName = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const admin = getAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: urlData } = admin.storage.from("images").getPublicUrl(fileName);

  return NextResponse.json({
    url: urlData.publicUrl,
    fileName,
    success: true,
  });
}
