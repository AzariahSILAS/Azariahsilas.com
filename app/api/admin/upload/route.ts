import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSession } from "@/lib/admin/session";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

function safeFolder(input: string) {
  return (input || "uploads")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");
}

export async function POST(req: Request) {
  if (!(await requireAdminSession()))
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });


  const form = await req.formData();
  const bucket = String(form.get("bucket") || "post-media");
  const folder = safeFolder(String(form.get("folder") || "uploads"));
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }

  // Basic allowlist
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ ok: false, error: "Only image/video allowed" }, { status: 400 });
  }

  // Bucket allowlist
  if (bucket !== "post-media" && bucket !== "post-covers") {
    return NextResponse.json({ ok: false, error: "Invalid bucket" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
  const name = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
  const path = `${folder}/${name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    bucket,
    path,
    publicUrl: data.publicUrl,
    mimeType: file.type,
  });
}
