import { useState } from "react";
import { getToken } from "./api";
import { startSubscriptionCheckout } from "./billingCheckout";

const C = { green: "#00E5A0", muted: "#6B7DAA" };

export default function SubscribeButton({ tier, label, primary = true }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onClick = async () => {
    setError("");
    if (!getToken()) {
      sessionStorage.setItem("rp_checkout_tier", tier);
      window.location.href = "/app";
      return;
    }
    setLoading(true);
    try {
      await startSubscriptionCheckout(tier);
      alert("Payment submitted. Your plan will activate shortly.");
      window.location.reload();
    } catch (e) {
      if (e.message !== "Payment cancelled") {
        setError(e.message || "Checkout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p style={{ color: "#ff6b6b", fontSize: 11, marginTop: 10, marginBottom: 0 }}>{error}</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        style={{
          marginTop: 14,
          width: "100%",
          background: primary ? C.green : "#1A243F",
          color: primary ? "#03110B" : "#C8D4FF",
          border: "none",
          borderRadius: 10,
          padding: "11px 12px",
          fontWeight: 900,
          fontSize: 13,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? "Opening…" : label}
      </button>
    </div>
  );
}
