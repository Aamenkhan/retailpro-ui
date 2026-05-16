import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";

const VIDEO_ID = process.env.REACT_APP_DEMO_YOUTUBE_ID || "dQw4w9WgXcQ";

export default function OnboardingStep2() {
  const navigate = useNavigate();
  return (
    <OnboardingLayout step={2} title="Thtwaat POS demo" subtitle="2 minute mein samjho kaise kaam karta hai">
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe
          title="Thtwaat POS Demo"
          src={`https://www.youtube.com/embed/${VIDEO_ID}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button type="button" onClick={() => navigate("/onboarding/1")} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #131B32", background: "transparent", color: "#C8D4FF", cursor: "pointer" }}>← Back</button>
        <button type="button" onClick={() => navigate("/onboarding/3")} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#00E5A0", color: "#03110B", fontWeight: 900, cursor: "pointer" }}>Aage badho →</button>
      </div>
    </OnboardingLayout>
  );
}
