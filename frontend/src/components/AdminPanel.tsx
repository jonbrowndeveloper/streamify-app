import React, { useState, useEffect } from 'react';
import { Typography, Modal, Box, Button, TextField, Alert } from '@mui/material';
import { fetchVideos, updateVideo, deleteVideo } from '../utils/api';
import { Video } from '../types';
import ScanLocalDriveButton from './ScanLocalDriveButton';
import FetchOmdbDataButton from './FetchOmdbDataButton';
import VideoFilterAndGrid from './VideoFilterAndGrid';
import { GridRowModesModel } from '@mui/x-data-grid';

const AdminPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState({ genre: '', year: '' });
  const [editVideo, setEditVideo] = useState<Partial<Video> | null>(null);
  const [omdbProgress, setOmdbProgress] = useState<{ updatedCount: number; total: number } | null>(null);
  const [scanResult, setScanResult] = useState<{ videosFound: number; videosInsertedToDB: number; errors: any[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingOmdb, setIsFetchingOmdb] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success' | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

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

  const handleFetchOmdbData = async () => {
    setIsFetchingOmdb(true);
    setAlertMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/getOMDBData`);
      if (!response.ok) {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'An error occurred while fetching OMDB data.');
        setAlertSeverity('error');
        setIsFetchingOmdb(false);
        return;
      }

      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/getOMDBData`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          setAlertMessage(data.message);
          setAlertSeverity('error');
          eventSource.close();
          setIsFetchingOmdb(false);
        } else {
          setOmdbProgress(data);
        }
      };
      eventSource.onerror = async (event: any) => {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'An error occurred while fetching OMDB data.';
        setAlertMessage(errorMessage);
        setAlertSeverity('error');
        eventSource.close();
        setIsFetchingOmdb(false);
      };
    } catch (error) {
      setAlertMessage('An error occurred while fetching OMDB data.');
      setAlertSeverity('error');
      setIsFetchingOmdb(false);
    }
  };

  const handleScanVideos = async () => {
    setIsScanning(true);
    setAlertMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/scan`);
      if (!response.ok) {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'An error occurred while scanning videos.');
        setAlertSeverity('error');
        setIsScanning(false);
        return;
      }

      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/scan`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          setAlertMessage(data.error);
          setAlertSeverity('error');
          eventSource.close();
          setIsScanning(false);
        } else if (data.message) {
          setScanResult(data);
          setAlertMessage('Scan completed successfully.');
          setAlertSeverity('success');
          eventSource.close();
          setIsScanning(false);
        } else {
          setVideos(prevVideos => {
            const newVideosCount = data.totalVideosInserted - prevVideos.length;
            if (newVideosCount > 0) {
              return [...prevVideos, ...Array(newVideosCount).fill({})];
            }
            return prevVideos;
          });
        }
      };
      eventSource.onerror = async (event: any) => {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'An error occurred while scanning videos.';
        setAlertMessage(errorMessage);
        setAlertSeverity('error');
        eventSource.close();
        setIsScanning(false);
      };
    } catch (error) {
      setAlertMessage('An error occurred while scanning videos.');
      setAlertSeverity('error');
      setIsScanning(false);
    }
  };

  const handleRowEdit = (params: any) => {
    const updatedVideos = videos.map((video) => (video.id === params.id ? { ...video, ...params } : video));
    setVideos(updatedVideos);
  };

  const videosWithOmdbData = videos.filter(video => video.omdbData).length;
  const videosWithOmdbErrors = videos.filter(video => video.omdbData?.response === 'False').length;

  const omdbErrors = videos.reduce((acc, video) => {
    if (video.omdbData?.response === 'False' && video.omdbData?.error) {
      acc[video.omdbData.error] = (acc[video.omdbData.error] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', margin: '45px auto', maxWidth: 800, height: 'calc(100vh - 90px)', overflowY: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="h6">Total Videos: {videos.length}</Typography>
        <Typography variant="h6">Videos with OMDB Data: {videosWithOmdbData}</Typography>
        {videosWithOmdbErrors > 0 && (
          <Typography variant="h6">Videos with OMDB Errors: {videosWithOmdbErrors}</Typography>
        )}
        {Object.keys(omdbErrors).length > 0 && (
          <>
            <Typography variant="h6">OMDB Errors:</Typography>
            <ul>
              {Object.entries(omdbErrors).map(([error, count]) => (
                <li key={error}>
                  {error}: {count}
                </li>
              ))}
            </ul>
          </>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <ScanLocalDriveButton
            isScanning={isScanning}
            handleScanVideos={handleScanVideos}
          />
          <FetchOmdbDataButton
            isFetchingOmdb={isFetchingOmdb}
            handleFetchOmdbData={handleFetchOmdbData}
          />
        </Box>
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mt: 2 }}>
            {alertMessage}
          </Alert>
        )}
        <VideoFilterAndGrid
          videos={videos}
          filter={filter}
          setFilter={setFilter}
          selectedVideos={selectedVideos}
          setSelectedVideos={setSelectedVideos}
          rowModesModel={rowModesModel}
          setRowModesModel={setRowModesModel}
          handleRowEdit={handleRowEdit}
        />
        {editVideo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Edit Video</Typography>
            <TextField
              label="Name"
              name="name"
              value={editVideo.name || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Actors"
              name="actors"
              value={editVideo.actors?.join(', ') || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Movie Year"
              name="movieYear"
              value={editVideo.movieYear?.toString() || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Filepath"
              name="filepath"
              value={editVideo.filepath || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Button variant="contained" color="primary" onClick={() => handleUpdateVideo(editVideo.id!)} sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AdminPanel;