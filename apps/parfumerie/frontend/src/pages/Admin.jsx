import { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatPrice } from "../components/ProductCard.jsx";

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  description: "",
  category: "",
  gender: "Mixte",
  volume_ml: 100,
  price_cents: 0,
  stock: 0,
  image_url: "",
  featured: false,
};

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin-jwt") || "");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }
    api
      .getMe(token)
      .then((me) => setUser(me))
      .catch(() => {
        sessionStorage.removeItem("admin-jwt");
        setToken("");
      })
      .finally(() => setCheckingSession(false));
  }, [token]);

  useEffect(() => {
    if (!user) return;
    refreshProducts();
    refreshOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function refreshProducts() {
    api.adminGetProducts(token).then(setProducts).catch((err) => setError(err.message));
  }

  function refreshOrders() {
    api.adminGetOrders(token).then(setOrders).catch((err) => setError(err.message));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      const { token: newToken, user: me } = await api.login(loginEmail, loginPassword);
      sessionStorage.setItem("admin-jwt", newToken);
      setToken(newToken);
      setUser(me);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-jwt");
    setToken("");
    setUser(null);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm(product);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        volume_ml: Number(form.volume_ml),
        price_cents: Number(form.price_cents),
        stock: Number(form.stock),
      };

      if (editingId) {
        await api.adminUpdateProduct(token, editingId, payload);
      } else {
        await api.adminCreateProduct(token, payload);
      }

      resetForm();
      refreshProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await api.adminDeleteProduct(token, id);
      refreshProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      await api.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Mot de passe mis à jour avec succès.");
    } catch (err) {
      setPasswordError(err.message);
    }
  }

  if (checkingSession) {
    return <div className="container admin-login" />;
  }

  if (!user) {
    return (
      <div className="container admin-login">
        <h1 className="page-title">Espace administration</h1>
        <form onSubmit={handleLogin} className="admin-login-form">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="vous@boutique.com"
            autoComplete="username"
            required
          />
          <label htmlFor="admin-password">Mot de passe</label>
          <input
            id="admin-password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Mot de passe"
            autoComplete="current-password"
            required
          />
          {loginError && <p className="error-text">{loginError}</p>}
          <button className="btn btn-primary" type="submit">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Back-office</h1>
          <p className="admin-welcome">Connectée en tant que {user.name || user.email}</p>
        </div>
        <button className="link-button" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <div className="admin-tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
          Produits & stock
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          Commandes
        </button>
        <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>
          Mon compte
        </button>
      </div>

      {error && tab !== "account" && <p className="error-text">{error}</p>}

      {tab === "products" && (
        <div className="admin-products">
          <form onSubmit={handleSubmit} className="admin-form">
            <h2>{editingId ? "Modifier le produit" : "Ajouter un produit"}</h2>
            <div className="form-grid">
              <input
                placeholder="Nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Marque"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
              />
              <input
                placeholder="Famille olfactive"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
                <option value="Mixte">Mixte</option>
              </select>
              <input
                type="number"
                placeholder="Volume (ml)"
                value={form.volume_ml}
                onChange={(e) => setForm({ ...form, volume_ml: e.target.value })}
              />
              <input
                type="number"
                placeholder="Prix (centimes)"
                value={form.price_cents}
                onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <input
                placeholder="URL de l'image"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Mis en avant
              </label>
            </div>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                {editingId ? "Enregistrer" : "Ajouter"}
              </button>
              {editingId && (
                <button type="button" className="link-button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Marque</th>
                <th>Prix</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{formatPrice(product.price_cents)}</td>
                  <td className={product.stock === 0 ? "stock-empty" : ""}>{product.stock}</td>
                  <td className="admin-table-actions">
                    <button className="link-button" onClick={() => startEdit(product)}>
                      Modifier
                    </button>
                    <button className="link-button danger" onClick={() => handleDelete(product.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "orders" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Articles</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_email || "—"}</td>
                <td>{formatPrice(order.total_cents)}</td>
                <td>
                  <span className={`status-pill status-${order.status}`}>{order.status}</span>
                </td>
                <td>
                  {order.items.map((item) => `${item.product_name} ×${item.quantity}`).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "account" && (
        <div className="admin-form">
          <h2>Mon compte</h2>
          <p className="account-info">
            Email : <strong>{user.email}</strong>
          </p>
          <form onSubmit={handleChangePassword} className="admin-login-form">
            <label htmlFor="current-password">Mot de passe actuel</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
            {passwordMessage && <p className="success-text">{passwordMessage}</p>}
            <button className="btn btn-primary" type="submit">
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
