import { useNavigate } from "react-router-dom";
import RetailPROApp from "./App";

export default function DemoAccess() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ background: "#00E5A0", color: "#03110B", padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800 }}>
        <span>?? Free Trial - 3 Mahine Baaki | Pro mein upgrade karo ?</span>
        <button onClick={() => navigate("/pricing")} style={{ border: "1px solid #03110B", background: "transparent", borderRadius: 8, padding: "6px 12px", fontWeight: 800, cursor: "pointer" }}>
          Upgrade Now
        </button>
      </div>
      <RetailPROApp />
    </div>
  );
}
