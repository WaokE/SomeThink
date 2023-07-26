import React, { useState, useEffect } from "react";
import "./TopBar.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { deepOrange } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import MicSharpIcon from "@mui/icons-material/MicSharp";
import MicOffSharpIcon from "@mui/icons-material/MicOffSharp";
import Switch from "@mui/material/Switch";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { ExitToApp } from "@mui/icons-material";

const colors = [
    "#F0F0F0", // 빨간색
    "#33A7FF", // 파란색
    "#9A33FF", // 보라색
    "#FF33E4", // 분홍색
    "#33FFC4", // 청록색
    "#336DFF", // 하늘색
    "#FF33A9", // 자홍색
    "#33FF49", // 녹색
    "#FF8C33", // 적갈색
    "#9AFF33", // 연두색
];

function TopBar({
    onExportClick,
    sessionId,
    leaveSession,
    toggleAudio,
    audioEnabled,
    userList,
    userName,
}) {
    // userName과 일치하는 아바타를 찾아서 따로 저장합니다.
    const userAvatar = userList.find((user) => user === userName);
    // userAvatar를 userList에서 제거합니다.
    const updatedUserList = userList.filter((user) => user !== userName);

    const getCurrentTime = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset() + 9 * 60; // Add the offset for Korea Standard Time (UTC+9)
        const kstDate = new Date(date.getTime() + offset * 60 * 1000);
        const hours = kstDate.getHours();
        const minutes = kstDate.getMinutes();
        const seconds = kstDate.getSeconds();
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const [currentTime, setCurrentTime] = useState(getCurrentTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1 }}>
            <AppBar position="static" style={{ backgroundColor: "#FBEEAC", marginBottom: "10px" }}>
                <Toolbar className="top-bar-container">
                    <div className="topbar-menu">
                        <p className="code">#{sessionId}</p>
                    </div>
                    <div style={{ margin: "0 10px" }}></div>
                    <div className="avatar-group-container" style={{ display: "flex", gap: "8px" }}>
                        {/* 맨 앞에 userName과 일치하는 아바타를 출력합니다. */}
                        {userAvatar && (
                            <Chip
                                key={userAvatar}
                                avatar={
                                    <Avatar
                                        sx={{
                                            bgcolor: colors[0],
                                            color: "#fff",
                                        }}
                                        alt={userAvatar}
                                    />
                                }
                                label={userAvatar}
                                sx={{
                                    border: `1px solid white`, // Add orange border to the entire Chip
                                    borderRadius: "15px", // Rounded border for the entire Chip
                                }}
                            />
                        )}
                        {/* 나머지 아바타들을 출력합니다. */}
                        {updatedUserList.map((user, index) => (
                            <Chip
                                key={user}
                                avatar={
                                    <Avatar
                                        sx={{ bgcolor: colors[index + 1], color: "#fff" }}
                                        alt={user}
                                    />
                                }
                                label={user}
                            />
                        ))}
                    </div>
                    <div className="button-container">
                        <div className="clock-container">
                            <p>{currentTime}</p>
                        </div>
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
