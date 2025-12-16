"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok || !data.ok) {
      alert(data.error || "Login failed");
      return;
    }
    router.push(next);
  }

  return (
    <div style={{ maxWidth: 520, margin: "80px auto", padding: 20 }}>
      <h1>Admin Login</h1>
      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
      />
      <button
        onClick={login}
        disabled={loading}
        style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </div>
  );
}
