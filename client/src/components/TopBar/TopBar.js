import "./TopBar.css";
import { useState } from "react";

function TopBar({ onExportClick }) {
    return (
        <div className="topbar-background">
            <div className="code">#CODE</div>
            <div className="topbar-menu">
                <div className="member-info">
                    <button className="person button"></button>
                </div>
                <h1 className="count">3</h1>
                <div className="export-btn">
                    <button onClick={onExportClick} className="export-button">
                        EXPORT
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
