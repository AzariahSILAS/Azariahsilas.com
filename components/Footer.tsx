export default function Footer() {
  return (
    <footer style={{ padding: "20px", borderTop: "1px solid #eee", marginTop: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} my_blog</p>
        <p style={{ margin: 0 }}>Built with Next.js + Supabase + Vercel</p>
      </div>
    </footer>
  );
}
