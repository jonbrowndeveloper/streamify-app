import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModesModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { Video } from '../types';

interface VideoFilterAndGridProps {
  videos: Video[];
  filter: { genre: string; year: string };
  setFilter: (filter: { genre: string; year: string }) => void;
  selectedVideos: string[];
  setSelectedVideos: (selectedVideos: string[]) => void;
  rowModesModel: GridRowModesModel;
  setRowModesModel: (rowModesModel: GridRowModesModel) => void;
  handleRowEdit: (params: any) => void;
}

const VideoFilterAndGrid: React.FC<VideoFilterAndGridProps> = ({
  videos,
  filter,
  setFilter,
  selectedVideos,
  setSelectedVideos,
  rowModesModel,
  setRowModesModel,
  handleRowEdit,
}) => {
  const filteredVideos = videos.filter(video => {
    return (
      (filter.genre ? video.omdbData?.genre?.includes(filter.genre) : true) &&
      (filter.year ? video.movieYear.toString() === filter.year : true)
    );
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'altName', headerName: 'Alt Name', width: 200, editable: true },
    { field: 'actors', headerName: 'Actors', width: 200, editable: true, renderCell: (params: GridRenderCellParams) => params.value?.join(', ') },
    { field: 'movieYear', headerName: 'Year', width: 100, editable: true },
    { field: 'filepath', headerName: 'Filepath', width: 300, editable: true },
    { field: 'omdbData', headerName: 'OMDB Data', width: 150, renderCell: (params: GridRenderCellParams) => (
      <div>
        {params.value ? 'True' : 'False'}
        {params.value && (
          <div style={{ paddingLeft: 20 }}>
            <Typography variant="body2">OMDB Data:</Typography>
            <pre>{JSON.stringify(params.value, null, 2)}</pre>
          </div>
        )}
      </div>
    ) },
  ];

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Genre</InputLabel>
        <Select value={filter.genre} onChange={(e) => setFilter({ ...filter, genre: e.target.value })}>
          <MenuItem value="">All</MenuItem>
          {Array.from(new Set(videos.flatMap(video => video.omdbData?.genre?.split(', ') || []))).map(genre => (
            <MenuItem key={genre} value={genre}>{genre}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Year"
        value={filter.year}
        onChange={(e) => setFilter({ ...filter, year: e.target.value })}
        fullWidth
        sx={{ mt: 2 }}
      />
      <Box sx={{ flexGrow: 1, mt: 2, overflow: 'auto' }}>
        <DataGrid
          rows={filteredVideos}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
            setSelectedVideos(newSelection as string[]);
          }}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStop={handleRowEdit}
        />
      </Box>
    </Box>
  );
};

export default VideoFilterAndGrid;