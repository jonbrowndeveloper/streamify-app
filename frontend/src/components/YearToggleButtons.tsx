import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

interface YearToggleButtonsProps {
  decades: string[];
  selectedDecades: string[];
  onDecadeChange: (decades: string[]) => void;
}

const YearToggleButtons: React.FC<YearToggleButtonsProps> = ({ decades, selectedDecades, onDecadeChange }) => {
  const handleDecadeChange = (event: React.MouseEvent<HTMLElement>, newDecades: string[]) => {
    if (newDecades.length === 0) {
      // If the only selected decade is clicked again, reselect all decades
      onDecadeChange(decades);
    } else if (newDecades.length === 1 && selectedDecades.length !== 1) {
      // If a single decade is selected, deselect all others
      onDecadeChange(newDecades);
    } else {
      // Otherwise, update the selected decades
      onDecadeChange(newDecades);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
      <ToggleButtonGroup
        value={selectedDecades}
        onChange={handleDecadeChange}
        aria-label="decade selection"
      >
        {decades.sort().map(decade => (
          <ToggleButton key={decade} value={decade} aria-label={decade}>
            {decade.endsWith('s') ? decade.slice(0, -1) : decade}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default YearToggleButtons;