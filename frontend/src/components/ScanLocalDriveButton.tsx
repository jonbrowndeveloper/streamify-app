import React from 'react';
import { Button } from '@mui/material';

interface ScanLocalDriveButtonProps {
  isScanning: boolean;
  handleScanVideos: () => void;
}

const ScanLocalDriveButton: React.FC<ScanLocalDriveButtonProps> = ({ isScanning, handleScanVideos }) => {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleScanVideos}
        disabled={isScanning}
      >
        {isScanning ? 'Scanning...' : 'Scan Local Drive'}
      </Button>
    </div>
  );
};

export default ScanLocalDriveButton;