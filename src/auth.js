// Simple auth helpers — new backend ke saath compatible
export const setTenantId = (id) => localStorage.setItem("rp_shopId", id);
export const clearTenantId = () => localStorage.removeItem("rp_shopId");
export const getTenantId = () => localStorage.getItem("rp_shopId");
export const getTenants = () => [];
export const saveTenants = () => {};

export const seedTenantData = () => {};
export const ensureDemoTenant = () => {};
export const loginTenant = () => {};
export const registerTenant = () => {};
export const logoutTenant = () => { clearTenantId(); };