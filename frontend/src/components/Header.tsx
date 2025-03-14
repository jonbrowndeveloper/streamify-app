import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

interface HeaderProps {
  onAdminPanelClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminPanelClick }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Final Frontier Old Style', fontSize: '3rem' }}>
          Streamify
        </Typography>
        <Button color="inherit" onClick={onAdminPanelClick}>
          Admin Panel
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;