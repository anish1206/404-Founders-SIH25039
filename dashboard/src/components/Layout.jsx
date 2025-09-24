// /dashboard/src/components/Layout.jsx
import React from 'react';
import { 
  Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Avatar, Stack, Divider 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
  Map as MapIcon,
  RssFeed as RssFeedIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Social Media Feed', path: '/social', icon: <RssFeedIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          bgcolor: 'white',
          color: '#2c3e50',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e1e4e8'
        }}
      >
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <MapIcon sx={{ color: '#007bff' }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              INCOIS Hazard Dashboard
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                textTransform: 'none',
                color: '#6c757d',
                '&:hover': { 
                  bgcolor: '#f1f3f4',
                  color: '#dc3545'
                }
              }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid #e1e4e8',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e1e4e8' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar 
              sx={{ 
                bgcolor: '#007bff', 
                width: 32, 
                height: 32,
                fontSize: '0.875rem'
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dashboard User
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
        
        <Box sx={{ overflow: 'auto', py: 1 }}>
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      color: '#007bff',
                      '&:hover': {
                        bgcolor: '#e3f2fd',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#007bff',
                      },
                    },
                    '&:hover': {
                      bgcolor: '#f1f3f4',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: location.pathname === item.path ? 600 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;