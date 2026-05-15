export const INITIAL_PRODUCTS = [
  { id: 1, name: "Basmati Rice", unit: "5kg", retailPrice: 349, wholesalePrice: 290, minWholesaleQty: 10, category: "Grocery", stock: 45, emoji: "🌾", barcode: "8901001" },
  { id: 2, name: "Toor Dal", unit: "1kg", retailPrice: 145, wholesalePrice: 118, minWholesaleQty: 20, category: "Grocery", stock: 32, emoji: "🫘", barcode: "8901002" },
  { id: 3, name: "Amul Butter", unit: "500g", retailPrice: 260, wholesalePrice: 220, minWholesaleQty: 12, category: "Dairy", stock: 18, emoji: "🧈", barcode: "8901003" },
  { id: 4, name: "Parle-G", unit: "800g", retailPrice: 85, wholesalePrice: 68, minWholesaleQty: 24, category: "Snacks", stock: 60, emoji: "🍪", barcode: "8901004" },
  { id: 5, name: "Surf Excel", unit: "1kg", retailPrice: 195, wholesalePrice: 158, minWholesaleQty: 12, category: "Home", stock: 28, emoji: "🧺", barcode: "8901005" },
  { id: 6, name: "Maggi Noodles", unit: "12pk", retailPrice: 168, wholesalePrice: 132, minWholesaleQty: 10, category: "Snacks", stock: 50, emoji: "🍜", barcode: "8901006" },
  { id: 7, name: "Dettol Soap", unit: "4pk", retailPrice: 192, wholesalePrice: 155, minWholesaleQty: 24, category: "Personal", stock: 35, emoji: "🧼", barcode: "8901007" },
  { id: 8, name: "Colgate", unit: "200g", retailPrice: 95, wholesalePrice: 76, minWholesaleQty: 24, category: "Personal", stock: 40, emoji: "🦷", barcode: "8901008" },
  { id: 9, name: "Atta", unit: "10kg", retailPrice: 465, wholesalePrice: 390, minWholesaleQty: 5, category: "Grocery", stock: 22, emoji: "🌾", barcode: "8901009" },
  { id: 10, name: "Milk", unit: "1L", retailPrice: 64, wholesalePrice: 56, minWholesaleQty: 50, category: "Dairy", stock: 30, emoji: "🥛", barcode: "8901010" },
];

const ACCOUNTS_KEY = "retailpro_accounts";
const SESSION_KEY = "retailpro_session";
const dataKey = (id) => `retailpro_data_${id}`;

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const normPhone = (p) => p.replace(/\D/g, "").slice(-10);

export const loadAccounts = () => loadJSON(ACCOUNTS_KEY, []);

export const saveAccounts = (accounts) => saveJSON(ACCOUNTS_KEY, accounts);

export const loadSession = () => loadJSON(SESSION_KEY, null);

export const saveSession = (shopId) => saveJSON(SESSION_KEY, { shopId });

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

/** Har shop ke products alag IDs — mix na ho */
export const cloneInitialProductsForShop = (shopId) => {
  const base = Date.now();
  return INITIAL_PRODUCTS.map((p, i) => ({
    ...p,
    id: base + i,
    shopId,
  }));
};

export const defaultShopData = (shopId) => ({
  _shopId: shopId,
  _version: 2,
  products: cloneInitialProductsForShop(shopId),
  orders: [],
  stockLog: [],
});

export const loadShopData = (shopId) => {
  if (!shopId) {
    return { products: [], orders: [], stockLog: [] };
  }
  const data = loadJSON(dataKey(shopId), null);
  if (!data) return defaultShopData(shopId);
  if (data._shopId && data._shopId !== shopId) {
    return defaultShopData(shopId);
  }
  return {
    products: Array.isArray(data.products) ? data.products : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    stockLog: Array.isArray(data.stockLog) ? data.stockLog : [],
  };
};

export const saveShopData = (shopId, payload) => {
  if (!shopId) return;
  saveJSON(dataKey(shopId), {
    products: payload.products ?? [],
    orders: payload.orders ?? [],
    stockLog: payload.stockLog ?? [],
    _shopId: shopId,
    _version: 2,
  });
};

/** Purane global keys (agar the) — mix rokne ke liye */
export const clearLegacyGlobalData = () => {
  [
    "retailpro_products",
    "retailpro_orders",
    "retailpro_stockLog",
    "retailpro_data",
  ].forEach((k) => localStorage.removeItem(k));
};

export const findAccountByPhone = (phone) =>
  loadAccounts().find((a) => normPhone(a.phone) === normPhone(phone));

export const registerShop = ({ shopName, phone, password }) => {
  const ph = normPhone(phone);
  const accounts = loadAccounts();
  if (accounts.some((a) => normPhone(a.phone) === ph)) {
    return { error: "Yeh number pehle se registered hai — login karo" };
  }
  const acc = {
    id: `shop_${Date.now()}`,
    shopName: shopName.trim(),
    phone: ph,
    password,
    createdAt: Date.now(),
  };
  saveAccounts([...accounts, acc]);
  saveShopData(acc.id, defaultShopData(acc.id));
  return { account: acc };
};

export const loginShop = ({ phone, password }) => {
  const ph = normPhone(phone);
  const acc = loadAccounts().find((a) => normPhone(a.phone) === ph && a.password === password);
  if (!acc) return { error: "Galat phone ya password" };
  return { account: acc };
};

export const restoreSession = () => {
  const session = loadSession();
  if (!session?.shopId) return null;
  const acc = loadAccounts().find((a) => a.id === session.shopId);
  return acc || null;
};
