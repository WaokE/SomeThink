import React, { useState, useEffect } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

const styles = {
    ImageSearch: {
        width: "20%",
        height: "80%",
        position: "fixed",
        bottom: "5%",
        border: "2px solid #d9d9d9",
        overflow: "auto",
        backgroundColor: "#f8f8f8",
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

function srcset(image, size, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format&dpr=2 2x`,
    };
}

const ImageSearch = (props) => {
    const [img, setImg] = useState("");
    const [res, setRes] = useState([]);
    const Access_Key = "0zCCA9yC1gkSoH9-qGLfgz9oV0qKCcFwao5cbUR0Cug";
    const url = `https://api.unsplash.com/search/photos?page=1&query=${img}&client_id=${Access_Key}&orientation=portrait&per_page=40&lang=ko`;

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        const response = await fetch(url);
        const responseJson = await response.json();
        const result = responseJson.results;
        console.log(result);
        setRes(result);
    };

    const submit = () => {
        fetchRequest();
        setImg("");
    };

    const handleCreateImage = (url) => {
        props.createImage(url);
    };

    return (
        <Slide direction="right" in={props.isImageSearchVisible} mountOnEnter unmountOnExit>
            <Box sx={styles.ImageSearch}>
                <Box sx={styles.inputBox}>
                    <TextField
                        sx={{ width: "80%" }}
                        id="outlined-basic"
                        label="원하는 이미지를 검색하세요."
                        variant="outlined"
                        onChange={(e) => setImg(e.target.value)}
                    />
                    <Button variant="contained" type="submit" onClick={submit}>
                        <ImageSearchIcon />
                    </Button>
                </Box>
                <ImageList sx={styles.ImageList} variant="masonry" cols={2} rowHeight={121}>
                    {res.map((val) => {
                        console.log(val);
                        return (
                            <ImageListItem key={val.id}>
                                <img
                                    src={val.urls.thumb}
                                    alt={val.alt_description}
                                    loading="lazy"
                                    onClick={() => handleCreateImage(val.urls.thumb)}
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
