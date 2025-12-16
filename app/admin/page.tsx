"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostListItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString();
}

export default function AdminHome() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok || !data.ok) {
      alert(data.error || "Failed to load posts");
      return;
    }

    setPosts(data.posts as PostListItem[]);
  }

  async function del(id: string, title: string) {
    const ok = confirm(`Delete this post?\n\n${title}\n\nThis cannot be undone.`);
    if (!ok) return;

    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin • Posts</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/editor"
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}
          >
            + New Post
          </Link>
          <button
            onClick={logout}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </div>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 140px", padding: 12, background: "#fafafa" }}>
          <strong>Title</strong>
          <strong>Status</strong>
          <strong>Updated</strong>
          <strong style={{ textAlign: "right" }}>Actions</strong>
        </div>

        {posts.map((p) => (
          <div
            key={p.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 140px",
              padding: 12,
              borderTop: "1px solid #eee",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontWeight: 800 }}>{p.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>/posts/{p.slug}</div>
            </div>

            <div style={{ fontSize: 13 }}>
              {p.published ? "Published" : "Draft"}
            </div>

            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {fmt(p.published_at ?? p.created_at)}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Link
                href={`/admin/editor?id=${encodeURIComponent(p.id)}`}
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              >
                Edit
              </Link>
              <button
                onClick={() => del(p.id, p.title)}
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!loading && posts.length === 0 && (
          <div style={{ padding: 16, opacity: 0.75 }}>
            No posts yet. Click <strong>+ New Post</strong> to create one.
          </div>
        )}
      </div>
    </div>
  );
}
