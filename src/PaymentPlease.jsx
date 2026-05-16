import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton";
import { clearAuth } from "./api";

const C = {
  bg: "#04060E",
  card: "#090E1C",
  border: "#131B32",
  text: "#C8D4FF",
  muted: "#6B7DAA",
  green: "#00E5A0",
};

export default function PaymentPlease({ message, status }) {
  const isTrialEnd = status === "EXPIRED" || status === "TRIAL";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <style>
        {
          "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap');"
        }
      </style>
      <div
        style={{
          width: 440,
          maxWidth: "100%",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
          {isTrialEnd ? "Trial khatam ho gaya" : "Payment please"}
        </h1>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {message ||
            "POS use karne ke liye plan subscribe karein. Pro ₹599/mo · Business ₹999/mo"}
        </p>
        <SubscribeButton tier="PRO" label="Pro — ₹599/month" />
        <SubscribeButton tier="BUSINESS" label="Business — ₹999/month" primary={false} />
        <p style={{ marginTop: 16, fontSize: 13 }}>
          <Link to="/pricing" style={{ color: C.green, fontWeight: 700 }}>
            Compare plans →
          </Link>
        </p>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            window.location.href = "/app";
          }}
          style={{
            marginTop: 20,
            background: "transparent",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}