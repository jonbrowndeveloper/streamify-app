import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import VideoCard from './VideoCard';
import { Video } from '../types';

interface SearchResultsGridProps {
  videos: Video[];
  onVideoSelect: (id: string) => void;
  onClearSearch: () => void;
}

const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({ videos, onVideoSelect, onClearSearch }) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const handleVideoClick = (id: string) => {
    setSelectedVideoId(id);
    onVideoSelect(id);
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" >
            Results ({videos.length})
            </Typography>
            <Button variant="outlined" onClick={onClearSearch} sx={{ marginLeft: 2 }}>
            Clear Search
            </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200.5px, 1fr))',
          gap: 2,
          overflowY: 'auto',
          height: 'calc(100vh - 100px)', // Adjust height as needed
        }}
      >
        {videos.map((video) => (
          <Box key={video.id} sx={{ padding: 1 }}>
            <VideoCard
              video={video}
              isSelected={video.id === selectedVideoId}
              onClick={() => handleVideoClick(video.id)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SearchResultsGrid;