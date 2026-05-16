import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { authAPI, otpAPI, setToken, setShopId } from "../api";

const C = { green: "#00E5A0", muted: "#6B7DAA", dim: "#0A1020", border: "#1C2840", text: "#C8D4FF" };
const inp = { width: "100%", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px", color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" };
const btn = { width: "100%", background: C.green, color: "#03110B", border: "none", borderRadius: 10, padding: "12px", fontWeight: 900, cursor: "pointer", marginTop: 12 };

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneToken, setPhoneToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [masked, setMasked] = useState("");
  const [form, setForm] = useState({ shopName: "", ownerName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const r = await otpAPI.send(phone);
      setOtpSent(true);
      setMasked(r.masked || "");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const r = await otpAPI.verify(phone, otp);
      setPhoneToken(r.phoneVerificationToken);
      setVerified(true);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const register = async (e) => {
    e.preventDefault();
    if (!verified) { setError("Pehle mobile OTP verify karo"); return; }
    setError("");
    setLoading(true);
    try {
      await authAPI.register({ ...form, phone, phoneVerificationToken: phoneToken });
      const login = await authAPI.login({ email: form.email, password: form.password });
      setToken(login.accessToken);
      setShopId(login.user.shopId);
      localStorage.setItem("rp_user", JSON.stringify(login.user));
      localStorage.setItem("rp_business", JSON.stringify(login.shop));
      navigate("/onboarding/2");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <OnboardingLayout step={1} title="Account banao" subtitle="7 din free trial · Mobile OTP zaroori (live)">
      <form onSubmit={register}>
        <label style={{ fontSize: 11, color: C.muted }}>Mobile *</label>
        <input style={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" inputMode="numeric" disabled={verified} />
        {!verified && (
          <>
            <button type="button" style={btn} onClick={sendOtp} disabled={loading}>{otpSent ? "OTP dubara bhejo" : "OTP bhejo"}</button>
            {otpSent && (
              <>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>OTP bheja: {masked}</p>
                <input style={{ ...inp, marginTop: 8 }} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} inputMode="numeric" />
                <button type="button" style={btn} onClick={verifyOtp} disabled={loading}>Verify OTP</button>
              </>
            )}
          </>
        )}
        {verified && <p style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>Mobile verified</p>}
        <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "20px 0" }} />
        <input style={inp} required placeholder="Shop name" value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))} />
        <input style={{ ...inp, marginTop: 8 }} required placeholder="Owner name" value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} />
        <input style={{ ...inp, marginTop: 8 }} required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input style={{ ...inp, marginTop: 8 }} required type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        <input style={{ ...inp, marginTop: 8 }} required type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
        {error && <p style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{error}</p>}
        <button type="submit" style={btn} disabled={loading || !verified}>{loading ? "..." : "Account banao → Demo"}</button>
      </form>
    </OnboardingLayout>
  );
}
