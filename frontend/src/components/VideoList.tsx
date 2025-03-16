import React from 'react';
import { Grid } from '@mui/material';
import VideoCard from './VideoCard';
import { Video } from '../types';

interface VideoListProps {
  videos: Video[];
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
  return (
    <Grid container spacing={4} className="video-list">
      {videos.map((video) => (
        <Grid item key={video.id} xs={12} sm={6} md={4}>
          <VideoCard 
            video={video} 
            isSelected={false} 
            onClick={() => console.log(video.id)} 
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default VideoList;