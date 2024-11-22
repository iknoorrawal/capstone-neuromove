
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  
    const navigate = useNavigate(); // Initialize useNavigate
  
    const handleLogin = async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userId = userCredential.user.uid; // Get the user's unique ID
          alert("Login successful!");
          navigate(`/profile/${userId}`); // Redirect to the profile page with UUID
        } catch (err) {
          setError(err.message);
        }
      };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", textAlign: "center", mt: 10 }}>
      <Typography variant="h4" mb={3}>
        Login
      </Typography>
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <Typography color="error" variant="body2" mt={2}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleLogin}
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;
