import { useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "./api";
import { startSubscriptionCheckout } from "./billingCheckout";

const C = {
  bg: "#04060E",
  card: "#090E1C",
  border: "#131B32",
  text: "#C8D4FF",
  muted: "#6B7DAA",
  green: "#00E5A0",
};

const plans = [
  {
    tier: "STARTER",
    name: "Starter",
    price: "₹0",
    sub: "3 months free trial",
    features: ["POS Billing", "Inventory", "Basic Reports"],
    cta: "Start Free Trial",
    paid: false,
    link: "/signup",
  },
  {
    tier: "PRO",
    name: "Pro",
    price: "₹599/month",
    sub: "Best for growing stores",
    features: ["Everything in Starter", "GST bills", "Customer CRM", "QR codes"],
    cta: "Subscribe with Razorpay",
    paid: true,
  },
  {
    tier: "BUSINESS",
    name: "Business",
    price: "₹999/month",
    sub: "Multi-user + advanced analytics",
    features: [
      "Everything in Pro",
      "Employee module",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Subscribe with Razorpay",
    paid: true,
  },
];

const btnStyle = (primary, disabled) => ({
  marginTop: 14,
  width: "100%",
  background: primary ? C.green : "#1A243F",
  color: primary ? "#03110B" : C.text,
  border: "none",
  borderRadius: 10,
  padding: "11px 12px",
  fontWeight: 900,
  cursor: disabled ? "wait" : primary ? "pointer" : "default",
  opacity: disabled ? 0.7 : 1,
  textDecoration: "none",
  display: "block",
  textAlign: "center",
  boxSizing: "border-box",
});

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const openRazorpay = async (tier) => {
    setError("");
    const plan = plans.find((p) => p.tier === tier);
    if (!plan?.paid) return;

    if (!getToken()) {
      sessionStorage.setItem("rp_checkout_tier", tier);
      window.location.href = "/app";
      return;
    }

    setLoading(tier);
    try {
      await startSubscriptionCheckout(tier);
      alert("Payment submitted. Your plan will activate shortly.");
      window.location.href = "/app";
    } catch (e) {
      if (e.message !== "Payment cancelled") {
        setError(e.message || "Checkout failed");
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Space Grotesk', sans-serif",
        padding: "28px 16px",
      }}
    >
      <style>
        {
          "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"
        }
      </style>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <p style={{ textAlign: "center", marginBottom: 16 }}>
          <Link to="/" style={{ color: C.muted, textDecoration: "none" }}>
            ← Home
          </Link>
        </p>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>Pro mein Upgrade Karo</h1>
        <p style={{ textAlign: "center", color: C.muted, marginBottom: 18 }}>
          Login required for paid plans · Razorpay test mode
        </p>
        {error && (
          <p style={{ textAlign: "center", color: "#ff6b6b", marginBottom: 12 }}>{error}</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 12,
          }}
        >
          {plans.map((p) => (
            <div
              key={p.tier}
              style={{
                background: C.card,
                border: `1px solid ${p.name === "Pro" ? C.green : C.border}`,
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div style={{ color: C.muted, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 30, fontWeight: 900 }}>{p.price}</div>
              <div style={{ color: p.name === "Pro" ? C.green : C.muted, marginBottom: 10 }}>
                {p.sub}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: C.muted }}>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {p.paid ? (
                <button
                  type="button"
                  disabled={loading === p.tier}
                  onClick={() => openRazorpay(p.tier)}
                  style={btnStyle(true, loading === p.tier)}
                >
                  {loading === p.tier ? "Opening…" : p.cta}
                </button>
              ) : (
                <Link to={p.link} style={btnStyle(false, false)}>
                  {p.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
