import React from "react";
import "./MemoNode.css";

const Memo = ({ memo, handleMemoChange }) => {
    return <textarea className="memo" value={memo} onChange={handleMemoChange} />;
};

export default Memo;
