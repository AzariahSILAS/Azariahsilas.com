"use client";

import { useState } from "react";
import PostRenderer from "@/components/PostRenderer";
import type { PostBlock } from "@/types/db";

export default function EditorPage() {
  const [blocks, setBlocks] = useState<PostBlock[]>([]);

  function add(block: PostBlock) {
    setBlocks((b) => [...b, block]);
  }

  function updateText(i: number, text: string) {
    setBlocks((b) =>
      b.map((blk, idx) => (idx === i ? { ...blk, text } : blk))
    );
  }

  function remove(i: number) {
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh" }}>
      
      {/* LEFT PANEL */}
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <h3>Add block</h3>

        <button onClick={() => add({ type: "title", text: "Post title" })}>Title</button>
        <button onClick={() => add({ type: "h1", text: "Heading 1" })}>H1</button>
        <button onClick={() => add({ type: "h2", text: "Heading 2" })}>H2</button>
        <button onClick={() => add({ type: "h3", text: "Heading 3" })}>H3</button>
        <button onClick={() => add({ type: "p", text: "" })}>Paragraph</button>
        <button onClick={() => add({ type: "quote", text: "" })}>Quote</button>
        <button onClick={() => add({ type: "divider" })}>Divider</button>
      </aside>

      {/* RIGHT PANEL */}
      <main style={{ padding: 20, overflow: "auto" }}>
        <h3>Live preview</h3>

        {blocks.map((blk, i) => (
          <div key={i} style={{ marginBottom: 12, border: "1px dashed #ddd", padding: 10 }}>
            {"text" in blk && (
              <textarea
                value={blk.text}
                onChange={(e) => updateText(i, e.target.value)}
                style={{ width: "100%", marginBottom: 8 }}
              />
            )}

            <button onClick={() => remove(i)}>Remove</button>
          </div>
        ))}

        <hr />

        {/* REAL POST PREVIEW */}
        <PostRenderer blocks={blocks} />
      </main>
    </div>
  );
}
