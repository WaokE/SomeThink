import React from "react";
import "./ToolBar.css"

const ToolBar = () => {

  const makeNode = () => {
    console.log("make node");
    window.dispatchEvent(new CustomEvent('addNode', { detail: { x: 0, y: 0, selectedNodeId: 1 }}));
  };
  const makeText = () => {
    console.log("make Text");
  };
  const makeImage = () => {
    console.log("make Image");
  };
  const makePostit = () => {
    console.log("make Postit");
  };
  const makeComment = () => {
    console.log("make Comment");
  };
  const makeTimre = () => {
    console.log("make Timer");
  };

  return (
    <div className="toolbar">
      <button className="create-node button"  onClick={makeNode}></button>
      <button className="create-text button" onClick={makeText}></button>
      <button className="create-image button" onClick={makeImage}></button>
      <button className="create-memo button" onClick={makePostit}></button>
      <button className="create-comment button" onClick={makeComment}></button>
      <button className="create-timer button" onClick={makeTimre}></button>
    </div>
  );
}

export default ToolBar;
