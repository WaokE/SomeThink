const TextContextMenu = ({ selectedText, onClose, deleteNode }) => {
    const handleDeleteNode = () => {
        deleteNode(selectedText);
        onClose();
    };

    return (
        <ul>
            <li onClick={handleDeleteNode}>텍스트 제거</li>
        </ul>
    );
};

export default TextContextMenu;
