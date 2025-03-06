import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate(`/dashboard/${userCredential.user.uid}`);
    } catch (error) {
      setError('Invalid email or password');
      console.error('Error:', error);
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

      {/* Right side with login form */}
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
          <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Log In
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary' }}>
            Welcome Back
          </Typography>

          <form onSubmit={handleSubmit}>
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
              sx={{ mb: 3 }}
            />

            {error && (
              <Typography color="error" variant="caption" sx={{ mb: 2 }}>
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
              Log In
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
                to="/signup"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Sign Up
                </Typography>
              </Link>
            </Box>
          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
