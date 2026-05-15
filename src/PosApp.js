import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  loadShopData,
  saveShopData,
  normPhone,
  getShopWhatsAppPhone,
} from "./shopStorage";
import { formatBillMessage, openWhatsApp, upsertCustomer } from "./whatsapp";
import WhatsAppTab from "./WhatsAppTab";

const CATS = [
  "All",
  "Grocery",
  "Dairy",
  "Snacks",
  "Home",
  "Personal",
  "Beverages",
  "Electronics",
  "Other",
];
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const uid = () => `ORD-${Date.now().toString(36).toUpperCase()}`;
const todayK = () => new Date().toISOString().slice(0, 10);
const QR_URL = (t) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(t)}`;

const FF = "'Syne', sans-serif";
const BG = "#080C18";
const CARD = "#10152A";
const BORDER = "#1E2540";
const TEXT = "#E0E4F0";
const MUTED = "#4A5580";
const ACCENT = "#6C5CE7";
const GREEN = "#00B894";
const RED = "#FF6B6B";
const ORANGE = "#FDCB6E";
const WA_GREEN = "#25D366";

const btnWa = {
  flex: 1,
  background: WA_GREEN,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 0",
  fontFamily: FF,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg =
    type === "error" ? "#3D1515" : type === "warn" ? "#3D3015" : "#153D2A";
  const col = type === "error" ? RED : type === "warn" ? ORANGE : GREEN;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: bg,
        border: `1px solid ${col}`,
        color: col,
        padding: "12px 20px",
        borderRadius: 10,
        fontFamily: FF,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        maxWidth: 360,
      }}
    >
      {msg}
    </div>
  );
}

function ReceiptModal({ order, shopName, shopPhone, onClose, showToast }) {
  const sendBillWhatsApp = () => {
    if (!order.customerPhone || normPhone(order.customerPhone).length < 10) {
      showToast?.("Customer ka 10-digit mobile daalo", "error");
      return;
    }
    const text = formatBillMessage(order, shopName, shopPhone);
    if (openWhatsApp(order.customerPhone, text)) {
      showToast?.("WhatsApp khul gaya — Send dabao", "ok");
    }
  };
  const printRef = useRef(null);
  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt ${order.id}</title>
      <style>body{font-family:monospace;padding:20px;max-width:320px;margin:0 auto}
      h2{text-align:center;margin:0 0 8px}table{width:100%;border-collapse:collapse;font-size:13px}
      td{padding:4px 0}.r{text-align:right}.tot{font-weight:bold;border-top:2px dashed #000;padding-top:8px}
      </style></head><body>
      <h2>${shopName}</h2>
      ${shopPhone ? `<p style="text-align:center;margin:0;font-size:12px">📞 +91 ${normPhone(shopPhone)}</p>` : ""}
      <p style="text-align:center;margin:0 0 12px;font-size:12px">${order.id} · ${new Date(order.ts).toLocaleString("en-IN")}</p>
      <table>${order.items.map((i) => `<tr><td>${i.name} x${i.qty}</td><td class="r">${fmt(i.lineTotal)}</td></tr>`).join("")}
      <tr><td>Subtotal</td><td class="r">${fmt(order.subtotal)}</td></tr>
      ${order.discount ? `<tr><td>Discount</td><td class="r">-${fmt(order.discount)}</td></tr>` : ""}
      <tr><td>GST 5%</td><td class="r">${fmt(order.gst)}</td></tr>
      <tr class="tot"><td>Total</td><td class="r">${fmt(order.total)}</td></tr></table>
      <p style="text-align:center;margin-top:16px;font-size:12px">Payment: ${order.payment} · ${order.mode}</p>
      ${order.customer ? `<p style="text-align:center;font-size:12px">Customer: ${order.customer}</p>` : ""}
      <p style="text-align:center;margin-top:20px;font-size:11px">Thank you!</p>
      </body></html>`);
    w.document.close();
    w.print();
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        zIndex: 8000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        ref={printRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          color: "#111",
          borderRadius: 12,
          padding: 24,
          maxWidth: 360,
          width: "100%",
          fontFamily: "monospace",
          fontSize: 13,
        }}
      >
        <h2 style={{ textAlign: "center", margin: "0 0 4px", fontFamily: FF }}>
          {shopName}
        </h2>
        {shopPhone && (
          <p style={{ textAlign: "center", margin: "0 0 8px", fontSize: 12, color: "#25D366", fontWeight: 700 }}>
            📞 WhatsApp: +91 {normPhone(shopPhone)}
          </p>
        )}
        <p style={{ textAlign: "center", margin: "0 0 16px", fontSize: 11, color: "#666" }}>
          {order.id} · {new Date(order.ts).toLocaleString("en-IN")}
        </p>
        {order.items.map((i, ix) => (
          <div
            key={ix}
            style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
          >
            <span>
              {i.name} ×{i.qty}
            </span>
            <span>{fmt(i.lineTotal)}</span>
          </div>
        ))}
        <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "12px 0" }} />
        <Row label="Subtotal" val={fmt(order.subtotal)} />
        {order.discount > 0 && <Row label="Discount" val={`-${fmt(order.discount)}`} />}
        <Row label="GST 5%" val={fmt(order.gst)} />
        <Row label="Total" val={fmt(order.total)} bold />
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 11 }}>
          {order.payment} · {order.mode}
          {order.customer ? ` · ${order.customer}` : ""}
          {order.customerPhone ? ` · 📱 ${order.customerPhone}` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <button type="button" onClick={sendBillWhatsApp} style={btnWa}>
            📲 WhatsApp Bill
          </button>
          <button type="button" onClick={handlePrint} style={btnPri}>
            Print
          </button>
          <button type="button" onClick={onClose} style={btnSec}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, val, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: bold ? 700 : 400,
        marginBottom: 4,
      }}
    >
      <span>{label}</span>
      <span>{val}</span>
    </div>
  );
}

const btnPri = {
  flex: 1,
  background: ACCENT,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 0",
  fontFamily: FF,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};
const btnSec = {
  flex: 1,
  background: CARD,
  color: TEXT,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 0",
  fontFamily: FF,
  cursor: "pointer",
  fontSize: 14,
};
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
  boxSizing: "border-box",
};

function ProductForm({ onSave, existing }) {
  const [form, setForm] = useState(
    existing || {
      name: "",
      unit: "",
      retailPrice: "",
      wholesalePrice: "",
      minWholesaleQty: 10,
      category: "Grocery",
      stock: "",
      emoji: "📦",
      barcode: "",
    }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return { error: "Product name required" };
    const p = {
      name: form.name.trim(),
      unit: form.unit.trim() || "pc",
      retailPrice: Number(form.retailPrice) || 0,
      wholesalePrice: Number(form.wholesalePrice) || 0,
      minWholesaleQty: Number(form.minWholesaleQty) || 10,
      category: form.category,
      stock: Number(form.stock) || 0,
      emoji: form.emoji || "📦",
      barcode: String(form.barcode || "").trim(),
    };
    onSave(p);
  };
  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      <Field label="Name">
        <input style={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Unit">
        <input style={inp} value={form.unit} onChange={(e) => set("unit", e.target.value)} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Retail price">
          <input
            style={inp}
            type="number"
            value={form.retailPrice}
            onChange={(e) => set("retailPrice", e.target.value)}
          />
        </Field>
        <Field label="Wholesale price">
          <input
            style={inp}
            type="number"
            value={form.wholesalePrice}
            onChange={(e) => set("wholesalePrice", e.target.value)}
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Min wholesale qty">
          <input
            style={inp}
            type="number"
            value={form.minWholesaleQty}
            onChange={(e) => set("minWholesaleQty", e.target.value)}
          />
        </Field>
        <Field label="Stock">
          <input
            style={inp}
            type="number"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Category">
        <select
          style={inp}
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {CATS.filter((c) => c !== "All").map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Emoji">
          <input style={inp} value={form.emoji} onChange={(e) => set("emoji", e.target.value)} />
        </Field>
        <Field label="Barcode">
          <input style={inp} value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
        </Field>
      </div>
      <button type="submit" style={{ ...btnPri, width: "100%", marginTop: 8 }}>
        {existing ? "Update product" : "Add product"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", color: MUTED, fontSize: 11, marginBottom: 4, fontFamily: FF }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const qtyBtn = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: `1px solid ${BORDER}`,
  background: BG,
  color: TEXT,
  cursor: "pointer",
  fontFamily: FF,
  fontSize: 14,
};
const th = { padding: "10px 8px", fontWeight: 600 };
const td = { padding: "10px 8px" };

function RowLite({ label, val, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
        fontWeight: bold ? 700 : 400,
        color: bold ? TEXT : MUTED,
      }}
    >
      <span>{label}</span>
      <span style={{ color: bold ? GREEN : TEXT }}>{val}</span>
    </div>
  );
}

function PosTab({ products, onCheckout, showToast }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [mode, setMode] = useState("retail");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Cash");
  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const priceOf = (p) => (mode === "wholesale" ? p.wholesalePrice : p.retailPrice);
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || (p.barcode || "").includes(search);
    return matchSearch && (cat === "All" || p.category === cat);
  });
  const addToCart = (p) => {
    if (p.stock <= 0) {
      showToast(`${p.name} out of stock`, "error");
      return;
    }
    setCart((c) => {
      const ex = c.find((x) => x.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) {
          showToast("Not enough stock", "warn");
          return c;
        }
        return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...c,
        {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          unit: p.unit,
          price: priceOf(p),
          qty: 1,
          maxStock: p.stock,
        },
      ];
    });
  };
  const setQty = (id, qty) => {
    if (qty <= 0) setCart((c) => c.filter((x) => x.id !== id));
    else
      setCart((c) =>
        c.map((x) => {
          if (x.id !== id) return x;
          const prod = products.find((p) => p.id === id);
          const max = prod ? prod.stock : x.maxStock;
          return { ...x, qty: Math.min(qty, max), maxStock: max };
        })
      );
  };
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = Math.min(Number(discount) || 0, subtotal);
  const afterDisc = subtotal - disc;
  const gst = Math.round(afterDisc * 0.05);
  const total = afterDisc + gst;
  const checkout = () => {
    if (!cart.length) {
      showToast("Cart is empty", "error");
      return;
    }
    if (mode === "wholesale" && !customer.trim()) {
      showToast("Wholesale ke liye customer name daalo", "error");
      return;
    }
    const items = cart.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price,
      lineTotal: i.price * i.qty,
    }));
    const order = {
      id: uid(),
      ts: Date.now(),
      date: todayK(),
      mode,
      customer: customer.trim(),
      customerPhone: normPhone(customerPhone),
      items,
      subtotal,
      discount: disc,
      gst,
      total,
      payment,
    };
    onCheckout(order, cart.map((c) => ({ id: c.id, qty: c.qty })));
    setCart([]);
    setDiscount(0);
    setCustomer("");
    setCustomerPhone("");
  };
  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 40px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            style={{ ...inp, flex: 1, minWidth: 160 }}
            placeholder="Search name or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {["retail", "wholesale"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: `1px solid ${mode === m ? ACCENT : BORDER}`,
                  background: mode === m ? ACCENT : CARD,
                  color: mode === m ? "#fff" : MUTED,
                  fontFamily: FF,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontSize: 13,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: `1px solid ${cat === c ? ACCENT : BORDER}`,
                background: cat === c ? "#1a1540" : CARD,
                color: cat === c ? ACCENT : MUTED,
                fontFamily: FF,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
            overflow: "auto",
            flex: 1,
          }}
        >
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: 12,
                cursor: p.stock > 0 ? "pointer" : "not-allowed",
                textAlign: "left",
                opacity: p.stock <= 0 ? 0.5 : 1,
                fontFamily: FF,
              }}
            >
              <div style={{ fontSize: 28 }}>{p.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginTop: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{p.unit}</div>
              <div style={{ fontSize: 14, color: GREEN, fontWeight: 700, marginTop: 4 }}>{fmt(priceOf(p))}</div>
              <div style={{ fontSize: 10, color: p.stock <= 5 ? ORANGE : MUTED }}>Stock: {p.stock}</div>
            </button>
          ))}
        </div>
      </div>
      <aside
        style={{
          width: 300,
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Cart</h3>
        <div style={{ flex: 1, overflow: "auto", marginBottom: 12 }}>
          {!cart.length && (
            <p style={{ color: MUTED, fontSize: 13, textAlign: "center", marginTop: 40 }}>Cart empty</p>
          )}
          {cart.map((i) => (
            <div
              key={i.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{i.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{i.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{fmt(i.price)} each</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button type="button" onClick={() => setQty(i.id, i.qty - 1)} style={qtyBtn}>−</button>
                <span style={{ width: 24, textAlign: "center", fontSize: 13 }}>{i.qty}</span>
                <button type="button" onClick={() => setQty(i.id, i.qty + 1)} style={qtyBtn}>+</button>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, width: 56, textAlign: "right" }}>
                {fmt(i.price * i.qty)}
              </div>
            </div>
          ))}
        </div>
        <input
          style={{ ...inp, marginBottom: 8 }}
          placeholder={mode === "wholesale" ? "Customer name *" : "Customer name (optional)"}
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <input
          style={{ ...inp, marginBottom: 10 }}
          placeholder="Customer mobile (WhatsApp bill)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          inputMode="numeric"
        />
        <label style={{ fontSize: 11, color: MUTED }}>Discount (₹)</label>
        <input
          style={{ ...inp, marginBottom: 10 }}
          type="number"
          min={0}
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <div style={{ fontSize: 12, marginBottom: 8 }}>
          <RowLite label="Subtotal" val={fmt(subtotal)} />
          {disc > 0 && <RowLite label="Discount" val={`-${fmt(disc)}`} />}
          <RowLite label="GST 5%" val={fmt(gst)} />
          <RowLite label="Total" val={fmt(total)} bold />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {["Cash", "UPI", "Card"].map((pm) => (
            <button
              key={pm}
              type="button"
              onClick={() => setPayment(pm)}
              style={{
                flex: 1,
                minWidth: 70,
                padding: "8px 4px",
                borderRadius: 8,
                border: `1px solid ${payment === pm ? GREEN : BORDER}`,
                background: payment === pm ? "#0a2a20" : CARD,
                color: payment === pm ? GREEN : MUTED,
                fontFamily: FF,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {pm}
            </button>
          ))}
        </div>
        <button type="button" onClick={checkout} style={{ ...btnPri, width: "100%" }}>
          Checkout · {fmt(total)}
        </button>
      </aside>
    </div>
  );
}

function OrdersTab({ orders, onReceipt, shopName, shopPhone, showToast }) {
  const sendBill = (o) => {
    if (!o.customerPhone || normPhone(o.customerPhone).length < 10) {
      showToast("Is order mein customer mobile nahi", "error");
      return;
    }
    openWhatsApp(o.customerPhone, formatBillMessage(o, shopName, shopPhone));
    showToast("WhatsApp khul gaya — Send dabao");
  };
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>Order history</h2>
      {!orders.length && <p style={{ color: MUTED }}>No orders yet</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</div>
              <div style={{ fontSize: 12, color: MUTED }}>
                {new Date(o.ts).toLocaleString("en-IN")} · {o.mode} · {o.payment}
                {o.customer ? ` · ${o.customer}` : ""}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {o.items.map((i) => `${i.name}×${i.qty}`).join(", ")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{fmt(o.total)}</span>
              {o.customerPhone && normPhone(o.customerPhone).length >= 10 && (
                <button type="button" onClick={() => sendBill(o)} style={btnWa}>
                  📲 Bill
                </button>
              )}
              <button type="button" onClick={() => onReceipt(o)} style={btnSec}>Receipt</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryTab({ products, onAdjust }) {
  const [adjId, setAdjId] = useState(null);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const low = products.filter((p) => p.stock <= 5);
  return (
    <div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Inventory</h2>
      {low.length > 0 && (
        <div style={{ background: "#2a2010", border: `1px solid ${ORANGE}`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
          ⚠️ Low stock: {low.map((p) => `${p.name} (${p.stock})`).join(", ")}
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ color: MUTED, textAlign: "left" }}>
            <th style={th}>Product</th>
            <th style={th}>Category</th>
            <th style={th}>Retail</th>
            <th style={th}>Stock</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}` }}>
              <td style={td}>{p.emoji} {p.name} <span style={{ color: MUTED }}>{p.unit}</span></td>
              <td style={td}>{p.category}</td>
              <td style={td}>{fmt(p.retailPrice)}</td>
              <td style={{ ...td, color: p.stock <= 5 ? ORANGE : TEXT, fontWeight: 700 }}>{p.stock}</td>
              <td style={td}>
                <button type="button" onClick={() => setAdjId(adjId === p.id ? null : p.id)} style={{ ...btnSec, padding: "6px 12px", fontSize: 12 }}>Adjust</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {adjId && (
        <div style={{ marginTop: 16, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, maxWidth: 320 }}>
          <p style={{ margin: "0 0 10px", fontSize: 14 }}>Adjust: {products.find((p) => p.id === adjId)?.name}</p>
          <input style={inp} type="number" placeholder="+/- quantity" value={delta} onChange={(e) => setDelta(e.target.value)} />
          <input style={{ ...inp, marginTop: 8 }} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button
            type="button"
            style={{ ...btnPri, marginTop: 10, width: "100%" }}
            onClick={() => {
              const d = Number(delta);
              if (!d) return;
              onAdjust(adjId, d, note);
              setAdjId(null);
              setDelta("");
              setNote("");
            }}
          >
            Save adjustment
          </button>
        </div>
      )}
    </div>
  );
}

function ReportTab({ products, orders }) {
  const [date, setDate] = useState(todayK());
  const dayOrders = orders.filter((o) => o.date === date);
  const revenue = dayOrders.reduce((s, o) => s + o.total, 0);
  const count = dayOrders.length;
  const avg = count ? Math.round(revenue / count) : 0;
  const byPayment = ["Cash", "UPI", "Card"].map((pm) => ({
    pm,
    total: dayOrders.filter((o) => o.payment === pm).reduce((s, o) => s + o.total, 0),
  }));
  const lowStock = products.filter((p) => p.stock <= 5);
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>Daily report</h2>
      <input type="date" style={{ ...inp, width: "auto", marginBottom: 20 }} value={date} onChange={(e) => setDate(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Revenue", val: fmt(revenue), col: GREEN },
          { label: "Orders", val: count, col: ACCENT },
          { label: "Avg order", val: fmt(avg), col: ORANGE },
        ].map((s) => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: MUTED }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.col }}>{s.val}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 15, marginBottom: 10 }}>By payment</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {byPayment.map(({ pm, total }) => (
          <div key={pm} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 16px", fontSize: 13 }}>
            {pm}: <strong style={{ color: GREEN }}>{fmt(total)}</strong>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Low stock</h3>
      {lowStock.length ? (
        <ul style={{ margin: 0, paddingLeft: 20, color: ORANGE, fontSize: 13 }}>
          {lowStock.map((p) => (
            <li key={p.id}>{p.name} — {p.stock} left</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: MUTED, fontSize: 13 }}>All stock levels OK</p>
      )}
    </div>
  );
}

function StockLogTab({ stockLog }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>Stock log</h2>
      {!stockLog.length && <p style={{ color: MUTED }}>No stock movements yet</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {stockLog.map((e, i) => (
          <div
            key={`${e.ts}-${i}`}
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              <span style={{ color: e.type === "in" || e.type === "add" ? GREEN : e.type === "out" ? RED : MUTED, fontWeight: 700, marginRight: 8 }}>
                {e.type.toUpperCase()}
              </span>
              {e.name} · qty {e.qty}
              {e.note ? ` · ${e.note}` : ""}
            </span>
            <span style={{ color: MUTED, fontSize: 11 }}>{new Date(e.ts).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QrTab({ products, shopName }) {
  return (
    <div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>QR codes — {shopName}</h2>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>Product barcode QR grid</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {products.map((p) => {
          const data = `${p.name}|${p.barcode || p.id}`;
          return (
            <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
              <img src={QR_URL(data)} alt={`QR ${p.name}`} width={120} height={120} style={{ borderRadius: 6, background: "#fff" }} />
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{p.barcode || "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PosApp({ shop, onLogout, onShopUpdate }) {
  const shopPhone = getShopWhatsAppPhone(shop);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockLog, setStockLog] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tab, setTab] = useState("pos");
  const [toast, setToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [syncedShopId, setSyncedShopId] = useState(null);

  const showToast = (msg, type = "ok") => setToast({ msg, type });

  useLayoutEffect(() => {
    setSyncedShopId(null);
    setProducts([]);
    setOrders([]);
    setStockLog([]);
    setCustomers([]);
    setTab("pos");
    setReceipt(null);

    const data = loadShopData(shop.id);
    setProducts(data.products);
    setOrders(data.orders);
    setStockLog(data.stockLog);
    setCustomers(data.customers);
    setSyncedShopId(shop.id);
  }, [shop.id]);

  useEffect(() => {
    if (syncedShopId !== shop.id) return;
    saveShopData(shop.id, { products, orders, stockLog, customers });
  }, [products, orders, stockLog, customers, shop.id, syncedShopId]);

  const handleLogout = () => {
    if (syncedShopId === shop.id) {
      saveShopData(shop.id, { products, orders, stockLog, customers });
    }
    onLogout();
  };

  const todayRev = orders
    .filter((o) => o.date === todayK())
    .reduce((s, o) => s + o.total, 0);

  const reduceStock = (cartItems) => {
    const alerts = [];
    const next = products.map((p) => {
      const line = cartItems.find((c) => c.id === p.id);
      if (!line) return p;
      const newStock = p.stock - line.qty;
      if (newStock <= 0) alerts.push(`${p.name} is out of stock!`);
      else if (newStock <= 5) alerts.push(`${p.name} low stock (${newStock} left)`);
      return { ...p, stock: Math.max(0, newStock) };
    });
    setProducts(next);
    return alerts;
  };

  const addProduct = (p) => {
    const id = Math.max(0, ...products.map((x) => x.id)) + 1;
    setProducts([...products, { ...p, id }]);
    setStockLog([
      {
        ts: Date.now(),
        type: "add",
        productId: id,
        name: p.name,
        qty: p.stock,
        note: "New product",
      },
      ...stockLog,
    ]);
    showToast(`${p.name} added`);
    setTab("inventory");
  };

  const adjustStock = (productId, delta, note) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setStockLog([
        {
          ts: Date.now(),
          type: delta > 0 ? "in" : "out",
          productId,
          name: prod.name,
          qty: Math.abs(delta),
          note: note || "",
        },
        ...stockLog,
      ]);
    }
    showToast("Stock updated");
  };

  if (syncedShopId !== shop.id) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: MUTED,
          fontFamily: FF,
        }}
      >
        Dukaan ka data load ho raha hai…
      </div>
    );
  }

  const NAV = [
    { id: "pos", label: "POS", icon: "🛒" },
    { id: "orders", label: "Orders", icon: "📋" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "report", label: "Daily report", icon: "📊" },
    { id: "stocklog", label: "Stock log", icon: "📝" },
    { id: "addproduct", label: "Add product", icon: "➕" },
    { id: "qr", label: "QR codes", icon: "📱" },
    { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: FF, color: TEXT }}>
      <aside
        style={{
          width: 220,
          background: CARD,
          borderRight: `1px solid ${BORDER}`,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
            {shop.shopName}
          </div>
          <div style={{ fontSize: 12, color: WA_GREEN, marginTop: 6, fontWeight: 600 }}>
            📲 WhatsApp: +91 {shopPhone || "—"}
          </div>
          <div style={{ fontSize: 10, color: GREEN, marginTop: 8 }}>🔒 Sirf is dukaan ke {products.length} products</div>
        </div>
        <div
          style={{
            background: "#0D1220",
            borderRadius: 10,
            padding: 12,
            marginBottom: 20,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ fontSize: 11, color: MUTED }}>Today&apos;s revenue</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>{fmt(todayRev)}</div>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setTab(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                marginBottom: 4,
                background: tab === n.id ? ACCENT : "transparent",
                color: tab === n.id ? "#fff" : MUTED,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FF,
                fontSize: 13,
                fontWeight: tab === n.id ? 700 : 500,
                textAlign: "left",
              }}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            ...btnSec,
            width: "100%",
            color: RED,
            borderColor: "#3D2020",
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {tab === "pos" && (
          <PosTab
            products={products}
            onCheckout={(order, cart) => {
              const alerts = reduceStock(cart);
              setOrders([order, ...orders]);
              setReceipt(order);
              if (order.customerPhone && normPhone(order.customerPhone).length >= 10) {
                setCustomers((prev) =>
                  upsertCustomer(prev, {
                    name: order.customer,
                    phone: order.customerPhone,
                  })
                );
              }
              alerts.forEach((a) => showToast(a, "warn"));
              showToast(`Order ${order.id} complete`);
            }}
            showToast={showToast}
          />
        )}
        {tab === "orders" && (
          <OrdersTab
            orders={orders}
            onReceipt={setReceipt}
            shopName={shop.shopName}
            shopPhone={shopPhone}
            showToast={showToast}
          />
        )}
        {tab === "inventory" && (
          <InventoryTab products={products} onAdjust={adjustStock} />
        )}
        {tab === "report" && <ReportTab products={products} orders={orders} />}
        {tab === "stocklog" && <StockLogTab stockLog={stockLog} />}
        {tab === "addproduct" && <ProductForm onSave={addProduct} />}
        {tab === "qr" && <QrTab products={products} shopName={shop.shopName} />}
        {tab === "whatsapp" && (
          <WhatsAppTab
            products={products}
            shop={shop}
            shopPhone={shopPhone}
            customers={customers}
            setCustomers={setCustomers}
            showToast={showToast}
            onShopUpdate={onShopUpdate}
          />
        )}
      </main>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
      {receipt && (
        <ReceiptModal
          order={receipt}
          shopName={shop.shopName}
          shopPhone={shopPhone}
          onClose={() => setReceipt(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

