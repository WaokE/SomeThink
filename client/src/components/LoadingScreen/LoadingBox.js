import LoadingLabel from "./LoadingLabel";
import LoadingProgress from "./LoadingProgress";
import { Box } from "@mui/material";
import someThinkLogo from "../../img/icon/logo.png";

const styles = {
    LoadingBox: {
        height: "50vh",
        width: "50vw",
        backgroundColor: "white",
        position: "absolute",
        border: "1px solid black",
        borderRadius: "10px",
        top: "25vh",
        left: "25vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
};

const LoadingBox = (props) => {
    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",

                position: "absolute",
                zIndex: 999999,
            }}
        >
            <Box sx={styles.LoadingBox}>
                <img src={someThinkLogo} style={{ height: "10vh" }} />
                <LoadingLabel roomNumb={props.roomNumb} />
                <LoadingProgress />
            </Box>
        </div>
    );
};

export default LoadingBox;
