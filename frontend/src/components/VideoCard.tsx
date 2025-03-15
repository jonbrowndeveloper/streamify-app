import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Modal } from '@mui/material';
import Image from 'next/image';
import { Video } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import VideoInfoModal from './VideoInfoModal';
import { fetchAppSettings } from '../utils/api';

interface VideoCardProps {
  video: Video;
  isSelected: boolean;
  onClick: () => void;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const VideoCard: React.FC<VideoCardProps> = ({ video, isSelected, onClick }) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBasePath, setVideoBasePath] = useState<string>('');

  useEffect(() => {
    const loadAppSettings = async () => {
      const appSettings = await fetchAppSettings();
      setVideoBasePath(appSettings.videoBasePath);
    };

    loadAppSettings();
  }, []);

  const handleInfoClick = () => {
    setInfoModalOpen(true);
  };

  const handleInfoClose = () => {
    setInfoModalOpen(false);
  };

  const handlePlayClick = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stream/${video.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else {
        setVideoUrl(response.url);
        setPlayModalOpen(true);
      }
    } catch (err) {
      setError('An error occurred while trying to fetch the video.');
    }
  };

  const handlePlayClose = () => {
    setPlayModalOpen(false);
    setError(null);
  };

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = event.currentTarget;
    console.log(videoElement.error);
    const errorMessage = videoElement.error?.message || 'An error occurred while trying to play the video.';
    setError(errorMessage);
  };

  const imageHeight = 300;
  const imageWidth = 200.5;
  const posterUrl = video.omdbData?.poster && isValidUrl(video.omdbData.poster)
    ? video.omdbData.poster
    : '/assets/images/poster-placeholder.png';

  if (!isValidUrl(video.omdbData?.poster || '')) {
    console.log(`Invalid poster URL for movie: ${video.name}, OMDB Data: ${!!video.omdbData}, Poster: ${video.omdbData?.poster}`);
  }

  return (
    <>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          transition: 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out',
          transform: isSelected ? 'scale(1.1)' : 'scale(1)', 
          width: imageWidth,
        }}
      >
        <Card className="video-card" sx={{ width: imageWidth }}>
          <Image
            src={posterUrl}
            alt={`${video.name} poster`}
            width={imageWidth}
            height={imageHeight}
            objectFit="cover"
          />
          <CardContent sx={{ height: 40, padding: '16px' }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '1rem',
                width: '100%',
              }}
            >
              {video.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {video.movieYear}
            </Typography>
          </CardContent>
        </Card>
        {isSelected && (
          <Box
            width={imageWidth}
            height={imageHeight}
            sx={{
              position: 'absolute',
              top: 9.33,
              left: 9.33,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <IconButton sx={{ color: 'white', marginRight: 2 }} onClick={handlePlayClick}>
              <PlayArrowIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton sx={{ color: 'white' }} onClick={handleInfoClick}>
              <InfoIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
        )}
      </Box>
      <VideoInfoModal video={video} open={infoModalOpen} onClose={handleInfoClose} />
      <Modal open={playModalOpen} onClose={handlePlayClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 90px)',
            height: 'calc(100% - 90px)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : (
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stream/${video.id}?basePath=${encodeURIComponent(videoBasePath)}`}
              controls
              autoPlay
              style={{ width: '100%', height: '100%' }}
              onError={handleVideoError}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default VideoCard;