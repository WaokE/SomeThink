import React, { useRef } from "react";
import Canvas from "./components/Canvas/Canvas";
import TopBar from "./components/TopBar/TopBar";
import ToolBar from "./components/ToolBar/ToolBar";
import html2canvas from "html2canvas";
import fileDownload from "js-file-download";

function App() {
    const captureRef = useRef(null);

    const handleExportClick = () => {
        if (captureRef.current) {
            html2canvas(captureRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    fileDownload(blob, "screenshot.png");
                });
            });
        }
    };

    return (
        <div>
            <TopBar onExportClick={handleExportClick} />
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
                <ToolBar />
                <Canvas ref={captureRef} />
            </div>
        </div>
    );
}

export default App;
