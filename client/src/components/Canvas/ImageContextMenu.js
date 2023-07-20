import "./ContextMenu.css";

import React, { useState } from "react";

const ImageContextMenu = ({ handleAddImageNode, onClose, setIsCreatingImage }) => {
    const [imageUrl, setImageUrl] = useState("");

    const handleImageInputChange = (event) => {
        setImageUrl(event.target.value);
    };

    const handleAddImage = () => {
        const updateFunction = handleAddImageNode(imageUrl);
        updateFunction();
        setIsCreatingImage(false);
        onClose();
    };
    return (
        <li>
            <label htmlFor="imageUrl">이미지 URL:</label>
            <input type="text" value={imageUrl} onChange={handleImageInputChange} />
            <button onClick={handleAddImage}>이미지 추가</button>
        </li>
    );
};

export default ImageContextMenu;
