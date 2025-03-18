import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    flex: '1 1 auto',
    margin: theme.spacing(0.5),
    minWidth: 50,
    boxSizing: 'border-box',
  },
}));

interface YearToggleButtonsProps {
  decades: string[];
  selectedDecades: string[];
  onDecadeChange: (decades: string[]) => void;
}

const YearToggleButtons: React.FC<YearToggleButtonsProps> = ({ decades, selectedDecades, onDecadeChange }) => {
  const classes = useStyles();

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
    <ToggleButtonGroup
      value={selectedDecades}
      onChange={handleDecadeChange}
      className={classes.root}
    >
      {decades.map((decade) => (
        <ToggleButton key={decade} value={decade} className={classes.button}>
          {decade}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default YearToggleButtons;