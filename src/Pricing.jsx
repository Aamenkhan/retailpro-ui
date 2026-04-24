const C = { bg: "#04060E", card: "#090E1C", border: "#131B32", text: "#C8D4FF", muted: "#6B7DAA", green: "#00E5A0" };

const plans = [
  {
    name: "Starter",
    price: "?0",
    sub: "3 months free",
    features: ["POS Billing", "Inventory", "Basic Reports"],
    cta: "Current Free Plan",
  },
  {
    name: "Pro",
    price: "?599/month",
    sub: "Best for growing stores",
    features: ["Everything in Starter", "GST bills", "Customer CRM", "QR codes"],
    cta: "Pay with Razorpay",
  },
  {
    name: "Business",
    price: "?999/month",
    sub: "Multi-user + advanced analytics",
    features: ["Everything in Pro", "Employee module", "Advanced analytics", "Priority support"],
    cta: "Pay with Razorpay",
  },
];

export default function Pricing() {
  const openRazorpay = (plan) => {
    // Test checkout placeholder until backend order API is connected.
    alert(`Razorpay test checkout for ${plan} (use test key here).`);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", padding: "28px 16px" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}</style>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>Pro mein Upgrade Karo</h1>
        <p style={{ textAlign: "center", color: C.muted, marginBottom: 18 }}>Aapka 3 mahina free chal raha hai - upgrade karo jab mann kare</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {plans.map((p) => (
            <div key={p.name} style={{ background: C.card, border: `1px solid ${p.name === "Pro" ? C.green : C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ color: C.muted, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{p.price}</div>
              <div style={{ color: p.name === "Pro" ? C.green : C.muted, marginBottom: 10 }}>{p.sub}</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: C.muted }}>
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => openRazorpay(p.name)}
                style={{ marginTop: 14, width: "100%", background: p.name === "Starter" ? "#1A243F" : C.green, color: p.name === "Starter" ? C.text : "#03110B", border: "none", borderRadius: 10, padding: "11px 12px", fontWeight: 900, cursor: "pointer" }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign: "center", color: C.muted, fontSize: 13 }}>
          Razorpay integration currently in test mode placeholder.
        </div>
      </div>
    </div>
  );
}
