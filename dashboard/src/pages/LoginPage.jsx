// /dashboard/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Map as MapIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to dashboard on successful login
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="lg">
        <Card
          sx={{
            display: 'flex',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxWidth: 900,
            margin: '0 auto',
            bgcolor: 'white',
          }}
        >
          {/* Left Panel - Branding */}
          <Box
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MapIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              INCOIS
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                mb: 3,
                textAlign: 'center',
                opacity: 0.9,
              }}
            >
              Hazard Monitoring Dashboard
            </Typography>
            
            <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <DashboardIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                <Typography variant="caption" display="block">
                  Real-time Monitoring
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                <Typography variant="caption" display="block">
                  Secure Access
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <MapIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                <Typography variant="caption" display="block">
                  Geographic Insights
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right Panel - Login Form */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 6 },
              bgcolor: '#fafbfc',
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#2c3e50',
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6c757d',
                  mb: 3,
                }}
              >
                Sign in to access your dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#6c757d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007bff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007bff',
                    },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#6c757d' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#6c757d' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007bff',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007bff',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0056b3 0%, #004085 100%)',
                    boxShadow: '0 6px 20px rgba(0, 123, 255, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing In...</span>
                  </Stack>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Secure Login
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Indian National Centre for Ocean Information Services
              </Typography>
              <Typography variant="caption" color="text.secondary">
                © 2025 INCOIS - All rights reserved
              </Typography>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;