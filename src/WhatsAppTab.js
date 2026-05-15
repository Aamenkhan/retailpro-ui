import React, { useState, useEffect } from "react";
import { normPhone, updateShopWhatsAppPhone } from "./shopStorage";
import { formatProductPromo, openWhatsApp, upsertCustomer } from "./whatsapp";

const FF = "'Syne', sans-serif";
const CARD = "#10152A";
const BORDER = "#1E2540";
const TEXT = "#E0E4F0";
const MUTED = "#4A5580";
const WA_GREEN = "#25D366";

const inp = {
  width: "100%",
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "9px 12px",
  color: TEXT,
  fontFamily: FF,
  fontSize: 13,
  outline: "none",
};

const btnWa = {
  background: WA_GREEN,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 14px",
  fontFamily: FF,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};

export default function WhatsAppTab({
  products,
  shop,
  shopPhone,
  customers,
  setCustomers,
  showToast,
  onShopUpdate,
}) {
  const shopName = shop.shopName;
  const [productId, setProductId] = useState("");
  const [message, setMessage] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editShopPhone, setEditShopPhone] = useState(shopPhone || "");

  const selected = products.find((p) => String(p.id) === String(productId));

  useEffect(() => {
    setEditShopPhone(shopPhone || "");
  }, [shopPhone]);

  useEffect(() => {
    if (selected) setMessage(formatProductPromo(selected, shopName, shopPhone));
  }, [productId, selected, shopName, shopPhone]);

  const saveShopPhone = () => {
    const res = updateShopWhatsAppPhone(shop.id, editShopPhone);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    onShopUpdate?.(res.account);
    showToast("Dukaan ka WhatsApp number save ho gaya");
  };

  const addCustomer = () => {
    const ph = normPhone(newPhone);
    if (ph.length < 10) {
      showToast("Sahi mobile number daalo", "error");
      return;
    }
    setCustomers(upsertCustomer(customers, { name: newName, phone: ph }));
    setNewName("");
    setNewPhone("");
    showToast("Customer save ho gaya");
  };

  const sendPromo = (phone) => {
    if (!message.trim()) {
      showToast("Message likho", "error");
      return;
    }
    const ph = normPhone(phone || targetPhone);
    if (ph.length < 10) {
      showToast("Customer select karo ya mobile daalo", "error");
      return;
    }
    if (openWhatsApp(ph, message)) showToast("WhatsApp khul gaya — Send dabao");
  };

  const copyMessage = () => {
    if (!message.trim()) return;
    navigator.clipboard?.writeText(message);
    showToast("Message copy — broadcast list mein paste karo");
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>📲 WhatsApp</h2>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 16 }}>
        Har dukaan ka alag WhatsApp number. Bill aur promo message mein yeh number customer ko dikhega.
        Isi phone par WhatsApp login hona chahiye jab Send dabao.
      </p>

      <div
        style={{
          background: "#0a2a20",
          border: `1px solid ${WA_GREEN}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          maxWidth: 480,
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: WA_GREEN }}>🏪 Dukaan WhatsApp number</h3>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
          Abhi: <b style={{ color: TEXT }}>+91 {shopPhone || "set karo"}</b>
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ ...inp, flex: 1, minWidth: 160, marginBottom: 0 }}
            placeholder="9876543210"
            value={editShopPhone}
            onChange={(e) => setEditShopPhone(e.target.value)}
            inputMode="numeric"
          />
          <button type="button" onClick={saveShopPhone} style={btnWa}>
            Save number
          </button>
        </div>
      </div>

      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
          maxWidth: 560,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>🆕 Product update message</h3>
        <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{ ...inp, marginBottom: 12, cursor: "pointer" }}
        >
          <option value="">— Product choose karo —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.emoji} {p.name} ({p.unit})
            </option>
          ))}
        </select>
        <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>Message</label>
        <textarea
          rows={7}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inp, resize: "vertical", marginBottom: 12, fontFamily: FF }}
        />
        <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>
          Customer mobile (ya list se neeche choose karo)
        </label>
        <input
          style={{ ...inp, marginBottom: 12 }}
          placeholder="9876543210"
          value={targetPhone}
          onChange={(e) => setTargetPhone(e.target.value)}
          inputMode="numeric"
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => sendPromo()} style={btnWa}>
            📲 WhatsApp par bhejo
          </button>
          <button
            type="button"
            onClick={copyMessage}
            style={{
              background: CARD,
              color: TEXT,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "9px 14px",
              fontFamily: FF,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            📋 Copy message
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 18,
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>➕ Customer add</h3>
          <input
            style={{ ...inp, marginBottom: 8 }}
            placeholder="Naam"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            style={{ ...inp, marginBottom: 12 }}
            placeholder="Mobile"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            inputMode="numeric"
          />
          <button type="button" onClick={addCustomer} style={{ ...btnWa, width: "100%" }}>
            Save customer
          </button>
        </div>

        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 18,
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>
            👥 Customers ({customers.length})
          </h3>
          {!customers.length && (
            <p style={{ color: MUTED, fontSize: 13 }}>Checkout par mobile daalo — yahan save hoga</p>
          )}
          <div style={{ maxHeight: 280, overflow: "auto" }}>
            {customers.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: `1px solid ${BORDER}`,
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{c.phone}</div>
                </div>
                <button type="button" onClick={() => sendPromo(c.phone)} style={btnWa}>
                  Send
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
