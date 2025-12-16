import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, serviceKey);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const clean = email.trim().toLowerCase();

    const { error } = await supabase
      .from("email_subscribers")
      .upsert({ email: clean }, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
