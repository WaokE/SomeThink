import React, { useEffect, useState } from "react";
import Canvas from "./components/Canvas/Canvas";
import TopBar from "./components/TopBar/TopBar";
import ToolBar from "./components/ToolBar/ToolBar";

function App() {
  return (
    <div>
      <TopBar />
      <div>
        <ToolBar />
        <Canvas />
      </div>
    </div>
  );
}

export default App;
