import "./ContextMenu.css";

const NodeContextMenu = ({
    selectedNode,
    onClose,
    deleteNode,
    createNode,
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

    return (
        <ul>
            <li onClick={handleAddChildNode}>자식 노드 추가</li>
            <li onClick={handleDeleteNode}>노드 제거</li>
            <li onClick={handleAddEdge}>엣지 추가</li>
            <li onClick={handleairecommend}>ai 추천 노드</li>
        </ul>
    );
};

export default NodeContextMenu;
