import React from 'react';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
  { text: 'Candidates', icon: <PeopleIcon />, path: '/candidates' },
  { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
];

function Layout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#1C2833'
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            TalentFlow
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith(item.path)}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '30',
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname.startsWith(item.path) 
                        ? theme.palette.primary.main 
                        : 'inherit' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        fontWeight: location.pathname.startsWith(item.path) ? 600 : 400
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </>
  );
}

export default Layout;
