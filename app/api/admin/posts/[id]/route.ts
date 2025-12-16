import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSession } from "@/lib/admin/session";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdminSession()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, post: data });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdminSession()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });

  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim();
  const excerpt = body.excerpt ? String(body.excerpt) : null;
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const content = body.content;
  const published = Boolean(body.published);

  if (!title || !slug || !Array.isArray(content) || content.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Title, slug, content required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      excerpt,
      tags,
      content,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdminSession()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
