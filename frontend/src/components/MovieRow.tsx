import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import VideoCard from './VideoCard';
import { Video } from '../types';

interface MovieRowProps {
  genre: string;
  videos: Video[];
  selectedVideoId: string | null;
  onVideoSelect: (id: string) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ genre, videos, selectedVideoId, onVideoSelect }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleVideoClick = useCallback((id: string) => {
    onVideoSelect(id);
  }, [onVideoSelect]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const videoWidth = 216;
      const scrollAmount = videoWidth * 3;
      const newScrollPosition = direction === 'left'
        ? Math.max(scrollPosition - scrollAmount, 0)
        : Math.min(scrollPosition + scrollAmount, rowRef.current.scrollWidth - rowRef.current.clientWidth);
      rowRef.current.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
      setScrollPosition(newScrollPosition);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.pageX;
    const startScrollLeft = rowRef.current?.scrollLeft || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (rowRef.current) {
        const dx = moveEvent.pageX - startX;
        rowRef.current.scrollLeft = startScrollLeft - dx;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].pageX;
    const startScrollLeft = rowRef.current?.scrollLeft || 0;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (rowRef.current) {
        const dx = moveEvent.touches[0].pageX - startX;
        rowRef.current.scrollLeft = startScrollLeft - dx;
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const Row = ({ index, style }: ListChildComponentProps) => (
    <Box style={{ ...style, marginRight: 16 }} sx={{ flex: '0 0 auto', transition: 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out', }}>
      <VideoCard
        video={videos[index]}
        isSelected={videos[index].id === selectedVideoId}
        onClick={() => handleVideoClick(videos[index].id)}
      />
    </Box>
  );

  useEffect(() => {
    console.log('Scroll Position:', scrollPosition);
  }, [scrollPosition]);

  return (
    <Box sx={{ marginBottom: 4, overflow: 'hidden', position: 'relative', height: 480 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {genre} ({videos.length})
      </Typography>
      <Box
        ref={rowRef}
        sx={{
          display: 'flex',
          scrollBehavior: 'smooth',
          overflow: 'hidden',
          width: '100%',
          cursor: 'grab',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <List
          height={450}
          itemCount={videos.length}
          itemSize={216} // Increased item size to account for margin
          layout="horizontal"
          width={window.innerWidth}
        >
          {Row}
        </List>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: 0, width: '100%' }}>
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{ zIndex: 1 }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{ zIndex: 1 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MovieRow;