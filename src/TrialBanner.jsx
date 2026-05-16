import { Link } from "react-router-dom";

const C = { green: "#00E5A0", muted: "#6B7DAA", bg: "rgba(0,229,160,.08)", border: "#00E5A033" };

export default function TrialBanner({ trialDaysLeft, plan, status, currentPeriodEnd }) {
  if (status === "ACTIVE" || plan === "PRO" || plan === "ENTERPRISE") {
    const renew = currentPeriodEnd
      ? new Date(currentPeriodEnd).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
    return (
      <div
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "8px 16px",
          fontSize: 12,
          color: C.green,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        ✓ {plan === "ENTERPRISE" ? "Business" : "Pro"} plan active
        {renew ? ` · renews ${renew}` : ""}
        {" · "}
        <Link to="/pricing" style={{ color: C.green }}>
          Plans
        </Link>
      </div>
    );
  }

  if (trialDaysLeft == null) return null;

  return (
    <div
      style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 16px",
        fontSize: 12,
        color: C.green,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      Free trial: {trialDaysLeft} din bache ·{" "}
      <Link to="/pricing" style={{ color: C.green, fontWeight: 800 }}>
        Upgrade
      </Link>
    </div>
  );
}
