import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import MovieRow from './MovieRow';
import YearToggleButtons from './YearToggleButtons';
import SearchResultsGrid from './SearchResultsGrid';
import { Video } from '../types';

interface MovieDisplayProps {
  videos: Video[];
  searchQuery: string;
}

const shuffleArray = (array: Video[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getDecade = (year: number) => `${Math.floor(year / 10) * 10}s`;

const MovieDisplay: React.FC<MovieDisplayProps> = ({ videos, searchQuery }) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [shuffledVideos, setShuffledVideos] = useState<Video[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);

  useEffect(() => {
    setShuffledVideos(shuffleArray([...videos]));
  }, [videos]);

  useEffect(() => {
    const uniqueDecades = Array.from(new Set(videos.map(video => getDecade(video.movieYear)))).sort();
    setSelectedDecades(uniqueDecades);
  }, [videos]);

  const genres = Array.from(new Set(shuffledVideos.flatMap(video => video.omdbData?.genre?.split(', ') || [])));

  const handleVideoSelect = useCallback((id: string) => {
    setSelectedVideoId(id);
  }, []);

  const handleDecadeChange = (decades: string[]) => {
    setSelectedDecades(decades);
  };

  const filteredVideos = searchQuery
    ? videos.filter(video =>
        video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.actors.some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        video.omdbData?.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.omdbData?.writer?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shuffledVideos.filter(video => selectedDecades.includes(getDecade(video.movieYear)));

  const displayedVideoIds = new Set<string>();

  return (
    <Box sx={{ padding: 2 }}>
      <YearToggleButtons
        decades={Array.from(new Set(videos.map(video => getDecade(video.movieYear)))).sort()}
        selectedDecades={selectedDecades}
        onDecadeChange={handleDecadeChange}
      />
      {searchQuery ? (
        <SearchResultsGrid videos={filteredVideos} onVideoSelect={handleVideoSelect} onClearSearch={() => setSelectedDecades([])} />
      ) : (
        genres.map(genre => {
          const genreVideos = filteredVideos.filter(video => video.omdbData?.genre?.includes(genre));
          const uniqueGenreVideos = genreVideos.filter(video => !displayedVideoIds.has(video.id));
          const duplicateGenreVideos = genreVideos.filter(video => displayedVideoIds.has(video.id));
          uniqueGenreVideos.forEach(video => displayedVideoIds.add(video.id));
          const finalGenreVideos = [...uniqueGenreVideos, ...duplicateGenreVideos];
          return (
            <MovieRow
              key={genre}
              genre={genre}
              videos={finalGenreVideos}
              selectedVideoId={selectedVideoId}
              onVideoSelect={handleVideoSelect}
            />
          );
        })
      )}
    </Box>
  );
};

export default MovieDisplay;