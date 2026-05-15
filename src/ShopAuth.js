import React, { useState } from "react";
import { loginShop, registerShop, saveSession, normPhone } from "./shopStorage";

const inp = {
  width: "100%",
  background: "#10152A",
  border: "1px solid #1E2540",
  borderRadius: 10,
  padding: "11px 14px",
  color: "#E0E4F0",
  fontFamily: "'Syne', sans-serif",
  fontSize: 14,
  outline: "none",
  marginBottom: 12,
};

export default function ShopAuth({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const finish = (acc) => {
    saveSession(acc.id);
    onLogin(acc);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (normPhone(phone).length < 10) {
      setError("Sahi 10-digit mobile number daalo");
      return;
    }
    if (!password) {
      setError("Password daalo");
      return;
    }
    const res = loginShop({ phone, password });
    if (res.error) {
      setError(res.error);
      return;
    }
    finish(res.account);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    if (!shopName.trim()) {
      setError("Dukaan ka naam daalo");
      return;
    }
    if (normPhone(phone).length < 10) {
      setError("Sahi 10-digit mobile number daalo");
      return;
    }
    if (password.length < 4) {
      setError("Password kam se kam 4 character");
      return;
    }
    if (password !== confirm) {
      setError("Password match nahi ho raha");
      return;
    }
    const res = registerShop({ shopName, phone, password });
    if (res.error) {
      setError(res.error);
      return;
    }
    finish(res.account);
  };

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => {
        setTab(id);
        setError("");
      }}
      style={{
        flex: 1,
        padding: "10px 0",
        borderRadius: 9,
        border: "none",
        background: tab === id ? "#00C896" : "transparent",
        color: tab === id ? "#080C18" : "#4A5580",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}body{background:#080C18;}
        input:focus{border-color:#00C896!important;outline:none;}
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080C18",
          fontFamily: "'Syne', sans-serif",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#0D1226",
            border: "1px solid #1E2540",
            borderRadius: 20,
            padding: "28px 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              <span style={{ color: "#00C896" }}>Retail</span>
              <span style={{ color: "#60a5fa" }}>PRO</span>
            </div>
            <div style={{ fontSize: 12, color: "#4A5580", marginTop: 6 }}>
              Har dukandar ka alag data — login karke apni dukaan kholo
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#10152A",
              borderRadius: 10,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {tabBtn("login", "Login")}
            {tabBtn("register", "Nayi Dukaan")}
          </div>
          {error && (
            <div
              style={{
                background: "rgba(231,76,60,0.12)",
                border: "1px solid rgba(231,76,60,0.4)",
                color: "#E74C3C",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}
          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>MOBILE</label>
              <input style={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>PASSWORD</label>
              <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#00a876,#00C896)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "13px 0",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>DUKAAN KA NAAM</label>
              <input style={inp} value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Sharma Kirana" />
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>MOBILE</label>
              <input style={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>PASSWORD</label>
              <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 4 chars" />
              <label style={{ fontSize: 11, color: "#4A5580", fontWeight: 700 }}>CONFIRM PASSWORD</label>
              <input style={inp} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Dobara password" />
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "13px 0",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                Register
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
