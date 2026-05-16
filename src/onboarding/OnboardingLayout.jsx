import { Link } from "react-router-dom";

const C = { bg: "#04060E", card: "#090E1C", border: "#131B32", text: "#C8D4FF", muted: "#6B7DAA", green: "#00E5A0" };

export default function OnboardingLayout({ step, title, subtitle, children }) {
  const steps = [
    { n: 1, label: "Account" },
    { n: 2, label: "Demo video" },
    { n: 3, label: "Start & pay" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", padding: "24px 16px" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link to="/" style={{ color: C.muted, textDecoration: "none", fontSize: 13 }}>← retailproai.in</Link>
        <div style={{ display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap" }}>
          {steps.map((s) => (
            <div key={s.n} style={{ flex: 1, minWidth: 90, padding: "8px 10px", borderRadius: 8, border: `1px solid ${step >= s.n ? C.green : C.border}`, background: step === s.n ? "rgba(0,229,160,0.12)" : C.card, fontSize: 11, fontWeight: 700, textAlign: "center", color: step >= s.n ? C.green : C.muted }}>
              {s.n}. {s.label}
            </div>
          ))}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>{title}</h1>
        {subtitle && <p style={{ color: C.muted, marginTop: 0, marginBottom: 20 }}>{subtitle}</p>}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}
