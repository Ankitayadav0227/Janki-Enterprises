import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../mystyle/Login.css";
import logo from "../../public/final-logo.jpeg";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleIcon from "@mui/icons-material/Google";

const Register = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "", email: "", password: "", phone: "", address: ""
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[6-9]\d{9}$/.test(value.trim())) return "Enter a valid 10-digit mobile number";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 5) return "Address is too short";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleRegister = async () => {
    const newErrors = {};
    Object.keys(userData).forEach(key => {
      const err = validateField(key, userData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await API.post("/auth/register", userData);
      const { data } = await API.post("/auth/login", {
        email: userData.email,
        password: userData.password
      });
      loginUser(data.token);
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      toast.error("Registration failed! Email may already exist.");
    }
  };

  return (
    <Box className="login-section">
      <Container maxWidth="md">
        <Box className="login-card">

          {/* LEFT PANEL */}
          <Box className="login-left">
            <Box className="login-logo">
              <img src={logo} alt="Campa Cola Logo" />
            </Box>
            <Typography className="login-desc">Register quickly using social media</Typography>
            <Button className="social-btn facebook" startIcon={<FacebookIcon />}>Continue with Facebook</Button>
            <Button className="social-btn twitter" startIcon={<TwitterIcon />}>Continue with Twitter</Button>
            <Button className="social-btn google" startIcon={<GoogleIcon />}>Continue with Google</Button>
          </Box>

          {/* RIGHT PANEL */}
          <Box className="login-right">
            <Typography className="login-title">Create an Account</Typography>

            <TextField fullWidth label="Full Name" name="name" variant="standard" sx={{ mb: 2 }}
              value={userData.name} onChange={handleChange}
              error={!!errors.name} helperText={errors.name} />

            <TextField fullWidth label="Email Address" name="email" variant="standard" sx={{ mb: 2 }}
              value={userData.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email} />

            <TextField fullWidth type="password" label="Password" name="password" variant="standard" sx={{ mb: 2 }}
              value={userData.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password} />

            <TextField fullWidth label="Phone" name="phone" variant="standard" sx={{ mb: 2 }}
              value={userData.phone} onChange={handleChange}
              inputProps={{ maxLength: 10 }}
              error={!!errors.phone} helperText={errors.phone} />

            <TextField fullWidth label="Address" name="address" variant="standard" sx={{ mb: 3 }}
              value={userData.address} onChange={handleChange}
              error={!!errors.address} helperText={errors.address} />

            <Button fullWidth variant="contained" className="login-btn" onClick={handleRegister}>
              Register
            </Button>

            <Typography sx={{ mt: 3 }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="register-link">Login</span>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;