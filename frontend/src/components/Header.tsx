import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Fuse from 'fuse.js';
import { Video } from '../types';

interface HeaderProps {
  onAdminPanelClick: () => void;
  videos: Video[];
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminPanelClick, videos, onSearch, onClearSearch }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  const fuse = new Fuse(videos, {
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'actors', weight: 0.3 },
      { name: 'omdbData.director', weight: 0.1 },
      { name: 'omdbData.writer', weight: 0.1 },
    ],
    includeScore: true,
    threshold: 0.3, // Adjust this value to control the sensitivity of the search
    shouldSort: true,
    sortFn: (a, b) => {
      // Prioritize exact matches
      const exactMatchA = a?.item?.name?.toString().toLowerCase() === searchQuery.toLowerCase();
      const exactMatchB = b?.item?.name?.toString().toLowerCase() === searchQuery.toLowerCase();
      if (exactMatchA && !exactMatchB) return -1;
      if (!exactMatchA && exactMatchB) return 1;
      return a.score - b.score;
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const results = fuse.search(query).map(result => result.item);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch(searchQuery);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Final Frontier Old Style', fontSize: '3rem' }}>
            Streamify
          </Typography>
          <IconButton color="inherit" onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon />
          </IconButton>
          {searchOpen && (
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              sx={{
                ml: 2,
                width: 280,
                '& .MuiInputBase-root': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                },
              }}
            />
          )}
          <IconButton color="inherit" onClick={onAdminPanelClick}>
            <AdminPanelSettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;