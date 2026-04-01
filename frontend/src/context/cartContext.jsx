import { createContext, useContext, useEffect, useReducer } from "react";
import { useAuth } from "./authContext.jsx";
import API from "../utils/api.js";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART": return action.payload;
    case "CLEAR_CART": return [];
    default: return state;
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Sync cart from server when user logs in
  useEffect(() => {
    if (user) {
      API.get("/api/cart").then((res) => dispatch({ type: "SET_CART", payload: res.data }));
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await API.post("/api/cart", { productId, quantity });
    dispatch({ type: "SET_CART", payload: res.data });
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await API.put(`/cart/${productId}`, { quantity });
    dispatch({ type: "SET_CART", payload: res.data });
  };

  const removeFromCart = async (productId) => {
    await API.delete(`/cart/${productId}`);
    dispatch({ type: "SET_CART", payload: cart.filter((i) => i.product._id !== productId) });
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product?.discountPrice || item.product?.price || 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
