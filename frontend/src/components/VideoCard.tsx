import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <Card className="video-card">
      <CardContent>
        <Typography variant="h5" component="div">
          {video.name}
        </Typography>
        {video.actors && (
          <Typography variant="body2" color="text.secondary">
            {video.actors.join(', ')}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {video.movieYear}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VideoCard;