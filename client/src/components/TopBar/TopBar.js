import React, { useState, useEffect } from "react";
import clipboardCopy from "clipboard-copy";
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
import { rootNode } from "../../Constant";
import { useNavigate, useLocation } from "react-router-dom";

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
    sessionId,
    leaveSession,
    toggleAudio,
    audioEnabled,
    userList,
    userName,
    speakingUserName,
    ymapRef,
    isLoading,
    setInfoMessage,
    setIsInfoMessageVisible,
}) {
    // userName과 일치하는 아바타를 찾아서 따로 저장합니다.
    const userAvatar = userList.find((user) => user === userName);

    const location = useLocation();
    const { keyword } = location.state || {}; // location.state가 null일 경우를 대비하여 기본 객체를 생성

    const updatedRootNode = { ...rootNode, label: keyword };

    const navigate = useNavigate();
    const handleLeaveSession = () => {
        leaveSession();
        navigate("/");
    };

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

    const handleRoomCodeClick = () => {
        clipboardCopy(sessionId)
            .then(() => {
                setInfoMessage("방 코드가 복사되었습니다.");
                setIsInfoMessageVisible(true);
            })
            .catch((err) => {
                setInfoMessage("복사 중 에러가 발생했습니다.", err);
                setIsInfoMessageVisible(true);
            });
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (userList.length >= prevUserListLength) {
            if (!isLoading && userList.length === 1) {
                ymapRef.current.set(`Node 1`, JSON.stringify(updatedRootNode));
                ymapRef.current.set("RootQuadrant", 0);
                ymapRef.current.set("GroupCount", 0);
                ymapRef.current.set(userName, true);
            }
        }
        if (userList.length > prevUserListLength) {
            const audio = new Audio("enter.mp3");
            audio.play();
        } else if (userList.length < prevUserListLength) {
            const audio = new Audio("leave.mp3");
            audio.volume = 0.5;
            audio.play();
        }
        setPrevUserListLength(userList.length);
    }, [userList.length, isLoading]);

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1 }}>
            <AppBar
                position="static"
                style={{
                    backgroundColor: "#FBEEAC",
                    marginBottom: "10px",
                    height: "9vh",
                    justifyContent: "center",
                }}
            >
                <Toolbar className="top-bar-container">
                    <div className="topbar-menu">
                        <p
                            className="code"
                            onClick={handleRoomCodeClick}
                            style={{ cursor: "pointer" }}
                        >
                            #{sessionId}
                        </p>
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
                                    padding: "8px",
                                    height: "36px",
                                    fontSize: "18px",
                                    boxShadow: speakingUserName.includes(userName)
                                        ? `inset 0px 0px 0px 4px #76e465`
                                        : `inset 0px 0px 0px 1px white`,
                                    borderRadius: "23px", // Rounded border for the entire Chip
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
                                        sx={{
                                            padding: "8px",
                                            height: "36px",
                                            fontSize: "18px",
                                            boxShadow:
                                                // if user in speakingUserName list

                                                speakingUserName.includes(user)
                                                    ? `inset 0px 0px 0px 4px #76e465`
                                                    : ``,
                                            borderRadius: speakingUserName.includes(user)
                                                ? "23px"
                                                : "", // Rounded border for the entire Chip
                                        }}
                                    />
                                )
                        )}
                    </div>
                    <div className="button-container">
                        <div className="clock-container">
                            <p>{currentTime}</p>
                        </div>
                        {audioEnabled ? (
                            <MicSharpIcon sx={{ color: "gray" }} />
                        ) : (
                            <MicOffSharpIcon sx={{ color: "gray" }} />
                        )}
                        <Switch
                            checked={audioEnabled}
                            onChange={toggleAudio}
                            inputProps={{ "aria-label": "controlled" }}
                        />
                        {/* <IconButton aria-label="CameraAltIcon" size="large" onClick={onExportClick}>
                            <CameraAltIcon fontSize="inherit" />
                        </IconButton> */}
                        <IconButton
                            aria-label="ExitToApp"
                            size="large"
                            onClick={handleLeaveSession}
                        >
                            <ExitToApp fontSize="inherit" />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default TopBar;
