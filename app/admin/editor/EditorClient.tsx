"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PostRenderer from "@/components/PostRenderer";
import type { PostBlock } from "@/types/db";

type PostMeta = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  published: boolean;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function canEditText(block: PostBlock) {
  return (
    block.type === "title" ||
    block.type === "h1" ||
    block.type === "h2" ||
    block.type === "h3" ||
    block.type === "p" ||
    block.type === "quote"
  );
}

export default function EditorClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const id = sp.get("id") || "";

  const [meta, setMeta] = useState<PostMeta>({
    id: id || undefined,
    title: "",
    slug: "",
    excerpt: "",
    tags: "we-map, build-log",
    published: false,
  });

  const [blocks, setBlocks] = useState<PostBlock[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);

  // For uploads: keep media organized by slug
  const uploadFolder = useMemo(() => {
    const s = meta.slug.trim() || slugify(meta.title || "new-post");
    return s || "new-post";
  }, [meta.slug, meta.title]);

  // --------- Load existing post if id is present ----------
  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoadingPost(true);

      const res = await fetch(`/api/admin/posts/${id}`);
      const data = await res.json().catch(() => ({}));

      setLoadingPost(false);

      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to load post");
        return;
      }

      const p = data.post;
      setMeta({
        id: p.id,
        title: p.title ?? "",
        slug: p.slug ?? "",
        excerpt: p.excerpt ?? "",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
        published: Boolean(p.published),
      });
      setBlocks(Array.isArray(p.content) ? p.content : []);
    }

    load();
  }, [id]);

  // --------- Block operations ----------
  function add(block: PostBlock) {
    setBlocks((prev) => [...prev, block]);
    // Focus the newly added text block
    const nextIndex = blocks.length;
    if ("text" in block) setActiveIndex(nextIndex);
  }

  function remove(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
    setActiveIndex((cur) => (cur === i ? null : cur));
  }

  function updateText(i: number, text: string) {
    setBlocks((prev) =>
      prev.map((blk, idx) => (idx === i ? ({ ...blk, text } as any) : blk))
    );
  }

  function updateAlt(i: number, alt: string) {
    setBlocks((prev) =>
      prev.map((blk, idx) =>
        idx === i && blk.type === "image" ? ({ ...blk, alt } as any) : blk
      )
    );
  }

  // --------- Upload helper ----------
  async function uploadFile(bucket: "post-media" | "post-covers", file: File) {
    const fd = new FormData();
    fd.append("bucket", bucket);
    fd.append("folder", uploadFolder);
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data as { bucket: string; path: string; publicUrl: string; mimeType: string };
  }

  // --------- Save/Create ----------
  async function save() {
    const title = meta.title.trim();
    if (!title) {
      alert("Title is required");
      return;
    }
    if (blocks.length === 0) {
      alert("Add at least one block");
      return;
    }

    const slug = meta.slug.trim() || slugify(title);
    const payload = {
      title,
      slug,
      excerpt: meta.excerpt.trim() || null,
      tags: meta.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content: blocks,
      published: meta.published,
    };

    setSaving(true);

    if (meta.id) {
      // Update
      const res = await fetch(`/api/admin/posts/${meta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setSaving(false);

      if (!res.ok || !data.ok) {
        alert(data.error || "Save failed");
        return;
      }

      alert("Saved ✅");
      return;
    } else {
      // Create
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setSaving(false);

      if (!res.ok || !data.ok) {
        alert(data.error || "Create failed");
        return;
      }

      const newId = data.post?.id;
      alert(`Created ✅ /posts/${data.post?.slug}`);

      // push the editor into edit mode with the id
      if (newId) router.replace(`/admin/editor?id=${encodeURIComponent(newId)}`);
    }
  }

  // --------- UI ----------
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        height: "100vh",
      }}
    >
      {/* LEFT PANEL */}
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Post</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Title"
            value={meta.title}
            onChange={(e) =>
              setMeta((m) => ({
                ...m,
                title: e.target.value,
                slug: m.slug.trim() ? m.slug : slugify(e.target.value),
              }))
            }
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            placeholder="Slug"
            value={meta.slug}
            onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            placeholder="Excerpt"
            value={meta.excerpt}
            onChange={(e) => setMeta((m) => ({ ...m, excerpt: e.target.value }))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            placeholder="Tags (comma separated)"
            value={meta.tags}
            onChange={(e) => setMeta((m) => ({ ...m, tags: e.target.value }))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={meta.published}
              onChange={(e) => setMeta((m) => ({ ...m, published: e.target.checked }))}
            />
            Published
          </label>

          <button
            onClick={save}
            disabled={saving}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            {saving ? "Saving..." : meta.id ? "Save Changes" : "Create Post"}
          </button>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Upload folder: <code>{uploadFolder}</code>
          </div>
        </div>

        <hr style={{ margin: "16px 0" }} />

        <h3>Add block</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={() => add({ type: "title", text: "Post title" })}>Title</button>
          <button onClick={() => add({ type: "h1", text: "Heading 1" })}>H1</button>
          <button onClick={() => add({ type: "h2", text: "Heading 2" })}>H2</button>
          <button onClick={() => add({ type: "h3", text: "Heading 3" })}>H3</button>
          <button onClick={() => add({ type: "p", text: "" })}>Paragraph</button>
          <button onClick={() => add({ type: "quote", text: "" })}>Quote</button>
          <button onClick={() => add({ type: "divider" })}>Divider</button>

          {/* Image upload */}
          <label
            style={{
              border: "1px solid #ddd",
              padding: "8px 10px",
              borderRadius: 10,
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            + Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const up = await uploadFile("post-media", file);
                  add({ type: "image", bucket: "post-media", path: up.path, alt: "" });
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />
          </label>

          {/* Video upload */}
          <label
            style={{
              border: "1px solid #ddd",
              padding: "8px 10px",
              borderRadius: 10,
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            + Video
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const up = await uploadFile("post-media", file);
                  add({ type: "video", bucket: "post-media", path: up.path });
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main style={{ padding: 20, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ marginTop: 0 }}>Preview</h2>
          {loadingPost && <span style={{ opacity: 0.7 }}>Loading…</span>}
        </div>

        {/* Inline editing IN the preview area */}
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
          {blocks.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Click blocks on the left to start building your post.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {blocks.map((blk, i) => {
                const isActive = activeIndex === i;

                // If active and it's a text block, show textarea IN PLACE
                if (isActive && canEditText(blk) && "text" in blk) {
                  return (
                    <div key={i} style={{ border: "1px dashed #ddd", borderRadius: 12, padding: 10 }}>
                      <textarea
                        autoFocus
                        value={blk.text}
                        onChange={(e) => updateText(i, e.target.value)}
                        onBlur={() => setActiveIndex(null)}
                        rows={blk.type === "title" ? 2 : blk.type.startsWith("h") ? 2 : 4}
                        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        <button onClick={() => remove(i)}>Remove</button>
                      </div>
                    </div>
                  );
                }

                // If active and image: allow alt editing
                if (isActive && blk.type === "image") {
                  return (
                    <div key={i} style={{ border: "1px dashed #ddd", borderRadius: 12, padding: 10 }}>
                      <div style={{ marginBottom: 10 }}>
                        <strong>Image</strong> • {blk.path}
                      </div>
                      <input
                        value={blk.alt ?? ""}
                        onChange={(e) => updateAlt(i, e.target.value)}
                        onBlur={() => setActiveIndex(null)}
                        placeholder="Alt text"
                        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        <button onClick={() => remove(i)}>Remove</button>
                      </div>
                    </div>
                  );
                }

                // Non-active: show real render + click-to-edit
                return (
                  <div key={i} style={{ position: "relative" }}>
                    <div
                      onClick={() => setActiveIndex(i)}
                      style={{
                        cursor: "pointer",
                        borderRadius: 10,
                        padding: 6,
                      }}
                      title="Click to edit"
                    >
                      <PostRenderer blocks={[blk]} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <button onClick={() => remove(i)} style={{ fontSize: 12 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr style={{ margin: "18px 0" }} />

        <h3>Full post render</h3>
        <PostRenderer blocks={blocks} />
      </main>
    </div>
  );
}
