import { Link } from "react-router-dom";

const C = {
  bg: "#04060E",
  card: "#090E1C",
  border: "#131B32",
  text: "#C8D4FF",
  muted: "#6B7DAA",
  green: "#00E5A0",
};

const featureCards = [
  "? Smart POS",
  "?? Inventory",
  "?? GST Bills",
  "?? Customers",
  "?? Analytics",
  "?? QR Codes",
];

const testimonials = [
  { name: "Ramesh Gupta", city: "Bhopal", text: "RetailPRO se billing aur stock dono fast ho gaya. Time bach raha hai daily." },
  { name: "Pooja Jain", city: "Indore", text: "GST bill aur customer history ek click mein mil jata hai. Bahut easy hai." },
  { name: "Imran Khan", city: "Nagpur", text: "Pehle manual kaam hota tha, ab pura shop digital ho gaya hai." },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}</style>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}><span style={{ color: C.green }}>Retail</span>PRO</div>
        <Link to="/signup" style={{ textDecoration: "none", background: C.green, color: "#03110B", padding: "10px 16px", borderRadius: 10, fontWeight: 800 }}>Free Demo</Link>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px 70px" }}>
        <section style={{ textAlign: "center", marginBottom: 42 }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", marginBottom: 14 }}>Apni Dukan Ko Digital Banao ??</h1>
          <p style={{ color: C.muted, maxWidth: 760, margin: "0 auto 22px", fontSize: 18 }}>
            India ka sabse aasan POS + ERP system. GST bills, stock, customers - sab ek jagah.
          </p>
          <Link to="/signup" style={{ textDecoration: "none", display: "inline-block", background: C.green, color: "#03110B", padding: "15px 24px", borderRadius: 12, fontWeight: 900, fontSize: 18 }}>
            Free Mein Try Karo (3 Mahine)
          </Link>
          <div style={{ marginTop: 26, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", background: "#070B17" }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: C.muted }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 78, height: 78, borderRadius: "50%", border: `2px solid ${C.green}`, margin: "0 auto 14px", display: "grid", placeItems: "center", color: C.green, fontSize: 28 }}>?</div>
                  <div style={{ fontWeight: 700 }}>RetailPRO Demo Video - Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ textAlign: "center", marginBottom: 16 }}>Powerful Features</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {featureCards.map((item) => (
              <div key={item} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, fontWeight: 700, fontSize: 18 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: "center", marginBottom: 36, fontWeight: 800, color: C.green, fontSize: 24 }}>
          500+ Dukandaar Already Use Kar Rahe Hain
        </section>

        <section style={{ marginBottom: 36 }}>
          <div style={{ background: "rgba(0,229,160,.12)", border: `1px solid ${C.green}`, borderRadius: 12, padding: 14, textAlign: "center", fontWeight: 900, marginBottom: 14 }}>
            Abhi 3 Mahine Bilkul FREE! (Limited Time)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ color: C.muted, fontSize: 13 }}>Starter</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>?0</div>
              <div style={{ color: C.green, fontWeight: 700 }}>3 month free trial</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.green}`, borderRadius: 14, padding: 18 }}>
              <div style={{ color: C.muted, fontSize: 13 }}>Pro Plan</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>?599/month</div>
              <div style={{ color: C.muted }}>after free trial</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ color: C.muted, fontSize: 13 }}>Business</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>?999/month</div>
              <div style={{ color: C.muted }}>team + advanced reports</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2 style={{ textAlign: "center", marginBottom: 14 }}>Dukandaar Reviews</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                <div style={{ marginBottom: 8, color: C.green, fontWeight: 800 }}>{t.name} · {t.city}</div>
                <div style={{ color: C.muted, lineHeight: 1.5 }}>{t.text}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: 18, textAlign: "center", color: C.muted }}>
        Made with ?? in India | Bhopal
      </footer>
    </div>
  );
}
