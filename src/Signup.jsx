import { useState } from "react";
import { useNavigate } from "react-router-dom";

const C = { bg: "#04060E", card: "#090E1C", border: "#131B32", text: "#C8D4FF", muted: "#6B7DAA", green: "#00E5A0" };

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", ownerName: "", phone: "", city: "", businessType: "Retail Shop" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const unameBase=(form.ownerName||form.businessName||"shop").toLowerCase().replace(/[^a-z0-9]+/g,"").slice(0,10)||"shop";
    const username=`${unameBase}${(form.phone||Date.now().toString()).slice(-4)}`;
    const password=(form.phone||"123456").slice(-6)||"123456";
    const tenantsRaw=localStorage.getItem("rp_tenants");
    const tenants=tenantsRaw?JSON.parse(tenantsRaw):[];
    const newTenant={
      id:username,
      username,
      password,
      businessName:form.businessName,
      phone:form.phone,
      plan:"free",
      createdAt:Date.now(),
    };
    localStorage.setItem("rp_tenants",JSON.stringify([...tenants.filter(t=>t.id!==newTenant.id),newTenant]));
    localStorage.setItem("rp_current_tenant",newTenant.id);
    localStorage.setItem("retailpro_signup", JSON.stringify({ ...form, username, password, createdAt: Date.now() }));
    navigate("/app");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', sans-serif", display: "grid", placeItems: "center", padding: 16 }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}</style>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 520, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>7 Din Free Trial Shuru Karo</h1>
        <p style={{ color: C.muted, marginTop: 0, marginBottom: 16 }}>Koi credit card nahi chahiye</p>

        <Field label="Business Name" value={form.businessName} onChange={(v) => setForm((p) => ({ ...p, businessName: v }))} required />
        <Field label="Owner Name" value={form.ownerName} onChange={(v) => setForm((p) => ({ ...p, ownerName: v }))} required />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} required />
        <Field label="City" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} required />

        <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>Business Type</label>
        <select value={form.businessType} onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))} style={inputStyle(C)}>
          {[
            "Retail Shop",
            "Wholesale",
            "Supermarket",
            "Medical Store",
            "Electronics",
            "Clothing",
            "Restaurant",
            "Other",
          ].map((x) => <option key={x}>{x}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 18, width: "100%", background: C.green, color: "#03110B", border: "none", borderRadius: 12, padding: "14px 16px", fontWeight: 900, fontSize: 17, cursor: "pointer" }}>
          Free Demo Shuru Karo ?
        </button>

        <div style={{ marginTop: 14, color: C.muted, fontSize: 14 }}>7 days free · No credit card · Setup in 5 minutes</div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <>
      <label style={{ fontSize: 12, color: "#6B7DAA", display: "block", marginBottom: 6 }}>{label}</label>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle({ bg: "#04060E", border: "#131B32", text: "#C8D4FF" })} />
    </>
  );
}

function inputStyle(C) {
  return {
    width: "100%",
    marginBottom: 12,
    background: C.bg,
    border: `1px solid ${C.border}`,
    color: C.text,
    borderRadius: 10,
    padding: "10px 12px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    outline: "none",
  };
}
