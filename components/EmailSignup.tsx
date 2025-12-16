"use client";

import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function submit() {
    setStatus("loading");
    setError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(data?.error || "Something went wrong");
      return;
    }

    setStatus("success");
    setEmail("");
  }

  return (
    <div id="email" style={{ maxWidth: 520 }}>
      <h3 style={{ marginBottom: 8 }}>Join the email list</h3>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Get updates on We Map progress, new posts, and early access.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          onClick={submit}
          disabled={status === "loading"}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          {status === "loading" ? "Joining..." : "Join"}
        </button>
      </div>

      {status === "success" && (
        <p style={{ marginTop: 10 }}>✅ You’re in. Thanks for joining!</p>
      )}
      {status === "error" && (
        <p style={{ marginTop: 10 }}>❌ {error}</p>
      )}
    </div>
  );
}
