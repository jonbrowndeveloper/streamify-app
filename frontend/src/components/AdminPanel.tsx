import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Grid, Modal, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { fetchVideos, updateVideo, deleteVideo } from '../utils/api';
import VideoCard from './VideoCard';
import { Video } from '../types';

const AdminPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState({ genre: '', year: '', name: '' });
  const [editVideo, setEditVideo] = useState<Partial<Video> | null>(null);
  const [omdbProgress, setOmdbProgress] = useState({ updatedCount: 0, total: 0 });

  useEffect(() => {
    const loadVideos = async () => {
      const videoData = await fetchVideos();
      setVideos(videoData);
    };

    loadVideos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editVideo) {
      setEditVideo({ ...editVideo, [name]: value });
    }
  };

  const handleUpdateVideo = async (id: string) => {
    if (editVideo) {
      await updateVideo(id, editVideo);
      const videoData = await fetchVideos();
      setVideos(videoData);
      setEditVideo(null);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideo(id);
    const videoData = await fetchVideos();
    setVideos(videoData);
  };

  const handleFetchOmdbData = () => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/getOmdbData`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        alert(data.message);
        eventSource.close();
      } else {
        setOmdbProgress(data);
      }
    };
  };

  const filteredVideos = videos.filter(video => {
    return (
      (filter.genre ? video.omdbData?.genre?.includes(filter.genre) : true) &&
      (filter.year ? video.movieYear.toString() === filter.year : true) &&
      (filter.name ? video.name.toLowerCase().includes(filter.name.toLowerCase()) : true)
    );
  });

  const uniqueGenres = Array.from(new Set(videos.flatMap(video => video.omdbData?.genre?.split(', ') || [])));

  const videosWithOmdbData = videos.filter(video => video.omdbData).length;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', margin: 'auto', maxWidth: 800 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="h6">Total Videos: {videos.length}</Typography>
        <Typography variant="h6">Videos with OMDB Data: {videosWithOmdbData}</Typography>
        <Typography variant="h6">OMDB Data Fetch Progress: {omdbProgress.updatedCount}/{omdbProgress.total}</Typography>
        <Button variant="contained" color="primary" onClick={handleFetchOmdbData}>
          Fetch OMDB Data
        </Button>
        <FormControl fullWidth>
          <InputLabel>Genre</InputLabel>
          <Select value={filter.genre} onChange={(e) => setFilter({ ...filter, genre: e.target.value })}>
            <MenuItem value="">All</MenuItem>
            {uniqueGenres.map(genre => (
              <MenuItem key={genre} value={genre}>{genre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Year"
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          fullWidth
        />
        <TextField
          label="Name"
          value={filter.name}
          onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          fullWidth
        />
        <Grid container spacing={2} className="video-list">
          {filteredVideos.map((video) => (
            <Grid item key={video.id} xs={12} sm={6} md={4}>
              <VideoCard video={video} />
              <Button variant="contained" color="secondary" onClick={() => setEditVideo(video)}>
                Edit
              </Button>
              <Button variant="contained" color="error" onClick={() => handleDeleteVideo(video.id)}>
                Delete
              </Button>
            </Grid>
          ))}
        </Grid>
        {editVideo && (
          <Box>
            <Typography variant="h6">Edit Video</Typography>
            <TextField
              label="Name"
              name="name"
              value={editVideo.name || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Actors"
              name="actors"
              value={editVideo.actors?.join(', ') || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Movie Year"
              name="movieYear"
              value={editVideo.movieYear?.toString() || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Filepath"
              name="filepath"
              value={editVideo.filepath || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => handleUpdateVideo(editVideo.id!)}>
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AdminPanel;