import Link from "next/link";

export default function Header() {
  return (
    <header style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
      <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Link href="/" style={{ fontWeight: 800 }}>my_blog</Link>
        <Link href="/posts">Blog</Link>
        <a href="#email">Email List</a>
      </nav>
    </header>
  );
}
