import React, { useEffect } from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  isSelected: boolean;
  onClick: () => void;
  onInViewChange: (inView: boolean) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isSelected, onClick, onInViewChange }) => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  const viewportHeight = window.innerHeight;
  const imageHeight = 300;
  const imageWidth = imageHeight * 0.675;

  return (
    <Box
      ref={ref}
      component="button"
      onClick={onClick}
      sx={{
        border: 'none',
        background: 'none',
        padding: 0,
        cursor: 'pointer',
        transition: 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
      }}
    >
      {inView && (
        <Card className="video-card" sx={{ width: imageWidth }}>
          <CardMedia
            component="img"
            height={imageHeight}
            image="/assets/images/poster-placeholder.png"
            alt={`${video.name} poster`}
          />
          <CardContent sx={{ height: 40, padding: '16px' }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                whiteSpace: 'nowrap',
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
      )}
    </Box>
  );
};

export default VideoCard;