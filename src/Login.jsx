import { useState } from "react";
import { authAPI, setToken, setShopId } from "./api";

const C = {
  bg:"#04060E", card:"#090E1C", border:"#131B32", border2:"#1C2840",
  text:"#C8D4FF", muted:"#374875", dim:"#0A1020",
  green:"#00E5A0", blue:"#3B82F6",
};
const inp = (ex={}) => ({width:"100%",background:C.dim,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontFamily:"'Space Grotesk',sans-serif",fontSize:13,outline:"none",...ex});
const lbl = {fontSize:10,color:C.muted,marginBottom:5,display:"block",fontWeight:700,textTransform:"uppercase",letterSpacing:.5};

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [regForm, setRegForm] = useState({ shopName:"", ownerName:"", email:"", phone:"", password:"", confirmPassword:"" });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setError("Email aur password daalo"); return; }
    setLoading(true); setError("");
    try {
      const data = await authAPI.login({ email: loginForm.email, password: loginForm.password });
      setToken(data.accessToken);
      setShopId(data.user.shopId);
      localStorage.setItem("rp_user", JSON.stringify(data.user));
      localStorage.setItem("rp_business", JSON.stringify(data.shop));
      onLogin(data);
    } catch (e) {
      setError(e.message || "Login failed");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!regForm.shopName || !regForm.email || !regForm.password) { setError("Saari fields bharo"); return; }
    if (regForm.password !== regForm.confirmPassword) { setError("Passwords match nahi kar rahe"); return; }
    if (regForm.password.length < 6) { setError("Password min 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const data = await authAPI.register({
        shopName: regForm.shopName,
        ownerName: regForm.ownerName,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
      });
      setError("");
      alert(`Shop registered! Trial: 14 days. Ab login karo.`);
      setTab("login");
      setLoginForm({ email: regForm.email, password: "" });
    } catch (e) {
      setError(e.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input:focus{border-color:${C.green}!important;}`}</style>

      <div style={{width:460,maxWidth:"100%"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:44,marginBottom:8}}>🏪</div>
          <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:"-1px"}}>
            <span style={{color:C.green}}>Thtwaat</span>
            <span style={{color:C.blue}}> POS</span>
          </div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Complete Business Suite</div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:C.dim,borderRadius:12,padding:4,marginBottom:20}}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{flex:1,padding:"10px 0",borderRadius:9,border:"none",background:tab===t?C.green:"transparent",color:tab===t?"#030810":C.muted,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",textTransform:"capitalize"}}>
              {t === "login" ? "🔐 Login" : "🏪 New Shop"}
            </button>
          ))}
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:20,padding:28}}>

          {/* ERROR */}
          {error && (
            <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:9,padding:"10px 14px",color:"#EF4444",fontSize:12,fontWeight:600,marginBottom:16}}>
              ✕ {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <div style={{display:"grid",gap:14}}>
              <div>
                <label style={lbl}>Email</label>
                <input style={inp()} type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} placeholder="shop@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()}/>
              </div>
              <div>
                <label style={lbl}>Password</label>
                <input style={inp()} type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()}/>
              </div>
              <button onClick={handleLogin} disabled={loading} style={{background:`linear-gradient(135deg,#00a876,${C.green})`,color:"#030810",border:"none",borderRadius:11,padding:"13px 0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:14,marginTop:4,opacity:loading?0.7:1}}>
                {loading ? "Logging in..." : "🔐 Login"}
              </button>
              <div style={{textAlign:"center",fontSize:12,color:C.muted}}>
                Naya shop? <span onClick={() => setTab("register")} style={{color:C.green,cursor:"pointer",fontWeight:700}}>Register karo →</span>
              </div>
            </div>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={lbl}>Shop Name *</label>
                <input style={inp()} value={regForm.shopName} onChange={e => setRegForm(p => ({...p, shopName: e.target.value}))} placeholder="Sharma General Store"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={lbl}>Owner Name</label>
                  <input style={inp()} value={regForm.ownerName} onChange={e => setRegForm(p => ({...p, ownerName: e.target.value}))} placeholder="Ramesh Sharma"/>
                </div>
                <div>
                  <label style={lbl}>Phone</label>
                  <input style={inp()} value={regForm.phone} onChange={e => setRegForm(p => ({...p, phone: e.target.value}))} placeholder="9876543210"/>
                </div>
              </div>
              <div>
                <label style={lbl}>Email *</label>
                <input style={inp()} type="email" value={regForm.email} onChange={e => setRegForm(p => ({...p, email: e.target.value}))} placeholder="shop@email.com"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={lbl}>Password *</label>
                  <input style={inp()} type="password" value={regForm.password} onChange={e => setRegForm(p => ({...p, password: e.target.value}))} placeholder="Min 6 chars"/>
                </div>
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input style={inp()} type="password" value={regForm.confirmPassword} onChange={e => setRegForm(p => ({...p, confirmPassword: e.target.value}))} placeholder="Repeat"/>
                </div>
              </div>
              <div style={{background:"rgba(0,229,160,.05)",border:`1px solid ${C.green}22`,borderRadius:9,padding:10,fontSize:11,color:C.muted}}>
                ✓ 14 day free trial · No credit card · ₹499/month baad mein
              </div>
              <button onClick={handleRegister} disabled={loading} style={{background:`linear-gradient(135deg,${C.blue}CC,${C.blue})`,color:"#fff",border:"none",borderRadius:11,padding:"13px 0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:14,opacity:loading?0.7:1}}>
                {loading ? "Registering..." : "🏪 Register Shop"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}