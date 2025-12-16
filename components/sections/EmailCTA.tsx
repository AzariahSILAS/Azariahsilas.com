import EmailSignup from "@/components/EmailSignup";

export default function EmailCTA() {
  return (
    <section style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 18 }}>
        <EmailSignup />
      </div>
    </section>
  );
}
