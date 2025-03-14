import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import Header from '../components/Header';
import MovieDisplay from '../components/MovieDisplay';
import AdminPanel from '../components/AdminPanel';
import { fetchVideos } from '../utils/api';
import { Video } from '../types';

const HomePage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      const videoData = await fetchVideos();
      setVideos(videoData);
    };

    loadVideos();
  }, []);

  return (
    <Box>
      <Header onAdminPanelClick={() => setOpen(true)} />
      <MovieDisplay videos={videos} />
      <AdminPanel open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default HomePage;