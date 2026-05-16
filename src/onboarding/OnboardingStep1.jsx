import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { authAPI, setToken, setShopId } from "../api";

const C = { green: "#00E5A0", muted: "#6B7DAA", dim: "#0A1020", border: "#1C2840", text: "#C8D4FF" };
const inp = {
  width: "100%",
  background: C.dim,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  padding: "10px 13px",
  color: C.text,
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
const btn = {
  width: "100%",
  background: C.green,
  color: "#03110B",
  border: "none",
  borderRadius: 10,
  padding: "12px",
  fontWeight: 900,
  cursor: "pointer",
  marginTop: 12,
};

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    if (!form.shopName || !form.email || !form.password) {
      setError("Shop name, email aur password zaroori hain");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password match nahi kar rahe");
      return;
    }
    if (form.password.length < 6) {
      setError("Password kam se kam 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authAPI.register({
        shopName: form.shopName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const login = await authAPI.login({
        email: form.email,
        password: form.password,
      });
      setToken(login.accessToken);
      setShopId(login.user.shopId);
      localStorage.setItem("rp_user", JSON.stringify(login.user));
      localStorage.setItem("rp_business", JSON.stringify(login.shop));
      navigate("/onboarding/2");
    } catch (e) {
      setError(e.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <OnboardingLayout
      step={1}
      title="Account banao"
      subtitle="Email + mobile — OTP ki zaroorat nahi · 7 din free trial"
    >
      <form onSubmit={register}>
        <input
          style={inp}
          required
          placeholder="Shop name *"
          value={form.shopName}
          onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
        />
        <input
          style={{ ...inp, marginTop: 8 }}
          placeholder="Owner name"
          value={form.ownerName}
          onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
        />
        <input
          style={{ ...inp, marginTop: 8 }}
          inputMode="numeric"
          placeholder="Mobile"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <input
          style={{ ...inp, marginTop: 8 }}
          required
          type="email"
          placeholder="Email (Gmail) *"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          style={{ ...inp, marginTop: 8 }}
          required
          type="password"
          placeholder="Password *"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <input
          style={{ ...inp, marginTop: 8 }}
          required
          type="password"
          placeholder="Confirm password *"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
        />
        <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
          Ya direct <a href="/app" style={{ color: C.green }}>/app</a> par register karo
        </p>
        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}
        <button type="submit" style={btn} disabled={loading}>
          {loading ? "..." : "Account banao → Demo"}
        </button>
      </form>
    </OnboardingLayout>
  );
}
