import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

const styles = {
    bottomNav: {
        width: "400px", // 너비 조정
        height: "50px", // 높이 조정
        borderRadius: "100px", // 라운드를 위한 값
        border: "2px solid #d9d9d9", // 테두리 설정
        position: "fixed",
        bottom: "20px", // 하단 간격 조정
        left: "50%",
        transform: "translateX(-50%)", // 가운데 정렬
        padding: "0px", // 간격 조정을 위해 padding 제거
        display: "flex", // 내부 요소를 가로로 정렬
    },
    action: {
        borderRadius: "100px", // 테두리를 둥글게 만듦
        flex: "1", // 각 요소의 비율을 동일하게 설정하여 가로 간격을 줄임
    },
};

export default function LowToolBar() {
    const [value, setValue] = React.useState("recents");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <BottomNavigation sx={styles.bottomNav} value={value} onChange={handleChange}>
            <BottomNavigationAction
                value="recents"
                icon={<AddCircleIcon />}
                sx={styles.action} // BottomNavigationAction의 스타일 적용
            />
            <BottomNavigationAction
                value="nearby"
                icon={<EditNoteRoundedIcon />}
                sx={styles.action} // BottomNavigationAction의 스타일 적용
            />
            <BottomNavigationAction
                value="favorites"
                icon={<AddPhotoAlternateIcon />}
                sx={styles.action} // BottomNavigationAction의 스타일 적용
            />
            <BottomNavigationAction
                value="memo"
                icon={<ContentPasteRoundedIcon />}
                sx={styles.action} // BottomNavigationAction의 스타일 적용
            />
            <BottomNavigationAction
                value="reset"
                icon={<DeleteForeverRoundedIcon />}
                sx={styles.action} // BottomNavigationAction의 스타일 적용
            />
        </BottomNavigation>
    );
}
