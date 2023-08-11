import React, { useState, key, useEffect } from "react";
import { handleUndo, handleRedo } from "../Canvas/EventHandler";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import Tooltip from "@mui/material/Tooltip";

import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import { Upload } from "@mui/icons-material";

import FileUploader from "../Canvas/SnapshotUpload";

const styles = {
    bottomNav: {
        width: "50%", // 너비 조정
        height: "7%", // 높이 조정
        borderRadius: "100px", // 라운드를 위한 값
        border: "2px solid #d9d9d9", // 테두리 설정
        position: "fixed",
        bottom: "7%", // 하단 간격 조정
        left: "50%",
        transform: "translateX(-50%)", // 가운데 정렬
        padding: "0% 0.9%", // 좌우 간격 조정
        zIndex: "10",
    },
    action: {
        borderRadius: "100px", // 테두리를 둥글게 만듦
        flex: "1", // 각 요소의 비율을 동일하게 설정하여 가로 간격을 줄임
        margin: "0px -10px", // 버튼간의 간격을 추가하여 침범하지 않도록 함
    },
    tooltip: {
        position: "absolute",
    },
    icon: {
        fontSize: "250%",
        "&:hover": { color: "#FFE17B" },
    },
};

export default function LowToolBar(props) {
    const makeNode = () => {
        props.NodeButton(props.selectedNode);
    };
    const makeText = () => {
        props.TextButton();
    };
    const switchMemo = () => {
        window.dispatchEvent(new CustomEvent("switchMemo"));
    };
    const setTimer = () => {
        window.dispatchEvent(new CustomEvent("setTimer"));
    };
    const focusMindMap = () => {
        props.FocusButton(0, 0);
    };
    const resetNode = () => {
        window.dispatchEvent(new CustomEvent("resetNode"));
    };

    const hendleExportClick = () => {
        props.onExportClick();
    };

    const downloadSnapshot = () => {
        window.dispatchEvent(new CustomEvent("downloadSnapshot"));
    };

    const openMarkdown = () => {
        if (!props.isMarkdownVisible) props.setIsMarkdownVisible(true);
        else props.setIsMarkdownVisible(false);
    };

    const undoAction = () => {
        handleUndo(
            props.setAlertMessage,
            props.setIsAlertMessageVisible,
            props.userActionStack,
            props.setUserActionStack,
            props.userActionStackPointer,
            props.setUserActionStackPointer,
            props.setMindMap,
            props.setMemo,
            props.setMouseCoordinates,
            props.ymapRef
        );
    };

    const redoAction = () => {
        handleRedo(
            props.setAlertMessage,
            props.setIsAlertMessageVisible,
            props.userActionStack,
            props.setUserActionStack,
            props.userActionStackPointer,
            props.setUserActionStackPointer,
            props.ymapRef
        );
    };

    const [isUploading, setIsUploading] = useState(false);
    let timerId = null;

    const handleUploadSnapshotClick = () => {
        setIsUploading(false);
        setTimeout(() => setIsUploading(true), 0);

        timerId = setTimeout(() => {
            if (isUploading) {
                setIsUploading(false);
            }
        }, 50);
    };

    const uploadNdoes = (content) => {
        let node;
        if (content.shape === "image") {
            node = {
                id: content.id,
                label: content.label,
                x: content.x,
                y: content.y,
                shape: content.shape,
                image: content.image,
                size: content.size,
            };
        } else if (content.shape === "text") {
            node = {
                id: content.id,
                label: content.label,
                x: content.x,
                y: content.y,
                shape: content.shape,
                font: { size: 20 },
                shadow: {
                    enabled: false,
                },
                widthConstraint: false,
            };
        } else {
            node = {
                id: content.id,
                label: content.label,
                x: content.x,
                y: content.y,
                color: content.color,
                group: content.group,
                bookMarked: content.bookMarked,
                widthConstraint: { minimum: 50, maximum: 100 },
                heightConstraint: { minimum: 50, maximum: 100 },
            };
        }

        if (content.id === 1) {
            node = {
                id: 1,
                label: content.label,
                x: 0,
                y: 0,
                physics: false,
                fixed: true,
                color: "#f5b252",
                widthConstraint: { minimum: 100, maximum: 200 },
                heightConstraint: { minimum: 100, maximum: 200 },
                font: { size: 30 },
            };
        }
        props.ymapRef.current.set(`Node ${content.id}`, JSON.stringify(node));
    };

    const uploadEdges = (content) => {
        props.ymapRef.current.set(
            `Edge ${content.from} to ${content.to}`,
            JSON.stringify({
                from: content.from,
                to: content.to,
                id: `${content.from} to ${content.to}`,
            })
        );
    };

    const handleUploadDone = (content, ymapRef) => {
        const dataArray = content.split("\n");
        let isNodeUploading = true;

        dataArray.forEach((line) => {
            if (line.includes('"nodes"')) {
                isNodeUploading = true;
            } else if (line.includes('"edges"')) {
                isNodeUploading = false;
            } else {
                const data = JSON.parse(line);
                if (isNodeUploading) {
                    uploadNdoes(data);
                } else {
                    uploadEdges(data);
                }
            }
        });
        setIsUploading(false);
        let prevGroupCount = 0;
        ymapRef.current.forEach((value, key) => {
            const data = JSON.parse(value);
            if (data.group !== undefined && data.group > prevGroupCount) {
                prevGroupCount = data.group;
            }
        });
        console.log(`Max = ${prevGroupCount}`);
        ymapRef.current.set("GroupCount", prevGroupCount + 1);
    };

    const handleUploadCancelled = () => {
        console.log("upload cancelled");
        setIsUploading(false);
    };

    const actions = [
        { icon: <CameraAltIcon />, name: "화면 캡처", onclick: hendleExportClick },
        { icon: <SaveIcon />, name: "마인드맵 저장", onclick: downloadSnapshot },
        { icon: <Upload />, name: "마인드맵 불러오기", onclick: handleUploadSnapshotClick },
    ];

    return (
        <div>
            <BottomNavigation sx={styles.bottomNav}>
                <Tooltip title="실행 취소" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="undo"
                        icon={<UndoRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={undoAction}
                    />
                </Tooltip>
                <Tooltip title="다시 실행" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="redo"
                        icon={<RedoRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={redoAction}
                    />
                </Tooltip>
                <Tooltip title="노드 생성" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="recents"
                        icon={<AddCircleIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={makeNode}
                    />
                </Tooltip>
                <Tooltip title="텍스트 생성" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="text"
                        icon={<EditNoteRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={makeText}
                    />
                </Tooltip>
                <Tooltip title="포커스" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="focus"
                        icon={<CenterFocusStrongIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={focusMindMap}
                    />
                </Tooltip>
                <Tooltip title="바로가기 열기" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="reset"
                        icon={<FormatListBulletedSharpIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={openMarkdown}
                    />
                </Tooltip>
                <Tooltip title="메모 토글" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="memo"
                        icon={<ContentPasteRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={switchMemo}
                    />
                </Tooltip>
                <Tooltip title="타이머 토글" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="timer"
                        icon={<AccessAlarmRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={setTimer}
                    />
                </Tooltip>
                <Tooltip title="초기화" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="reset"
                        icon={<DeleteForeverRoundedIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={resetNode}
                    />
                </Tooltip>
            </BottomNavigation>
            <SpeedDial
                ariaLabel="SpeedDial for export and save"
                sx={{ position: "absolute", bottom: 35, right: 50 }}
                icon={<SpeedDialIcon />}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onclick}
                    />
                ))}
            </SpeedDial>
            {isUploading && (
                <FileUploader
                    onUploadDone={handleUploadDone}
                    onUploadCancelled={handleUploadCancelled}
                    timerId={timerId}
                />
            )}
        </div>
    );
}
