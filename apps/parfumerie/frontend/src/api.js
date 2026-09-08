const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ""}`);
  },
  getCategories: () => request("/products/categories"),
  getProduct: (id) => request(`/products/${id}`),
  createCheckoutSession: (items) =>
    request("/checkout", { method: "POST", body: JSON.stringify({ items }) }),
  getCheckoutSession: (sessionId) => request(`/checkout/session/${sessionId}`),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: (token) => request("/auth/me", { headers: authHeader(token) }),
  changePassword: (token, currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  adminGetProducts: (token) => request("/admin/products", { headers: authHeader(token) }),
  adminCreateProduct: (token, product) =>
    request("/admin/products", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(product),
    }),
  adminUpdateProduct: (token, id, product) =>
    request(`/admin/products/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(product),
    }),
  adminDeleteProduct: (token, id) =>
    request(`/admin/products/${id}`, { method: "DELETE", headers: authHeader(token) }),
  adminGetOrders: (token) => request("/admin/orders", { headers: authHeader(token) }),
};
