import React from "react";
import Chip from "@mui/material/Chip";
import "./NodeLabelsPopup.css";
import Button from "@mui/material/Button";

const NodeLabelsPopup = ({ newNodeLabels, onDelete, onCreate }) => {
    return (
        <div className="popup">
            <h2>추가할 키워드를 선택하세요</h2>
            <div className="chip-container">
                {newNodeLabels.map((label, index) => (
                    <Chip
                        key={index}
                        label={label}
                        onDelete={() => {
                            onDelete(label);
                        }}
                        className="chip"
                    />
                ))}
            </div>
            <Button size="small" variant="elevated" onClick={onCreate} className="create-button">
                Create
            </Button>
        </div>
    );
};

export default NodeLabelsPopup;
