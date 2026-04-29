const BASE = process.env.REACT_APP_API_URL || "https://retailpro-backend-n70s.onrender.com";

// Token store/get
export const getToken = () => localStorage.getItem("rp_token");
export const setToken = (t) => localStorage.setItem("rp_token", t);
export const getShopId = () => localStorage.getItem("rp_shopId");
export const setShopId = (id) => localStorage.setItem("rp_shopId", id);
export const clearAuth = () => {
  localStorage.removeItem("rp_token");
  localStorage.removeItem("rp_shopId");
};

// Base fetch helper
async function req(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (res.status === 401) {
    if (!path.startsWith("/auth")) {
      clearAuth();
      window.location.href = "/";
      return;
    }
    throw new Error(data.message || "Invalid email or password");
  }

  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  register: (body) => req("POST", "/auth/register", body),
  login: (body) => req("POST", "/auth/login", body),
};

// ── PRODUCTS ──────────────────────────────────────────
export const productsAPI = {
  getAll: () => req("GET", "/products"),
  create: (body) => req("POST", "/products", body),
  update: (id, body) => req("PUT", `/products/${id}`, body),
  delete: (id) => req("DELETE", `/products/${id}`),
  scanBarcode: (sku) => req("GET", `/products/stock/scan/${sku}`),
  bulk: (items) => req("POST", "/products/bulk", { items }),
};

// ── ORDERS ────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => req("GET", "/orders"),
  checkout: (body) => req("POST", "/orders/checkout", body),
};

// ── CUSTOMERS ─────────────────────────────────────────
export const customersAPI = {
  getAll: () => req("GET", "/erp/customers"),
  create: (body) => req("POST", "/erp/customers", body),
  update: (id, body) => req("PUT", `/erp/customers/${id}`, body),
  getLedger: (id) => req("GET", `/erp/customers/${id}/ledger`),
};

// ── SUPPLIERS ─────────────────────────────────────────
export const suppliersAPI = {
  getAll: () => req("GET", "/erp/suppliers"),
  create: (body) => req("POST", "/erp/suppliers", body),
  update: (id, body) => req("PUT", `/erp/suppliers/${id}`, body),
};

// ── EMPLOYEES ─────────────────────────────────────────
export const employeesAPI = {
  getAll: () => req("GET", "/erp/employees"),
  create: (body) => req("POST", "/erp/employees", body),
};

// ── CASHFLOW ──────────────────────────────────────────
export const cashflowAPI = {
  getAll: () => req("GET", "/erp/cashflow"),
  create: (body) => req("POST", "/erp/cashflow", body),
};

// ── ANALYTICS ─────────────────────────────────────────
export const analyticsAPI = {
  summary: () => req("GET", "/erp/analytics/summary"),
  gstr1: (from, to) => req("GET", `/erp/reports/gstr1?from=${from}&to=${to}`),
};
// DB compatibility layer — App.js ke liye
export const DB = {
  get: (k, d) => { try { const v = localStorage.getItem(`rp_${k}`); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(`rp_${k}`, JSON.stringify(v)); } catch {} },
};
// Tenant helpers
export const getTenantId = () => localStorage.getItem("rp_shopId");
export const setTenantId = (id) => localStorage.setItem("rp_shopId", id);
export const clearTenantId = () => localStorage.removeItem("rp_shopId");
export const getTenants = () => [];
export const saveTenants = () => {};