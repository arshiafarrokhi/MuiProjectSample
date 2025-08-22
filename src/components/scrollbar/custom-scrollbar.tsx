import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomScrollbar = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  overflowX: 'auto',
  // maxHeight: 500,
  // Define custom scrollbar track and thumb styling
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[200],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  // **Remove the default scrollbar arrow buttons**
  '&::-webkit-scrollbar-button': {
    display: 'none',
  },
  // Firefox styling (which doesn’t display arrow buttons by default)
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.primary.main} ${theme.palette.grey[200]}`,
}));

export default CustomScrollbar;
