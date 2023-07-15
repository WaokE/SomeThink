import React from "react";

import "./NodeContextMenu.css";

const NodeContextMenu = ({ xPos, yPos, onClose }) => {
  return (
    <div className="context-menu" style={{ top: yPos, left: xPos, position: "absolute", zIndex: 1 }} onClick={onClose}>
      <ul>
        <li>자식 노드 추가</li>
        <li>노드 제거</li>
      </ul>
    </div>
  );
};

export default NodeContextMenu;
