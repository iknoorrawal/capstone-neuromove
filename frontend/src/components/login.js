import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";

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
  );
};

export default Login;
