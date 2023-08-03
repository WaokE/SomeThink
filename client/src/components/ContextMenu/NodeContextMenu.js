// import "./ContextMenu.css";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ShapeLineTwoToneIcon from "@mui/icons-material/ShapeLineTwoTone";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";

const NodeContextMenu = ({
    selectedNode,
    onClose,
    deleteNode,
    createNode,
    bookMarkNode,
    setIsCreatingEdge,
    setFromNode,
    handleNodeSelect,
    setInfoMessage,
    setIsInfoMessageVisible,
}) => {
    const handleDeleteNode = () => {
        deleteNode(selectedNode);
        onClose();
    };
    const handleAddChildNode = () => {
        createNode(selectedNode);
        onClose();
    };

    const handleairecommend = () => {
        handleNodeSelect({ nodes: [selectedNode] });
        onClose();
    };

    const handleAddEdge = () => {
        setIsCreatingEdge(true);
        setFromNode(selectedNode);
        setInfoMessage("원하는 노드를 클릭하여 엣지를 연결하세요!");
        setIsInfoMessageVisible(true);
        onClose();
    };

    const handleBookMarkNode = () => {
        bookMarkNode();
        onClose();
    };

    return (
        <Paper sx={{ width: 150, maxWidth: "100%" }}>
            <MenuList>
                <MenuItem onClick={handleAddChildNode}>
                    <ListItemIcon>
                        <AddCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>노드 추가</ListItemText>
                    <Typography variant="body2" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={handleDeleteNode}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>노드 제거</ListItemText>
                    <Typography variant="body2" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={handleAddEdge}>
                    <ListItemIcon>
                        <ShapeLineTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>엣지 추가</ListItemText>
                    <Typography variant="body2" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={handleBookMarkNode}>
                    <ListItemIcon>
                        <PushPinRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>북마크 토글</ListItemText>
                    <Typography variant="body2" color="text.secondary"></Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleairecommend}>
                    <ListItemIcon>
                        <PsychologyAltOutlinedIcon fontSize="medium" />
                    </ListItemIcon>
                    <ListItemText>추천 키워드</ListItemText>
                </MenuItem>
            </MenuList>
        </Paper>
    );
};

export default NodeContextMenu;
