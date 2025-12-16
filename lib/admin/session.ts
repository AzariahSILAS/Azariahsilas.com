import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_SESSION_SECRET!;

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export async function requireAdminSession(): Promise<boolean> {
  if (!SECRET) return false;

  // ✅ In your Next version, cookies() is async
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value;
  if (!raw) return false;

  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);

  try {
    // timingSafeEqual requires equal-length buffers
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
