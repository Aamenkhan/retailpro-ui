import { normPhone } from "./shopStorage";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const shopContactLine = (shopPhone) => {
  const p = normPhone(shopPhone);
  if (p.length < 10) return null;
  return `📞 ${shopNameFix(p)}`;
};

const shopNameFix = (p) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;

export function formatBillMessage(order, shopName, shopPhone = "") {
  const lines = [
    `🏪 *${shopName}*`,
    shopContactLine(shopPhone),
    `📋 Bill: ${order.id}`,
    `📅 ${new Date(order.ts).toLocaleString("en-IN")}`,
    "",
    ...order.items.map((i) => `• ${i.name} x${i.qty} — ${fmt(i.lineTotal)}`),
    "",
    `Subtotal: ${fmt(order.subtotal)}`,
  ];
  if (order.discount > 0) lines.push(`Discount: -${fmt(order.discount)}`);
  lines.push(`GST (5%): ${fmt(order.gst)}`);
  lines.push(`*Total: ${fmt(order.total)}*`);
  lines.push(`Payment: ${order.payment} · ${order.mode}`);
  if (order.customer) lines.push(`Customer: ${order.customer}`);
  lines.push("", "Koi sawal ho to isi number par WhatsApp karein.", "Dhanyavaad! 🙏");
  return lines.filter(Boolean).join("\n");
}

export function formatProductPromo(product, shopName, shopPhone = "", mode = "retail") {
  const price = mode === "wholesale" ? product.wholesalePrice : product.retailPrice;
  return [
    `🆕 *${shopName}* — Naya product / update!`,
    shopContactLine(shopPhone),
    "",
    `${product.emoji || "📦"} *${product.name}* (${product.unit})`,
    `💰 Price: ${fmt(price)}`,
    product.stock > 0 ? `✅ Stock mein available` : `⚠️ Stock kam hai`,
    "",
    "Aaj hi visit karein! 🛒",
    shopPhone ? `WhatsApp: +91 ${normPhone(shopPhone)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function waMeUrl(phone, text) {
  const p = normPhone(phone);
  if (p.length < 10) return null;
  return `https://wa.me/91${p}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(phone, text) {
  const url = waMeUrl(phone, text);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function upsertCustomer(list, { name, phone }) {
  const ph = normPhone(phone);
  if (ph.length < 10) return list;
  const existing = list.find((c) => normPhone(c.phone) === ph);
  if (existing) {
    return list.map((c) =>
      normPhone(c.phone) === ph
        ? {
            ...c,
            name: (name || c.name || "").trim() || c.name,
            phone: ph,
            lastOrder: Date.now(),
          }
        : c
    );
  }
  return [
    {
      id: `cust_${Date.now()}`,
      name: (name || "").trim() || "Customer",
      phone: ph,
      lastOrder: Date.now(),
    },
    ...list,
  ];
}
