import Link from "next/link";
import { getNewestPost } from "@/lib/queries/posts";

export default async function WhatsNew() {
  const post = await getNewestPost();
  if (!post) return null;

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>What’s New</h2>

      <Link
        href={`/posts/${post.slug}`}
        style={{ display: "block", padding: 16, border: "1px solid #eee", borderRadius: 12 }}
      >
        <div style={{ fontWeight: 900, fontSize: 20 }}>{post.title}</div>
        {post.excerpt && <p style={{ marginTop: 8 }}>{post.excerpt}</p>}
      </Link>
    </section>
  );
}
