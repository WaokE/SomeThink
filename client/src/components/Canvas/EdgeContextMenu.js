import "./ContextMenu.css";

const EdgeContextMenu = ({ selectedEdge, deleteEdge, onClose }) => {
    const handleDeleteEdge = () => {
        deleteEdge(selectedEdge);
        onClose();
    };
    return (
        <ul>
            <li onClick={handleDeleteEdge}>엣지 제거</li>
        </ul>
    );
};

export default EdgeContextMenu;
