import Link from "next/link";
import { getLatestPosts } from "@/lib/queries/posts";

export default async function PostsPage() {
  const posts = await getLatestPosts(50);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Blog</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/posts/${p.slug}`}
            style={{ padding: 14, border: "1px solid #eee", borderRadius: 12 }}
          >
            <div style={{ fontWeight: 800 }}>{p.title}</div>
            {p.excerpt && <div style={{ marginTop: 6 }}>{p.excerpt}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
