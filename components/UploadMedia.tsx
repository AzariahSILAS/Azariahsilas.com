"use client";

import { useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/supabase/storage";

type Bucket = "post-media" | "post-covers";

function extFromName(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function randomId() {
  return crypto.randomUUID();
}

function sanitizeFolder(folder: string) {
  // allow letters, numbers, dash, underscore, slash
  return folder
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");
}

export default function UploadMedia({
  defaultBucket = "post-media",
  defaultFolder = "my-first-post",
}: {
  defaultBucket?: Bucket;
  defaultFolder?: string; // ex: post slug
}) {
  const [bucket, setBucket] = useState<Bucket>(defaultBucket);
  const [folder, setFolder] = useState(defaultFolder);
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    bucket: Bucket;
    path: string;
    publicUrl: string;
    mimeType: string;
  } | null>(null);

  const accept = useMemo(() => "image/*,video/*", []);

  async function onUpload() {
    if (!file) return;

    const cleanFolder = sanitizeFolder(folder || "uploads");
    const ext = extFromName(file.name);
    const name = `${randomId()}${ext ? `.${ext}` : ""}`;
    const path = `${cleanFolder}/${name}`;

    setUploading(true);
    setResult(null);

    const { error } = await supabaseClient.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const publicUrl = getPublicUrl(bucket, path);

    setResult({
      bucket,
      path,
      publicUrl,
      mimeType: file.type,
    });
  }

  return (
    <section style={{ maxWidth: 760, margin: "20px auto", padding: 20, border: "1px solid #eee", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Upload Media (Supabase Storage)</h3>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Bucket</span>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as Bucket)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="post-media">post-media</option>
            <option value="post-covers">post-covers</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Folder (usually the post slug)</span>
          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="my-first-post"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Choose file</span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <button
          onClick={onUpload}
          disabled={!file || uploading}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {result && (
          <div style={{ marginTop: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Result</div>

            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>
{`bucket: "${result.bucket}"
path: "${result.path}"
publicUrl: "${result.publicUrl}"`}
            </div>

            <div style={{ marginTop: 10, fontWeight: 700 }}>JSON block you can paste:</div>
            <pre style={{ background: "#fafafa", padding: 12, borderRadius: 12, overflowX: "auto" }}>
{result.mimeType.startsWith("video/")
  ? JSON.stringify({ type: "video", bucket: result.bucket, path: result.path }, null, 2)
  : JSON.stringify({ type: "image", bucket: result.bucket, path: result.path, alt: "" }, null, 2)}
            </pre>

            {result.mimeType.startsWith("image/") ? (
              <img src={result.publicUrl} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid #eee" }} />
            ) : (
              <video controls style={{ width: "100%", borderRadius: 12, border: "1px solid #eee" }}>
                <source src={result.publicUrl} />
              </video>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
