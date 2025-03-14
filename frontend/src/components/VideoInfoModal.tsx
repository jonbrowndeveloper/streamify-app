import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import { Video } from '../types';

interface VideoInfoModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
}

const VideoInfoModal: React.FC<VideoInfoModalProps> = ({ video, open, onClose }) => {
  if (!video) return null;

  const posterUrl = video.omdbData?.poster || '/assets/images/poster-placeholder.png';

  return (
    <Modal open={open} onClose={onClose}>
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
          flexDirection: 'row',
          overflow: 'auto',
        }}
      >
        <Box sx={{ flex: '1 1 40%', position: 'relative' }}>
          <Image
            src={posterUrl}
            alt={`${video.name} poster`}
            layout="fill"
            objectFit="cover"
          />
        </Box>
        <Box sx={{ flex: '1 1 60%', pl: 4 }}>
          <Typography variant="h4" gutterBottom>{video.name}</Typography>
          <Typography variant="body1"><strong>Year:</strong> {video.omdbData?.year}</Typography>
          <Typography variant="body1"><strong>Rated:</strong> {video.omdbData?.rated}</Typography>
          <Typography variant="body1"><strong>Released:</strong> {video.omdbData?.released}</Typography>
          <Typography variant="body1"><strong>Runtime:</strong> {video.omdbData?.runtime}</Typography>
          <Typography variant="body1"><strong>Genre:</strong> {video.omdbData?.genre}</Typography>
          <Typography variant="body1"><strong>Director:</strong> {video.omdbData?.director}</Typography>
          <Typography variant="body1"><strong>Writer:</strong> {video.omdbData?.writer}</Typography>
          <Typography variant="body1"><strong>Actors:</strong> {video.omdbData?.actors}</Typography>
          <Typography variant="body1"><strong>Plot:</strong> {video.omdbData?.plot}</Typography>
          <Typography variant="body1"><strong>Language:</strong> {video.omdbData?.language}</Typography>
          <Typography variant="body1"><strong>Country:</strong> {video.omdbData?.country}</Typography>
          <Typography variant="body1"><strong>Awards:</strong> {video.omdbData?.awards}</Typography>
          <Typography variant="body1"><strong>Metascore:</strong> {video.omdbData?.metascore}</Typography>
          <Typography variant="body1"><strong>IMDB Rating:</strong> {video.omdbData?.imdbRating}</Typography>
          <Typography variant="body1"><strong>IMDB Votes:</strong> {video.omdbData?.imdbVotes}</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: 'black',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Modal>
  );
};

export default VideoInfoModal;