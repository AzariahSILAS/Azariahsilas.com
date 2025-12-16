import type { PostBlock } from "@/types/db";
import { getPublicUrl } from "@/lib/supabase/storage";

function safeText(v: unknown): v is string {
  return typeof v === "string";
}

function safePath(v: unknown): v is string {
  // prevent weird injections and empty paths
  return typeof v === "string" && v.length > 0 && !v.includes("..");
}

export default function PostRenderer({ blocks }: { blocks: PostBlock[] }) {
  return (
    <article style={{ padding: "20px", maxWidth: 760, margin: "0 auto" }}>
      {blocks?.map((b, idx) => {
        // HEADINGS + PARAGRAPHS
        if (b.type === "h1" && safeText(b.text)) return <h1 key={idx}>{b.text}</h1>;
        if (b.type === "h2" && safeText(b.text)) return <h2 key={idx}>{b.text}</h2>;
        if (b.type === "p" && safeText(b.text))
          return (
            <p key={idx} style={{ lineHeight: 1.6 }}>
              {b.text}
            </p>
          );

        if (b.type === "title") return <h1 key={idx} style={{ fontSize: 42 }}>{b.text}</h1>;
if (b.type === "h3") return <h3 key={idx}>{b.text}</h3>;
if (b.type === "quote")
  return (
    <blockquote key={idx} style={{ borderLeft: "4px solid #ddd", paddingLeft: 12 }}>
      {b.text}
    </blockquote>
  );
if (b.type === "divider") return <hr key={idx} />;
  

        // IMAGE (from Supabase bucket)
        if (b.type === "image") {
          if (!safePath(b.path)) return null;

          const src = getPublicUrl(b.bucket, b.path);

          return (
            <figure key={idx} style={{ margin: "18px 0" }}>
              <img
                src={src}
                alt={b.alt ?? ""}
                loading="lazy"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
              {b.alt ? (
                <figcaption style={{ marginTop: 8, fontSize: 14, opacity: 0.75 }}>
                  {b.alt}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        // VIDEO (from Supabase bucket)
        if (b.type === "video") {
          if (!safePath(b.path)) return null;

          const src = getPublicUrl(b.bucket, b.path);

          return (
            <div key={idx} style={{ margin: "18px 0" }}>
              <video
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              >
                <source src={src} />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }

        // Unknown block type (ignore)
        return null;
      })}
    </article>
  );
}
