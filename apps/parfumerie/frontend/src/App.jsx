import { Route, Routes } from "react-router-dom";
import AnnouncementBar from "./components/AnnouncementBar.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Admin from "./pages/Admin.jsx";
import Cart from "./pages/Cart.jsx";
import Catalog from "./pages/Catalog.jsx";
import CheckoutCancel from "./pages/CheckoutCancel.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import Favorites from "./pages/Favorites.jsx";
import Home from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <AnnouncementBar />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalog />} />
          <Route path="/produit/:id" element={<Product />} />
          <Route path="/favoris" element={<Favorites />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
