import "./TopBar.css";
import { useState } from "react";

function TopBar({ onExportClick }) {
    return (
        <div className="topbar-background">
            <div className="code">#CODE</div>
            <div className="topbar-menu">
                <div className="member-info">
                    <button>Button 1</button>
                </div>
                <div className="export-btn">
                    <button onClick={onExportClick}>EXPORT</button>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
