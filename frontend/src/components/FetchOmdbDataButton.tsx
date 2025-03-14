import React from 'react';
import { Button } from '@mui/material';

interface FetchOmdbDataButtonProps {
  isFetchingOmdb: boolean;
  handleFetchOmdbData: () => void;
}

const FetchOmdbDataButton: React.FC<FetchOmdbDataButtonProps> = ({ isFetchingOmdb, handleFetchOmdbData }) => {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchOmdbData}
        disabled={isFetchingOmdb}
      >
        {isFetchingOmdb ? 'Fetching OMDB Data...' : 'Fetch OMDB Data'}
      </Button>
    </div>
  );
};

export default FetchOmdbDataButton;