import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

const styles = {
    ImageSearch: {
        width: "25%",
        height: "80%",
        position: "fixed",
        bottom: "10%",
        border: "2px solid #d9d9d9",
        overflow: "auto",
        backgroundColor: "#f8f8f8",
        borderRadius: "10px",
        left: "2vh",
    },

    ImageList: {
        borderRadius: "5px",
        padding: "10px",
    },

    inputBox: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
    },
};

const drawerWidth = "20%";
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    backgroundColor: "transparent", // 배경 색상을 투명으로 설정합니다
    boxShadow: "none", // 그림자를 없애줍니다
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth})`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

const ImageSearch = ({ style, ...props }) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [img, setImg] = useState("");
    const [res, setRes] = useState([]);
    const searchWordRef = useRef(null);
    const Access_Key = "0zCCA9yC1gkSoH9-qGLfgz9oV0qKCcFwao5cbUR0Cug";
    const url = `https://api.unsplash.com/search/photos?page=1&query=${img}&client_id=${Access_Key}&orientation=portrait&per_page=40&lang=ko`;
    let searchWord = "";

    useEffect(() => {
        // fetchRequest();
    }, []);

    const fetchRequest = async () => {
        const response = await fetch(url);
        const responseJson = await response.json();
        const result = responseJson.results;
        setRes(result);
    };

    const submit = () => {
        searchWordRef.current = img;
        if (img.includes("http") || img.includes("data:image")) {
            props.createImage(img, "");

            handleDrawerClose();
        } else {
            fetchRequest();
        }
        setImg("");
    };

    const handleCreateImage = (url, searchWord) => {
        handleDrawerClose();
        props.createImage(url, searchWord);
    };

    const handleEnterKeyEvent = (e) => {
        if (e.keyCode === 229 || e.isComposing) {
            return;
        }
        if (e.key === "Enter") {
            submit();
        }
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setRes([]);
        setImg("");
        setOpen(false);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <IconButton
                color="primary" // 버튼의 색상을 기본 테마 색상으로 설정합니다 (파란색)
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                    width: "6vh",
                    height: "10vh",
                    position: "fixed",
                    left: "0", // 좌측 가운데로 이동하도록 설정합니다
                    marginLeft: "2vh",
                    bottom: "45%",
                    transform: "translateX(-50%)", // 가운데 정렬을 위해 왼쪽으로 이동합니다
                    ...(open && { display: "none" }),
                    border: "1px solid",
                    borderColor: "#999999",
                    borderRadius: "0 50% 50% 0",
                    backgroundColor: "#fffff6",
                    color: "#F1C93B",
                    zIndex: "9999",
                }}
            >
                <AddPhotoAlternateIcon />
            </IconButton>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <Box sx={styles.inputBox}>
                    <TextField
                        sx={{ width: "80%" }}
                        id="outlined-basic"
                        label="Search Image with Keyword or URL"
                        variant="outlined"
                        onChange={(e) => setImg(e.target.value)}
                        onKeyDown={(e) => handleEnterKeyEvent(e)}
                        value={img}
                    />
                    <Button variant="contained" type="submit" onClick={submit}>
                        <ImageSearchIcon />
                    </Button>
                </Box>
                <ImageList sx={styles.ImageList} variant="masonry" cols={3} rowHeight={121}>
                    {res.map((val) => {
                        return (
                            <ImageListItem key={val.id}>
                                <img
                                    src={val.urls.thumb}
                                    alt={val.alt_description}
                                    loading="lazy"
                                    onClick={() =>
                                        handleCreateImage(val.urls.thumb, searchWordRef.current)
                                    }
                                />
                            </ImageListItem>
                        );
                    })}
                </ImageList>
            </Drawer>
        </Box>
    );
};

export default ImageSearch;
