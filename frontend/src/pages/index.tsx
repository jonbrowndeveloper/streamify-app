import { useEffect, useState } from 'react';
import { Container, Typography, Button } from '@mui/material';
import VideoList from '../components/VideoList';
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
    <Container>
      <Typography variant="h2" gutterBottom>
        Movie Streaming App
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Open Admin Panel
      </Button>
      <VideoList videos={videos} />
      <AdminPanel open={open} onClose={() => setOpen(false)} />
    </Container>
  );
};

export default HomePage;