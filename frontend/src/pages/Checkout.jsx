import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Container, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

const Checkout = () => {
  const { token } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const validateField = (name, value) => {
    if (name === "contact") {
      if (!value.trim()) return "Contact number is required";
      if (!/^[6-9]\d{9}$/.test(value.trim())) return "Enter a valid 10-digit mobile number";
    }
    if (name === "address") {
      if (!value.trim()) return "Delivery address is required";
      if (value.trim().length < 10) return "Please enter a complete address";
    }
    return "";
  };

  const handleContactChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setContact(val);
    setErrors(prev => ({ ...prev, contact: validateField("contact", val) }));
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setErrors(prev => ({ ...prev, address: validateField("address", e.target.value) }));
  };

  const handleConfirmOrder = async () => {
    const newErrors = {
      contact: validateField("contact", contact),
      address: validateField("address", address),
    };
    setErrors(newErrors);
    if (newErrors.contact || newErrors.address) return;

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity, 0
    );

    try {
      await API.post(
        "/orders/create",
        { items: cart.items, totalAmount, contact, address, paymentMode: "COD" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/order-success", { state: { address, contact } });
    } catch (err) {
      toast.error("Order failed. Please try again.");
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>Checkout</Typography>

      <TextField
        label="Contact Number"
        fullWidth
        value={contact}
        onChange={handleContactChange}
        sx={{ mb: 3 }}
        error={!!errors.contact}
        helperText={errors.contact}
        inputProps={{ maxLength: 10 }}
      />

      <TextField
        label="Delivery Address"
        fullWidth
        multiline
        rows={3}
        value={address}
        onChange={handleAddressChange}
        sx={{ mb: 3 }}
        error={!!errors.address}
        helperText={errors.address}
      />

      <Button variant="contained" fullWidth onClick={handleConfirmOrder}>
        Confirm Order
      </Button>
    </Container>
  );
};

export default Checkout;