import * as React from "react";
import "./TopBar.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { deepOrange } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";

function TopBar({ onExportClick }) {
    return (
        <AppBar position="static" style={{ backgroundColor: "#FBEEAC" }}>
            <Toolbar className="top-bar-container">
                {/* Your logo image */}
                <image className="logo" alt="Logo" />
                {/* Your AvatarGroup and IconButton components go here */}
                <div className="avatar-group-container">
                    <AvatarGroup max={1}>
                        <Avatar sx={{ bgcolor: deepOrange[100] }} alt="" src="/broken-image.jpg" />
                        <Avatar sx={{ bgcolor: deepOrange[500] }} alt="" src="/broken-image.jpg" />
                        <Avatar src="/broken-image.jpg" />
                    </AvatarGroup>
                    <IconButton
                        aria-label="CameraAltOutlinedIcon"
                        size="large"
                        onClick={onExportClick}
                    >
                        <CameraAltOutlinedIcon fontSize="inherit" />
                    </IconButton>
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
