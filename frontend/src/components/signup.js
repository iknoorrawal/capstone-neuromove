import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { TextField, Button, Box, Typography, Container, FormHelperText } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const passwordRequirements = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasNonAlphanumeric: /[^A-Za-z0-9]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError("Please meet all password requirements");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        dateOfBirth,
        email,
        level: "1",
        streaks: 1,
        unlockedLevels: [1],
        createdAt: new Date()
      });

      navigate(`/dashboard/${user.uid}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #FF9B9B, #FFB4B4, #FFDCDC)',
      }}
    >
      {/* Left side with logo */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <img
            src="/logo.png"
            alt="NeuroMove Logo"
            style={{ width: '50px', height: 'auto' }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            NEUROMOVE
          </Typography>
        </Box>
      </Box>

      {/* Right side with signup form */}
      <Box
        sx={{
          width: '550px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: 'white',
          borderTopLeftRadius: '30px',
          borderBottomLeftRadius: '30px',
          p: 4,
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign Up
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              size="small"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              size="small"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              variant="outlined"
              size="small"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              sx={{ mb: isPasswordFocused || password ? 1 : 3 }}
            />
            {(isPasswordFocused || password) && (
              <Box sx={{ mb: 3, pl: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Password Requirements:
                </Typography>
                {Object.entries({
                  'At least 6 characters': passwordRequirements.minLength,
                  'One uppercase letter': passwordRequirements.hasUpperCase,
                  'One lowercase letter': passwordRequirements.hasLowerCase,
                  'One number': passwordRequirements.hasNumber,
                  'One special character': passwordRequirements.hasNonAlphanumeric,
                }).map(([requirement, isMet]) => (
                  <Box key={requirement} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {isMet ? (
                      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <CancelOutlinedIcon color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography variant="caption" color={isMet ? "success.main" : "error"}>
                      {requirement}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {error && (
              <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                bgcolor: '#333',
                '&:hover': {
                  bgcolor: '#000',
                },
                borderRadius: '8px',
              }}
            >
              Sign Up
            </Button>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0, 0, 0, 0.1)' }} />
              <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                Or
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0, 0, 0, 0.1)' }} />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Log In
                </Typography>
              </Link>
            </Box>
          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default Signup;
