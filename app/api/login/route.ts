import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const SECRET = process.env.ADMIN_SESSION_SECRET!;

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = String(body?.password || "");

  if (!ADMIN_PASSWORD || !SECRET) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const payload = JSON.stringify({ v: 1, iat: Date.now() });
  const token = Buffer.from(payload).toString("base64url");
  const sig = sign(token);
  const cookieValue = `${token}.${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
