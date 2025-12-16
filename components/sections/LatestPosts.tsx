import Link from "next/link";
import { getLatestPosts } from "@/lib/queries/posts";

export default async function LatestPosts() {
  const posts = await getLatestPosts(6);

  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2>Latest Posts</h2>
        <Link href="/posts">View all</Link>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
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
    </section>
  );
}
