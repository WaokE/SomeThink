import React from 'react';
import MindMap from "./MindMap";

const Canvas = React.forwardRef((props, ref) => {
  return (
    <div ref={ref}>
      <MindMap />
    </div>
  );
});

export default Canvas;
