import React from "react";
import "./ToolBar.css";

const ToolBar = () => {
    const makeNode = () => {
        window.dispatchEvent(new CustomEvent("addNode"));
    };
    const makeText = () => {
        window.dispatchEvent(new CustomEvent("addText"));
    };
    const makeImage = () => {
        window.dispatchEvent(new CustomEvent("addImage"));
    };
    const switchMemo = () => {
        window.dispatchEvent(new CustomEvent("switchMemo"));
    };
    const makeComment = () => {
        console.log("make Comment");
    };
    const makeTimre = () => {
        console.log("make Timer");
    };

    return (
        <div className="toolbar">
            <button className="create-node button_toolbar" onClick={makeNode}></button>
            <button className="create-text button_toolbar" onClick={makeText}></button>
            <button className="create-image button_toolbar" onClick={makeImage}></button>
            <button className="create-memo button_toolbar" onClick={switchMemo}></button>
            {/* <button className="create-comment button_toolbar" onClick={makeComment}></button> */}
            {/* <button className="create-timer button_toolbar" onClick={makeTimre}></button> */}
        </div>
    );
};

export default ToolBar;
