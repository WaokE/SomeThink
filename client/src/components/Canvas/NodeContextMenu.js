import React from "react";

import "./NodeContextMenu.css";

const NodeContextMenu = ({ xPos, yPos, selectedNodeId, onClose, deleteNode }) => {
    const handleDeleteNode = () => {
        if (selectedNodeId != 1) {
            deleteNode(selectedNodeId);
        } else {
            alert("루트 노드는 삭제할 수 없습니다!");
        }
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
