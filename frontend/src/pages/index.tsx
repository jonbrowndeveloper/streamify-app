import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import MovieDisplay from '../components/MovieDisplay';
import SearchResultsGrid from '../components/SearchResultsGrid';
import AdminPanel from '../components/AdminPanel';
import { fetchVideos } from '../utils/api';
import { Video } from '../types';

const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videoData = await fetchVideos();
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    loadVideos();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Box>
      <Header
        onAdminPanelClick={() => setOpen(true)}
        videos={videos}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />
      {searchQuery ? (
        <SearchResultsGrid
          videos={videos.filter(video => video.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          onVideoSelect={(id) => console.log(`Selected video ID: ${id}`)}
          onClearSearch={handleClearSearch}
        />
      ) : (
        <MovieDisplay videos={videos} searchQuery={searchQuery} />
      )}
      <AdminPanel open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default HomePage;