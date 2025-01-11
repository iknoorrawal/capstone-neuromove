import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; 

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        dob, 
        createdAt: new Date(),
      });

      navigate(`/dashboard/${user.uid}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", textAlign: "center", mt: 10 }}>
      <Typography variant="h4" mb={3}>Signup</Typography>
      <TextField fullWidth label="First Name" margin="normal" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <TextField fullWidth label="Last Name" margin="normal" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} margin="normal" value={dob} onChange={(e) => setDob(e.target.value)} />
      <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSignup}>Signup</Button>
    </Box>
  );
};

export default Signup;
