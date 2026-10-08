import { createContext, useState, useContext, useEffect } from "react";
import API from "../api/api";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { token, role } = useContext(AuthContext);

  // Total quantity across all items (for badge)
  const cartCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (product, quantity = 1) => {
    if (!token || role !== "user") return;
    try {
      const res = await API.post(
        "/cart/add",
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.cart);
    } catch (error) {
      console.error("Add to cart error:", error.response?.data || error.message);
    }
  };

  // =========================
  // FETCH CART
  // =========================
  const fetchCart = async () => {
    if (!token || role !== "user") return;
    try {
      const res = await API.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || { items: [] });
    } catch (error) {
      console.error("Fetch cart error:", error.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};