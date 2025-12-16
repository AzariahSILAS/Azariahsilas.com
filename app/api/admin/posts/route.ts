import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSession } from "@/lib/admin/session";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  if (!(await requireAdminSession()))
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });


  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, published, published_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, posts: data });
}

export async function POST(req: Request) {
  if (!requireAdminSession()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });

  const title = String(body.title || "").trim();
  const excerpt = body.excerpt ? String(body.excerpt) : null;
  const content = body.content;
  const published = Boolean(body.published);
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];

  if (!title || !Array.isArray(content) || content.length === 0) {
    return NextResponse.json({ ok: false, error: "Title + content required" }, { status: 400 });
  }

  const slug = body.slug ? String(body.slug) : slugify(title);

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        slug,
        title,
        excerpt,
        content,
        tags,
        published,
        published_at: published ? new Date().toISOString() : null,
      },
    ])
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, post: data });
}
