import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import Image from 'next/image';
import { Video } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import VideoInfoModal from './VideoInfoModal';

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

  const handleInfoClick = () => {
    setInfoModalOpen(true);
  };

  const handleInfoClose = () => {
    setInfoModalOpen(false);
  };

  const viewportHeight = window.innerHeight;
  const imageHeight = 300;
  const imageWidth = 205.5;
  const posterUrl = video.omdbData?.poster && isValidUrl(video.omdbData.poster)
    ? video.omdbData.poster
    : '/assets/images/poster-placeholder.png';

  if (!isValidUrl(video.omdbData?.poster || '')) {
    // TODO show in detail view the poster and how to update the url
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
          transform: isSelected ? 'scale(1.1)' : 'scale(1)', 
        }}
      >
        <Card className="video-card">
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
                fontSize: '1rem',
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
                <IconButton sx={{ color: 'white' }}>
                  <PlayArrowIcon sx={{ fontSize: 40 }} />
                </IconButton>
                <IconButton sx={{ color: 'white' }} onClick={handleInfoClick}>
                  <InfoIcon sx={{ fontSize: 40 }} />
                </IconButton>
              </Box>
            )}
      </Box>
      <VideoInfoModal video={video} open={infoModalOpen} onClose={handleInfoClose} />
    </>
  );
};

export default VideoCard;