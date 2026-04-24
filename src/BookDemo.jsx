import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const C = { bg: "#04060E", card: "#090E1C", border: "#131B32", text: "#C8D4FF", muted: "#6B7DAA", green: "#00E5A0" };

const slots = [
  "Morning 10-12",
  "Afternoon 2-4",
  "Evening 6-8",
];

export default function BookDemo() {
  const navigate = useNavigate();
  const signup = safeParse(localStorage.getItem("retailpro_signup")) || {};
  const dates = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);
  const [phone, setPhone] = useState(signup.phone || "");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("retailpro_demo_booking", JSON.stringify({
      ...signup,
      phone,
      selectedDate,
      selectedSlot,
      createdAt: Date.now(),
    }));
    setIsConfirmed(true);
  };

  if (isConfirmed) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ maxWidth: 560, width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
          <h2 style={{ color: C.green, marginTop: 0 }}>Demo Confirm Ho Gaya ✓</h2>
          <p style={{ color: C.muted, fontSize: 18 }}>Hum aapko {phone} par call karenge!</p>
          <a href="https://wa.me/919407196146" target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 800, textDecoration: "none" }}>
            WhatsApp pe baat karo: wa.me/919407196146
          </a>
          <button
            type="button"
            onClick={() => navigate("/app")}
            style={{ marginTop: 16, width: "100%", border: "none", background: C.green, color: "#03110B", borderRadius: 12, padding: "13px 16px", fontWeight: 900, fontSize: 17, cursor: "pointer" }}
          >
            RetailPRO App Try Karo →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ maxWidth: 640, width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Demo Book Karo</h1>
        <p style={{ color: C.muted }}>Hamare expert aapko personally setup karenge</p>

        <div style={{ background: "#0B1327", border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div><b>Name:</b> {signup.ownerName || "-"}</div>
          <div><b>Business:</b> {signup.businessName || "-"}</div>
        </div>

        <form onSubmit={onSubmit}>
          <label style={label}>Date (next 7 days)</label>
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={input}>
            {dates.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <label style={label}>Time Slot</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 12 }}>
            {slots.map((s) => (
              <button type="button" key={s} onClick={() => setSelectedSlot(s)} style={{ borderRadius: 10, border: `1px solid ${selectedSlot === s ? C.green : C.border}`, background: selectedSlot === s ? "rgba(0,229,160,.14)" : "#0B1327", color: selectedSlot === s ? C.green : C.text, padding: "10px 8px", fontWeight: 700, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>

          <label style={label}>Phone confirm karo</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />

          <button type="submit" style={{ width: "100%", border: "none", background: C.green, color: "#03110B", borderRadius: 12, padding: "13px 16px", fontWeight: 900, fontSize: 17, cursor: "pointer" }}>
            Demo Confirm Karo ✓
          </button>
        </form>

        <a href="https://wa.me/919407196146" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, color: C.green, fontWeight: 800, textDecoration: "none" }}>
          WhatsApp pe baat karo: wa.me/919407196146
        </a>
      </div>
    </div>
  );
}

const label = { display: "block", marginBottom: 6, color: C.muted, fontSize: 12 };
const input = { width: "100%", marginBottom: 12, background: "#04060E", border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: "10px 12px", fontFamily: "'Space Grotesk', sans-serif" };

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
