import { useContext, useEffect, useState } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Container, Typography, Box, Button, IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const { token } = useContext(AuthContext);
  const { fetchCart } = useContext(CartContext);
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  const fetchLocalCart = async () => {
    try {
      const { data } = await API.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchLocalCart();
  }, [token]);

  const removeItem = async (productId) => {
    await API.delete("/cart/remove", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId },
    });
    fetchLocalCart();
    fetchCart(); // sync badge
  };

  const updateQty = async (productId, qty) => {
    const newQty = Number(qty);
    if (newQty < 1) return toast.error("Quantity must be at least 1");
    if (newQty > 100) return toast.error("Maximum quantity is 100");

    try {
      await API.put(
        "/cart/update",
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchLocalCart();
      fetchCart(); // sync badge
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.response?.data?.error || err.message;
      toast.error(errorMessage || "Failed to update quantity");
    }
  };

  if (!cart) return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>My Cart</Typography>

      {cart.items.length === 0 ? (
        <Typography>Your cart is empty!</Typography>
      ) : (
        cart.items.map((item) => (
          <Box
            key={item.productId._id}
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              p: 2, border: "1px solid #ddd", borderRadius: 2, mb: 2,
            }}
          >
            <img
              src={item.productId.image}
              width="70" height="70"
              style={{ objectFit: "contain" }}
            />

            <Box flex={1}>
              <Typography fontWeight="bold">{item.productId.title}</Typography>
              <Typography>₹{item.productId.price}</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => updateQty(item.productId._id, item.quantity - 1)}
              >
                −
              </IconButton>

              <TextField
                type="number"
                size="small"
                value={item.quantity}
                onChange={(e) => updateQty(item.productId._id, e.target.value)}
                sx={{ width: "65px" }}
                inputProps={{ min: 1, max: 100, style: { textAlign: "center" } }}
              />

              <IconButton
                size="small"
                onClick={() => updateQty(item.productId._id, item.quantity + 1)}
              >
                +
              </IconButton>
            </Box>

            <IconButton color="error" onClick={() => removeItem(item.productId._id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))
      )}

      {cart.items.length > 0 && (
        <Button fullWidth variant="contained" onClick={() => navigate("/checkout")} sx={{ mt: 3 }}>
          Proceed to Checkout
        </Button>
      )}
    </Container>
  );
};

export default Cart;