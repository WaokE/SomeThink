import * as React from "react";
import "./TopBar.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { deepOrange } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import MicSharpIcon from "@mui/icons-material/MicSharp";
import MicOffSharpIcon from "@mui/icons-material/MicOffSharp";
import Switch from "@mui/material/Switch";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { ExitToApp } from "@mui/icons-material";

function TopBar({ onExportClick, sessionId, leaveSession, toggleAudio, audioEnabled }) {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1 }}>
            <AppBar position="static" style={{ backgroundColor: "#FBEEAC", marginBottom: "10px" }}>
                <Toolbar className="top-bar-container">
                    <div className="topbar-menu">
                        <p className="code" >#{sessionId}</p>
                    </div>
                    {/* Your logo image */}
                    <div style={{ margin: "0 10px" }}></div>
                    <div className="avatar-group-container">
                        <AvatarGroup max={1}>
                            <Avatar
                                sx={{ bgcolor: deepOrange[100] }}
                                alt=""
                                src="/broken-image.jpg"
                            />
                            <Avatar
                                sx={{ bgcolor: deepOrange[500] }}
                                alt=""
                                src="/broken-image.jpg"
                            />
                            <Avatar src="/broken-image.jpg" />
                        </AvatarGroup>
                    </div>
                    <div className="button-container">
                        {audioEnabled ? (
                            <MicOffSharpIcon sx={{ color: "gray" }} />
                        ) : (
                            <MicSharpIcon sx={{ color: "gray" }} />
                        )}
                        <Switch
                            checked={!audioEnabled}
                            onChange={toggleAudio}
                            inputProps={{ "aria-label": "controlled" }}
                        />
                        <IconButton aria-label="CameraAltIcon" size="large" onClick={onExportClick}>
                            <CameraAltIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton aria-label="ExitToApp" size="large" onClick={leaveSession}>
                            <ExitToApp fontSize="inherit" />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default TopBar;
