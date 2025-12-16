"use client";

import { useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import type { CommentRow } from "@/types/db";

type Props = {
  postId: string;
  initialComments: CommentRow[];
};

export default function Comments({ postId, initialComments }: Props) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tree = useMemo(() => {
    const byId = new Map<string, CommentRow & { replies: CommentRow[] }>();
    comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

    const roots: (CommentRow & { replies: CommentRow[] })[] = [];
    byId.forEach((c) => {
      if (c.parent_id && byId.has(c.parent_id)) {
        byId.get(c.parent_id)!.replies.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }, [comments]);

  async function submit(parent_id: string | null) {
    const dn = name.trim();
    const txt = body.trim();
    if (!dn || !txt) return;

    setLoading(true);
    const { data, error } = await supabaseClient
      .from("comments")
      .insert([{ post_id: postId, parent_id, display_name: dn, body: txt }])
      .select("*")
      .single();

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }

    setComments((prev) => [...prev, data as CommentRow]);
    setBody("");
    setReplyTo(null);
  }

  return (
    <section style={{ maxWidth: 760, margin: "20px auto", padding: 20 }}>
      <h3>Comments</h3>

      {/* Form */}
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          rows={4}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => submit(replyTo)}
            disabled={loading}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            {loading ? "Posting..." : replyTo ? "Post Reply" : "Post Comment"}
          </button>

          {replyTo && (
            <button
              onClick={() => setReplyTo(null)}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              Cancel reply
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "grid", gap: 14 }}>
        {tree.map((c) => (
          <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{c.display_name}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.body}</div>
            <button
              onClick={() => setReplyTo(c.id)}
              style={{ marginTop: 8, padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              Reply
            </button>

            {c.replies.length > 0 && (
              <div style={{ marginTop: 12, paddingLeft: 12, display: "grid", gap: 10 }}>
                {c.replies.map((r) => (
                  <div key={r.id} style={{ borderLeft: "3px solid #eee", paddingLeft: 10 }}>
                    <div style={{ fontWeight: 700 }}>{r.display_name}</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{r.body}</div>
                    <button
                      onClick={() => setReplyTo(r.id)}
                      style={{ marginTop: 6, padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd" }}
                    >
                      Reply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
