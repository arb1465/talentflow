import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GitHubIcon from '@mui/icons-material/GitHub';

// --- Define the style for the modal box ---
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 'auto' },
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 2,
};

function WelcomeModal({ open, handleClose }) {
  const GITHUB_REPO_URL = "https://github.com/arb1465/talentflow";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="welcome-modal-title" variant="h5" component="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: 'h5.fontSize' } }}>
          Welcome to TalentFlow!
        </Typography>
        <Typography id="welcome-modal-description" sx={{ mt: 2 }}>
          This is a "Frontend-only" React application. It uses a "Mock Service Worker (MSW)" to simulate a real backend API and "IndexedDB" for local data persistence.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          To explore the full range of features, it's highly recommended to clone the project and run it on your local system.
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: 'h6.fontSize' } }}>Project Highlights:</Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Full CRUD functionality for managing job postings." />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Optimistic UI updates with rollback on failure for a seamless UX." />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Interactive Kanban board with drag-and-drop for candidate management." />
          </ListItem>
           <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Complex form builder for creating job-specific assessments." />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button 
            variant="outlined" 
            startIcon={<GitHubIcon />} 
            href={GITHUB_REPO_URL}
            target="_blank"
          >
            View on GitHub
          </Button>
          <Button variant="contained" onClick={handleClose}>
            Acknowledge & Continue
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default WelcomeModal;