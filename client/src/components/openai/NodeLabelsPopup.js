import React from "react";
import Chip from "@mui/material/Chip";
import "./NodeLabelsPopup.css";
import IconButton from "@mui/material/IconButton";
import DoneIcon from "@mui/icons-material/Done";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
const NodeLabelsPopup = ({ newNodeLabels, onDelete, onCreate, onClose, onRestart }) => {
    return (
        <div className="transparent-layer">
            <div className="popup">
                <div className="popup-content">
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
                    <div className="Button-container">
                        <Tooltip title="생성" placement="bottom">
                            <IconButton size="small" variant="elevated" onClick={onCreate}>
                                <DoneIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="취소" placement="bottom">
                            <IconButton size="small" variant="elevated" onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="재추천" placement="bottom">
                            <IconButton size="small" variant="elevated" onClick={onRestart}>
                                <RestartAltIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeLabelsPopup;
