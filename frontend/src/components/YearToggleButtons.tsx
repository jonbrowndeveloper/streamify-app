import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flex: '1 1 auto',
  margin: theme.spacing(0.5),
  minWidth: 50,
  boxSizing: 'border-box',
}));

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
      // If only one decade is selected, deselect it
      onDecadeChange([]);
    } else {
      onDecadeChange(newDecades);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      <ToggleButtonGroup value={selectedDecades} onChange={handleDecadeChange}>
        {decades.map((decade) => (
          <StyledToggleButton key={decade} value={decade}>
            {decade}
          </StyledToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default YearToggleButtons;