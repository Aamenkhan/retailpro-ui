import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import SubscribeButton from "../SubscribeButton";
const WA = process.env.REACT_APP_SUPPORT_WHATSAPP || "919876543210";
const ENTERPRISE = process.env.REACT_APP_ENTERPRISE_EMAIL || "support@retailproai.in";

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Namaste, mujhe Thtwaat POS ke baare mein jaanna hai.");

  const waLink = `https://wa.me/${WA.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  const mailLink = `mailto:${ENTERPRISE}?subject=${encodeURIComponent("Enterprise / Company POS Requirement")}&body=${encodeURIComponent("Company name:\nBranches:\nRequirements:\n")}`;

  return (
    <OnboardingLayout step={3} title="Shuru karo" subtitle="WhatsApp, plan choose karo, ya 7 din free">
      <p style={{ fontSize: 14, color: "#6B7DAA", marginTop: 0 }}>WhatsApp par seedha message</p>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} style={{ width: "100%", background: "#0A1020", border: "1px solid #1C2840", borderRadius: 9, color: "#C8D4FF", padding: 10, boxSizing: "border-box" }} />
      <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#25D366", color: "#fff", padding: 12, borderRadius: 10, fontWeight: 800, textDecoration: "none", marginTop: 10 }}>WhatsApp par message bhejo</a>
      <hr style={{ border: "none", borderTop: "1px solid #131B32", margin: "24px 0" }} />
      <p style={{ fontWeight: 800, marginBottom: 10 }}>Plan (1 month)</p>
      <div style={{ display: "grid", gap: 10 }}>
        <SubscribeButton tier="PRO" label="Pro — ₹599/month" />
        <SubscribeButton tier="BUSINESS" label="Business — ₹999/month" />
      </div>
      <button type="button" onClick={() => navigate("/app")} style={{ width: "100%", marginTop: 12, padding: 12, borderRadius: 10, border: "1px solid #131B32", background: "#1A243F", color: "#C8D4FF", fontWeight: 700, cursor: "pointer" }}>7 din free trial — Dashboard kholo</button>
      <hr style={{ border: "none", borderTop: "1px solid #131B32", margin: "24px 0" }} />
      <p style={{ fontSize: 13, color: "#6B7DAA" }}>Company / multi-branch? Special setup chahiye?</p>
      <a href={mailLink} style={{ display: "block", textAlign: "center", marginTop: 8, color: "#00E5A0", fontWeight: 700 }}>Email: {ENTERPRISE}</a>
    </OnboardingLayout>
  );
}
