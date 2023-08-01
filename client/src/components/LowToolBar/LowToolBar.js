import * as React from "react";
import { handleUndo, handleRedo } from "../Canvas/EventHandler";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import Tooltip from "@mui/material/Tooltip";

import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";

const styles = {
    bottomNav: {
        width: "520px", // 너비 조정
        height: "50px", // 높이 조정
        borderRadius: "100px", // 라운드를 위한 값
        border: "2px solid #d9d9d9", // 테두리 설정
        position: "fixed",
        bottom: "40px", // 하단 간격 조정
        left: "50%",
        transform: "translateX(-50%)", // 가운데 정렬
        padding: "0px 20px", // 좌우 간격 조정
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
        fontSize: "20px",
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
    const makeImage = () => {
        if (!props.isImageSearchVisible) props.setIsImageSearchVisible(true);
        else props.setIsImageSearchVisible(false);
    };
    const switchMemo = () => {
        window.dispatchEvent(new CustomEvent("switchMemo"));
    };
    const setTimer = () => {
        window.dispatchEvent(new CustomEvent("setTimer"));
    };
    const focusMindMap = () => {
        props.FocusButton();
    };
    const resetNode = () => {
        window.dispatchEvent(new CustomEvent("resetNode"));
    };

    const hendleExportClick = () => {
        props.onExportClick();
    };

    const makeMarkdown = () => {
        window.dispatchEvent(new CustomEvent("makeMarkdown"));
    };

    const openMarkdown = () => {
        if (!props.isMarkdownVisible) props.setIsMarkdownVisible(true);
        else props.setIsMarkdownVisible(false);
        console.log("openMarkdown", props.isMarkdownVisible);
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

    const actions = [
        { icon: <CameraAltIcon />, name: "Capture Canvas", onclick: hendleExportClick },
        { icon: <SaveIcon />, name: "Save Markdown", onclick: makeMarkdown },
        { icon: <FormatListBulletedSharpIcon />, name: "Open Markdown", onclick: openMarkdown },
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
                <Tooltip title="이미지 생성" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="image"
                        icon={<AddPhotoAlternateIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={makeImage}
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
                <Tooltip title="포커스" placement="top" sx={styles.tooltip}>
                    <BottomNavigationAction
                        value="focus"
                        icon={<CenterFocusStrongIcon sx={styles.icon} />}
                        sx={styles.action}
                        onClick={focusMindMap}
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
        </div>
    );
}
