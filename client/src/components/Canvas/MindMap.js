import Graph from "react-graph-vis";
import React, { useState } from "react";
import ReactDOM from "react-dom";

const options = {
  layout: {
    hierarchical: false,
  },
  nodes: {
    shape: "circle",
    size: 30,
    mass: 0,
    color: "#FBD85D",
  },
  edges: {
    arrows: {
      to: {
        enabled: false,
      },
    },
    color: "#000000",
  },
  configure: {
    enable: true,
  },
};

const MindMap = () => {
  const createNode = (x, y) => {
    setState(({ graph: { nodes, edges }, counter, ...rest }) => {
      const id = counter + 1;
      const from = Math.floor(Math.random() * (counter - 1)) + 1;
      return {
        graph: {
          nodes: [...nodes, { id, label: `Node ${id}`, x, y }],
          edges: [...edges, { from, to: id }],
        },
        counter: id,
        ...rest,
      };
    });
  };

  const handleContextMenu = ({ event }) => {
    event.preventDefault();
    // Show dropdown menu or perform desired action
    console.log("Right click!");
  };

  const handleDoubleClick = (event) => {
    if (event.nodes.length > 0) {
      const selectedNodeId = event.nodes[0];
      const newLabel = prompt("새로운 노드 이름을 입력하세요");
      modifyNode(selectedNodeId, newLabel);
    }
  };

  const modifyNode = (nodeId, newLabel) => {
    setState((prevState) => {
      const updatedNodes = prevState.graph.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, label: newLabel };
        }
        return node;
      });

      return {
        ...prevState,
        graph: {
          ...prevState.graph,
          nodes: updatedNodes,
        },
      };
    });
  };

  const [state, setState] = useState({
    counter: 5,
    graph: {
      nodes: [
        { id: 1, label: "Node 1" },
        { id: 2, label: "Node 2" },
      ],
      edges: [{ from: 1, to: 2 }],
    },
    events: {
      select: ({ nodes, edges }) => {
        console.log("Selected nodes:");
        console.log(nodes);
        console.log("Selected edges:");
        console.log(edges);
        // alert("Selected node: " + nodes);
      },
      doubleClick: handleDoubleClick,
      oncontext: handleContextMenu,
    },
  });
  const { graph, events } = state;
  return (
    <div>
      <Graph graph={graph} options={options} events={events} style={{ height: "100vh" }} />
    </div>
  );
};

export default MindMap;
