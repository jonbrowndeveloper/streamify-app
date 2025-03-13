import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Modal, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModesModel, GridRowModes, GridActionsCellItem, GridRowId } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchVideos, updateVideo, deleteVideo } from '../utils/api';
import { Video } from '../types';

const AdminPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState({ genre: '', year: '' });
  const [editVideo, setEditVideo] = useState<Partial<Video> | null>(null);
  const [omdbProgress, setOmdbProgress] = useState<{ updatedCount: number; total: number } | null>(null);
  const [scanResult, setScanResult] = useState<{ videosFound: number; videosInsertedToDB: number; errors: any[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingOmdb, setIsFetchingOmdb] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      const videoData = await fetchVideos();
      setVideos(videoData);
    };

    loadVideos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editVideo) {
      setEditVideo({ ...editVideo, [name]: value });
    }
  };

  const handleUpdateVideo = async (id: string) => {
    if (editVideo) {
      await updateVideo(id, editVideo);
      const videoData = await fetchVideos();
      setVideos(videoData);
      setEditVideo(null);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideo(id);
    const videoData = await fetchVideos();
    setVideos(videoData);
  };

  const handleDeleteSelectedVideos = async () => {
    for (const id of selectedVideos) {
      await deleteVideo(id);
    }
    const videoData = await fetchVideos();
    setVideos(videoData);
    setSelectedVideos([]);
  };

  const handleFetchOmdbData = () => {
    setIsFetchingOmdb(true);
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/getOMDBData`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        alert(data.message);
        eventSource.close();
        setIsFetchingOmdb(false);
      } else {
        setOmdbProgress(data);
      }
    };
  };

  const handleScanVideos = () => {
    setIsScanning(true);
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/scan`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        alert(data.message);
        eventSource.close();
        setIsScanning(false);
        setScanResult(data);
      } else {
        setVideos(prevVideos => {
          const newVideosCount = data.totalVideosInserted - prevVideos.length;
          if (newVideosCount > 0) {
            return [...prevVideos, ...Array(newVideosCount).fill({})];
          }
          return prevVideos;
        });
      }
    };
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const video = videos.find((video) => video.id === id);
    if (video) {
      await updateVideo(id.toString(), video);
      const videoData = await fetchVideos();
      setVideos(videoData);
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });
  };

  const handleRowEdit = (params: any) => {
    const updatedVideos = videos.map((video) => (video.id === params.id ? { ...video, ...params } : video));
    setVideos(updatedVideos);
  };

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
    { field: 'omdbData', headerName: 'OMDB Data', width: 150, renderCell: (params: GridRenderCellParams) => params.value ? 'True' : 'False' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        return [
          !isInEditMode && (
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={handleEditClick(params.id)}
            />
          ),
          isInEditMode && (
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(params.id)}
            />
          ),
          isInEditMode && (
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(params.id)}
            />
          ),
          !isInEditMode && (
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteVideo(params.id.toString())}
            />
          ),
        ].filter(Boolean);
      },
    },
  ];

  const videosWithOmdbData = videos.filter(video => video.omdbData).length;
  const videosWithOmdbErrors = videos.filter(video => video.omdbData?.response === 'False').length;

  const omdbErrors = videos.reduce((acc, video) => {
    if (video.omdbData?.response === 'False' && video.omdbData?.error) {
      acc[video.omdbData.error] = (acc[video.omdbData.error] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', margin: 'auto', maxWidth: 800 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="h6">Total Videos: {videos.length}</Typography>
        <Typography variant="h6">Videos with OMDB Data: {videosWithOmdbData}</Typography>
        {isFetchingOmdb && omdbProgress && (
          <Typography variant="h6">OMDB Data Fetch Progress: {omdbProgress.updatedCount}/{omdbProgress.total}</Typography>
        )}
        {videosWithOmdbErrors > 0 && (
          <Typography variant="h6">Videos with OMDB Errors: {videosWithOmdbErrors}</Typography>
        )}
        {Object.keys(omdbErrors).length > 0 && (
          <>
            <Typography variant="h6">OMDB Errors:</Typography>
            <ul>
              {Object.entries(omdbErrors).map(([error, count]) => (
                <li key={error}>
                  {error}: {count}
                </li>
              ))}
            </ul>
          </>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleScanVideos}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan Local Drive'}
          </Button>
          {scanResult && (
            <>
              <Typography variant="h6">
                Scan Result: {scanResult.videosFound ?? 0} videos found, {scanResult.videosInsertedToDB ?? 0} videos inserted to DB
              </Typography>
              {scanResult.errors.length > 0 && (
                <Typography variant="h6" color="error">
                  Errors:
                  <ul>
                    {scanResult.errors.map((error, index) => (
                      <li key={index}>{error.file}: {error.error}</li>
                    ))}
                  </ul>
                </Typography>
              )}
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchOmdbData}
            disabled={isFetchingOmdb}
          >
            {isFetchingOmdb ? 'Fetching OMDB Data...' : 'Fetch OMdb Data'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelectedVideos}
            disabled={selectedVideos.length === 0}
          >
            Delete Selected
          </Button>
        </Box>
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
        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={filteredVideos}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.id}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectedVideos(newSelection as string[]);
            }}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowEditStop={handleRowEdit}
            components={{
              Row: (props) => (
                <div>
                  <props.Row {...props} />
                  {props.row.omdbData && (
                    <div style={{ paddingLeft: 20 }}>
                      <Typography variant="body2">OMDB Data:</Typography>
                      <pre>{JSON.stringify(props.row.omdbData, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </Box>
        {editVideo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Edit Video</Typography>
            <TextField
              label="Name"
              name="name"
              value={editVideo.name || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Actors"
              name="actors"
              value={editVideo.actors?.join(', ') || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Movie Year"
              name="movieYear"
              value={editVideo.movieYear?.toString() || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Filepath"
              name="filepath"
              value={editVideo.filepath || ''}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Button variant="contained" color="primary" onClick={() => handleUpdateVideo(editVideo.id!)} sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AdminPanel;