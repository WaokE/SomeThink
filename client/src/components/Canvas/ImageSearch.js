import React, { useState, useEffect, useRef } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import IconButton from "@mui/material/IconButton";

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

const ImageSearch = ({ style, ...props }) => {
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

        if (img.includes("http")) {
            props.createImage(img, "");
        } else {
            fetchRequest();
        }
        setImg("");
    };

    const handleCreateImage = (url, searchWord) => {
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

    const handleHideImageSearch = () => {
        props.setIsImageSearchVisible(false);
    };

    return (
        <Slide direction="right" in={props.isImageSearchVisible} mountOnEnter unmountOnExit>
            <Box sx={{ ...styles.ImageSearch, ...style }}>
                <IconButton onClick={handleHideImageSearch}>
                    <ArrowBackRoundedIcon />
                </IconButton>
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
            </Box>
        </Slide>
    );
};

export default ImageSearch;
