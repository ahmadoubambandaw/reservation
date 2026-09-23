import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "essence-de-luxe-wishlist";

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    } catch {
      // stockage local indisponible (mode privé, quota) : les favoris restent en mémoire
    }
  }, [productIds]);

  function isFavorite(productId) {
    return productIds.includes(productId);
  }

  function toggleFavorite(productId) {
    setProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  const value = { productIds, isFavorite, toggleFavorite };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist doit être utilisé dans un WishlistProvider");
  return context;
}
