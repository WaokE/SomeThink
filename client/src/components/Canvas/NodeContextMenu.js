import React from "react";

import "./NodeContextMenu.css";

const NodeContextMenu = ({ xPos, yPos, selectedNodeId, onClose, deleteNode }) => {
    const handleDeleteNode = () => {
        deleteNode(selectedNodeId);
        onClose();
    };
    return (
        <div className="context-menu" style={{ top: yPos, left: xPos, position: "absolute", zIndex: 1 }} onClick={onClose}>
            <ul>
                <li>자식 노드 추가</li>
                <li onClick={handleDeleteNode}>노드 제거</li>
            </ul>
        </div>
    );
};

export default NodeContextMenu;
