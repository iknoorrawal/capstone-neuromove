//delete this page, home.js acts as login 
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f6f6f6",
        padding: 2,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        <Typography variant="h4">Log In</Typography>
      </Box>
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          padding: 4,
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button type="submit" variant="contained" fullWidth>
            Log In
          </Button>
        </Box>
      </Box>
    <Box sx={{ maxWidth: 400, margin: "auto", textAlign: "center", mt: 10 }}>
      <Typography variant="h4" mb={3}>Login</Typography>
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
      <Button 
        variant="text" 
        color="secondary" 
        fullWidth 
        sx={{ mt: 2 }} 
        onClick={() => navigate("/signup")}
      >
        Don't have an account? Sign up
      </Button>
    </Box>
    </Box>
  );
};

export default Login;