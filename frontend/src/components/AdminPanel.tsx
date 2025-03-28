import React, { useState, useEffect } from 'react';
import { Typography, Modal, Box, Button, TextField, Alert, LinearProgress } from '@mui/material';
import { fetchVideos, updateVideo, deleteVideo, scanVideos, fetchOmdbData, updateAppSettings, fetchAppSettings } from '../utils/api';
import { Video } from '../types';
import ScanLocalDriveButton from './ScanLocalDriveButton';
import FetchOmdbDataButton from './FetchOmdbDataButton';
import VideoFilterAndGrid from './VideoFilterAndGrid';
import { GridRowModesModel } from '@mui/x-data-grid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AdminPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState({ genre: '', year: '' });
  const [editVideo, setEditVideo] = useState<Partial<Video> | null>(null);
  const [omdbProgress, setOmdbProgress] = useState<{ updatedCount: number; total: number } | null>(null);
  const [scanResult, setScanResult] = useState<{ totalVideosFound: number; totalVideosInserted: number; errors?: { file: string; error: string }[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingOmdb, setIsFetchingOmdb] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'success' | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [basePath, setBasePath] = useState('/mnt/external_drive/Video/Movies');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  useEffect(() => {
    const loadAppSettings = async () => {
      const appSettings = await fetchAppSettings();
      setBasePath(appSettings.videoBasePath);
    };

    loadAppSettings();
  }, []);

  useEffect(() => {
    const loadVideos = async () => {
      const videoData = await fetchVideos();
      setVideos(videoData);
    };

    loadVideos();
  }, []);

  const handleFetchOmdbData = async () => {
    setIsFetchingOmdb(true);
    setAlertMessage(null);

    const eventSource = new EventSource(`${API_URL}/api/getOMDBData`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setOmdbProgress(data);
      if (data.message) {
        setAlertMessage(data.message);
        setAlertSeverity('success');
      }
    };

    eventSource.addEventListener('error', (event) => {
      console.error('Error event:', event);
      try {
        const errorData = JSON.parse((event as MessageEvent).data);
        setAlertMessage(`An error occurred while fetching OMDB data: ${errorData.error}`);
      } catch (e) {
        setAlertMessage('An unknown error occurred while fetching OMDB data.');
      }
      eventSource.close();
      setIsFetchingOmdb(false);
      setAlertSeverity('error');
    });

    eventSource.onopen = () => {
      console.log('Connection to OMDB data fetch event source opened.');
    };

    eventSource.addEventListener('end', async (event) => {
      eventSource.close();
      setIsFetchingOmdb(false);
      const videoData = await fetchVideos();
      setVideos(videoData);
      if (!alertMessage) {
        const endData = JSON.parse((event as MessageEvent).data);
        setAlertMessage(endData.message);
        setAlertSeverity('success');
      }
    });
  };

  const handleScanVideos = async () => {
    setIsScanning(true);
    setAlertMessage(null);

    const eventSource = new EventSource(`${API_URL}/api/scan`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setScanResult(data);
      if (Array.isArray(data.newVideos)) {
        setVideos((prevVideos) => [...prevVideos, ...data.newVideos]);
      }
    };

    eventSource.addEventListener('error', (event) => {
      console.error('Error event:', event);
      try {
        const errorData = JSON.parse((event as MessageEvent).data);
        setAlertMessage(`An error occurred while scanning videos: ${errorData.error}`);
      } catch (e) {
        setAlertMessage('An unknown error occurred while scanning videos.');
      }
      eventSource.close();
      setIsScanning(false);
      setAlertSeverity('error');
    });

    eventSource.onopen = () => {
      console.log('Connection to scan event source opened.');
    };

    eventSource.addEventListener('end', async (event) => {
      eventSource.close();
      setIsScanning(false);
      const videoData = await fetchVideos();
      setVideos(videoData);
      const endData = JSON.parse((event as MessageEvent).data);
      setAlertMessage(endData.message);
      setAlertSeverity('success');
    });
  };

  const handleBasePathChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBasePath = e.target.value;
    setBasePath(newBasePath);
    await updateAppSettings({ videoBasePath: newBasePath });
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
        {(isScanning || isFetchingOmdb) && (
          <LinearProgress
            variant="determinate"
            value={isScanning ? (scanResult ? (scanResult.totalVideosInserted / scanResult.totalVideosFound) * 100 : 0) : (omdbProgress ? (omdbProgress.updatedCount / omdbProgress.total) * 100 : 0)}
            sx={{ mb: 2 }}
          />
        )}
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        {alertMessage && (
          <Alert severity={alertSeverity || 'error'} sx={{ mt: 2 }}>
            {alertMessage}
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <ScanLocalDriveButton isScanning={isScanning} handleScanVideos={handleScanVideos} />
          <FetchOmdbDataButton isFetchingOmdb={isFetchingOmdb} handleFetchOmdbData={handleFetchOmdbData} />
        </Box>
        <TextField
          label="Base Path"
          value={basePath}
          onChange={handleBasePathChange}
          fullWidth
          sx={{ mt: 2 }}
        />
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h6">Total Videos: {isScanning && scanResult ? scanResult.totalVideosInserted : videos.length}</Typography>
          <Typography variant="h6">Videos with OMDB Data: {isFetchingOmdb && omdbProgress ? omdbProgress.updatedCount : videosWithOmdbData}</Typography>
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
        </Box>
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
      </Box>
    </Modal>
  );
};

export default AdminPanel;