import React, { useRef } from "react";
import MindMap from "./components/Canvas/MindMap";

function App() {
    // Apply CSS to prevent scrolling
    document.body.style.overflow = "hidden";

    return <MindMap />;
}

export default App;
