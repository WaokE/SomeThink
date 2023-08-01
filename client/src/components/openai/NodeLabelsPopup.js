import React from "react";
import Chip from "@mui/material/Chip";
import "./NodeLabelsPopup.css";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import IconButton from "@mui/material/IconButton";

const useStyles = makeStyles({
    roundedButton: {
        borderRadius: "50%",
        minWidth: 0,
        width: "2.5rem",
        height: "2.5rem",
        padding: 0,
    },
});
const NodeLabelsPopup = ({ newNodeLabels, onDelete, onCreate, onClose, onRestart }) => {
    const classes = useStyles();

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
                        <Button
                            size="small"
                            variant="elevated"
                            onClick={onCreate}
                            className={`${classes.roundedButton}`}
                        >
                            생성
                        </Button>
                        <Button
                            size="small"
                            variant="elevated"
                            onClick={onClose}
                            className={`${classes.roundedButton}`}
                        >
                            취소
                        </Button>
                        <IconButton
                            size="small"
                            variant="elevated"
                            onClick={onRestart}
                            className={`${classes.roundedButton}`}
                        >
                            <RestartAltIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeLabelsPopup;
