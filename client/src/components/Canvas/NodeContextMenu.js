import React, { useState } from "react";

import "./ContextMenu.css";

const NodeContextMenu = ({
    selectedNodeId,
    selectedNode,
    onClose,
    deleteNode,
    createNode,
    setIsCreatingText,
    setIsCreatingEdge,
    setFromNode,
    handleNodeSelect,
}) => {
    const handleDeleteNode = () => {
        deleteNode(selectedNodeId);
        onClose();
    };
    const handleAddChildNode = () => {
        createNode(selectedNodeId);
        onClose();
    };
    const handleAddTextNode = () => {
        setIsCreatingText(true);
        onClose();
    };

    const handleairecommend = () => {
        handleNodeSelect({ nodes: [selectedNodeId] });
        onClose();
    };

    const handleAddEdge = () => {
        setIsCreatingEdge(true);
        setFromNode(selectedNode);
        onClose();
    };

    return (
        <ul>
            <li onClick={handleAddChildNode}>자식 노드 추가</li>
            <li onClick={handleDeleteNode}>노드 제거</li>
            <li onClick={handleAddEdge}>엣지 추가</li>
            <li onClick={handleAddTextNode}>텍스트 추가</li>
            <li onClick={handleairecommend}>ai 추천 노드</li>
        </ul>
    );
};

export default NodeContextMenu;
