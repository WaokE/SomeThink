import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";

const LoadingProgress = ({ progress }) => {
    return (
        <Box sx={{ display: "flex" }}>
            <CircularProgress />
        </Box>
    );
};

export default LoadingProgress;
