import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";

const styles = {
    bottomNav: {
        width: "400px", // 너비 조정
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
};

export default function LowToolBar(props) {
    const makeNode = () => {
        props.NodeButton(props.selectedNode);
    };
    const makeText = () => {
        window.dispatchEvent(new CustomEvent("addText"));
    };
    const makeImage = () => {
        if (!props.ImageMenuState) props.ImageButton(true);
        else props.ImageButton(false);
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

    return (
        <BottomNavigation sx={styles.bottomNav}>
            <BottomNavigationAction
                value="recents"
                icon={<AddCircleIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={makeNode}
            />
            <BottomNavigationAction
                value="nearby"
                icon={<EditNoteRoundedIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={makeText}
            />
            <BottomNavigationAction
                value="image"
                icon={<AddPhotoAlternateIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={makeImage}
            />
            <BottomNavigationAction
                value="memo"
                icon={<ContentPasteRoundedIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={switchMemo}
            />
            <BottomNavigationAction
                value="focus"
                icon={<CenterFocusStrongIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={focusMindMap}
            />
            <BottomNavigationAction
                value="timer"
                icon={<AccessAlarmRoundedIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={setTimer}
            />
            <BottomNavigationAction
                value="reset"
                icon={<DeleteForeverRoundedIcon sx={{ fontSize: "20px" }} />}
                sx={styles.action}
                onClick={resetNode}
            />
        </BottomNavigation>
    );
}
