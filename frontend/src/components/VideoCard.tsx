import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import { Video } from '../types';

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
    </Box>
  );
};

export default VideoCard;