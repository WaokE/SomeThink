import React, { useState, useEffect } from "react";
import "./TopBar.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MicSharpIcon from "@mui/icons-material/MicSharp";
import MicOffSharpIcon from "@mui/icons-material/MicOffSharp";
import Switch from "@mui/material/Switch";
import { ExitToApp } from "@mui/icons-material";

const colors = [
    "#FF5733", // 빨간색
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
    const [prevUserListLength, setPrevUserListLength] = useState(userList.length);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (userList.length > prevUserListLength) {
            const audio = new Audio("enter.mp3");
            audio.play();
        } else if (userList.length < prevUserListLength) {
            const audio = new Audio("leave.mp3");
            audio.play();
        }
        setPrevUserListLength(userList.length);
    }, [userList.length, prevUserListLength]);

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
                                            bgcolor: "#F0F0F0",
                                            color: "#fff",
                                        }}
                                        alt={userAvatar}
                                    />
                                }
                                label={userAvatar}
                                sx={{
                                    border: `1px solid white`, // White border around the avatar
                                    borderRadius: "15px", // Rounded border for the entire Chip
                                }}
                            />
                        )}
                        {/* 나머지 아바타들을 출력합니다. */}
                        {userList.map(
                            (user, index) =>
                                // Check if the user's username is not "username"
                                user !== userName && (
                                    <Chip
                                        key={user}
                                        avatar={
                                            <Avatar
                                                sx={{ bgcolor: colors[index], color: "#fff" }}
                                                alt={user}
                                            />
                                        }
                                        label={user}
                                    />
                                )
                        )}
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
                        {/* <IconButton aria-label="CameraAltIcon" size="large" onClick={onExportClick}>
                            <CameraAltIcon fontSize="inherit" />
                        </IconButton> */}
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
