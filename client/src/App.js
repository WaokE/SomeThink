import React, { useRef } from "react";
import Canvas from "./components/Canvas/Canvas";
import MindMap from "./components/Canvas/MindMap";
import html2canvas from "html2canvas";
import fileDownload from "js-file-download";

function App() {
    const captureRef = useRef(null);

    const handleExportClick = () => {
        console.log("Export button clicked!"); // Check if this log appears in the console.
        if (captureRef.current) {
            html2canvas(captureRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    fileDownload(blob, "screenshot.png");
                });
            });
        }
    };

    // Apply CSS to prevent scrolling
    document.body.style.overflow = "hidden";

    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
                <Canvas ref={captureRef} />
                <MindMap onExportClick={handleExportClick} />
            </div>
        </div>
    );
}

export default App;
