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
  { icon: "⚡", title: "Smart POS", desc: "Fast billing with barcode scanning" },
  { icon: "📦", title: "Inventory", desc: "Real-time stock tracking & alerts" },
  { icon: "🧾", title: "GST Bills", desc: "Auto GST calculation & PDF bills" },
  { icon: "👥", title: "Customers", desc: "Customer ledger & credit history" },
  { icon: "📊", title: "Analytics", desc: "Sales reports & business insights" },
  { icon: "📱", title: "QR Codes", desc: "Generate QR for products instantly" },
];

const testimonials = [
  { name: "Ramesh Gupta", city: "Bhopal", text: "Billing and stock management became so much faster. Saves hours every day." },
  { name: "Pooja Jain", city: "Indore", text: "GST bills and customer history in one click. Extremely easy to use." },
  { name: "Imran Khan", city: "Nagpur", text: "My entire shop is now digital. No more manual work at all." },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}</style>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>
          <span style={{ color: C.green }}>Thtwaat</span>
          <span style={{ color: "#3B82F6" }}> POS</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/app" style={{ textDecoration: "none", color: C.muted, fontWeight: 600, fontSize: 14 }}>Login</Link>
          <Link to="/signup" style={{ textDecoration: "none", background: C.green, color: "#03110B", padding: "10px 18px", borderRadius: 10, fontWeight: 800, fontSize: 14 }}>Free Demo</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 20px 80px" }}>

        {/* HERO */}
        <section style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-block", background: "rgba(0,229,160,0.1)", border: `1px solid ${C.green}44`, borderRadius: 20, padding: "6px 16px", fontSize: 13, color: C.green, fontWeight: 700, marginBottom: 20 }}>
            3 Months Free — No Credit Card Required
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, marginBottom: 18, lineHeight: 1.15 }}>
            The Complete POS System<br />
            <span style={{ color: C.green }}>for Indian Retail Shops</span>
          </h1>
          <p style={{ color: C.muted, maxWidth: 600, margin: "0 auto 32px", fontSize: 17, lineHeight: 1.6 }}>
            GST billing, inventory, customers, employees — everything in one place. Built for Indian shopkeepers.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{ textDecoration: "none", display: "inline-block", background: C.green, color: "#03110B", padding: "15px 28px", borderRadius: 12, fontWeight: 900, fontSize: 16 }}>
              Start Free Trial &#8594;
            </Link>
            <Link to="/app" style={{ textDecoration: "none", display: "inline-block", background: "transparent", color: C.text, padding: "15px 28px", borderRadius: 12, fontWeight: 700, fontSize: 16, border: `1px solid ${C.border}` }}>
              Login to Dashboard
            </Link>
          </div>

          {/* Demo placeholder */}
          <div style={{ marginTop: 40, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", background: "#070B17" }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "52%" }}>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: C.muted }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 78, height: 78, borderRadius: "50%", border: `2px solid ${C.green}`, margin: "0 auto 14px", display: "grid", placeItems: "center", color: C.green, fontSize: 28 }}>&#127881;</div>
                  <div style={{ fontWeight: 700 }}>Product Demo — Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: 28, fontWeight: 800 }}>Everything You Need</h2>
          <p style={{ textAlign: "center", color: C.muted, marginBottom: 28 }}>One platform to run your entire shop</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            {featureCards.map((item) => (
              <div key={item.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{item.title}</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontWeight: 800, color: C.green, fontSize: 22 }}>500+ Shop Owners Already Using Thtwaat POS</div>
          <p style={{ color: C.muted, marginTop: 8 }}>Trusted by retailers across India</p>
        </section>

        {/* PRICING */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ textAlign: "center", marginBottom: 8, fontSize: 28, fontWeight: 800 }}>Simple Pricing</h2>
          <p style={{ textAlign: "center", color: C.muted, marginBottom: 24 }}>Start free, upgrade when ready</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ color: C.muted, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>STARTER</div>
              <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>&#8377;0</div>
              <div style={{ color: C.green, fontWeight: 700, marginBottom: 14 }}>3 month free trial</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Full access · No credit card</div>
            </div>
            <div style={{ background: C.card, border: `2px solid ${C.green}`, borderRadius: 14, padding: 24, position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#03110B", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20 }}>POPULAR</div>
              <div style={{ color: C.muted, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>PRO</div>
              <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>&#8377;599<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span></div>
              <div style={{ color: C.muted, marginBottom: 14, fontSize: 13 }}>After free trial</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Unlimited bills · GST reports</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ color: C.muted, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>BUSINESS</div>
              <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>&#8377;999<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span></div>
              <div style={{ color: C.muted, marginBottom: 14, fontSize: 13 }}>For growing teams</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Multi-staff · Advanced analytics</div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: 28, fontWeight: 800 }}>What Shop Owners Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ color: "#FFD700", fontSize: 13, marginBottom: 10 }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <div style={{ color: C.text, lineHeight: 1.6, fontSize: 14, marginBottom: 14 }}>"{t.text}"</div>
                <div style={{ color: C.green, fontWeight: 800, fontSize: 13 }}>{t.name}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>{t.city}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "40px 24px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Ready to Digitize Your Shop?</h2>
          <p style={{ color: C.muted, marginBottom: 24 }}>Join 500+ retailers already saving time with Thtwaat POS</p>
          <Link to="/signup" style={{ textDecoration: "none", display: "inline-block", background: C.green, color: "#03110B", padding: "15px 32px", borderRadius: 12, fontWeight: 900, fontSize: 16 }}>
            Get Started Free &#8594;
          </Link>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px 32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
        Made with &#10084; in India &nbsp;|&nbsp; Bhopal &nbsp;|&nbsp; &copy; 2025 Thtwaat POS
      </footer>
    </div>
  );
}
