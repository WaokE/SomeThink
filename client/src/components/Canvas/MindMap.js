import Graph from "react-graph-vis";
import React, { useState } from "react";
import ReactDOM from "react-dom";

import NodeContextMenu from "./NodeContextMenu";

const options = {
    layout: {
        hierarchical: false,
    },
    nodes: {
        shape: "circle",
        size: 30,
        mass: 1,
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
        enabled: true,
    },
};

const MindMap = () => {
    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);

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

    const handleNodeContextMenu = ({ event, nodes }) => {
        event.preventDefault();
        console.log(nodes);
        if (nodes.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            setContextMenuPos({ xPos, yPos, nodeId: nodes[0] });
            setIsNodeContextMenuVisible(true);
        }
    };

    const handleDoubleClick = (event) => {
        if (event.nodes.length > 0) {
            const selectedNodeId = event.nodes[0];
            const newLabel = prompt("새로운 노드 이름을 입력하세요");
            modifyNode(selectedNodeId, newLabel);
        }
    };

    const closeContextMenu = () => {
        setIsNodeContextMenuVisible(false);
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

    const deleteNode = (nodeId) => {
        setState((prevState) => {
            const updatedNodes = prevState.graph.nodes.filter((node) => node.id !== nodeId);
            const updatedEdges = prevState.graph.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);

            return {
                ...prevState,
                graph: {
                    ...prevState.graph,
                    nodes: updatedNodes,
                    edges: updatedEdges,
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
                // console.log("Selected nodes:");
                // console.log(nodes);
                // console.log("Selected edges:");
                // console.log(edges);
                // alert("Selected node: " + nodes);
            },
            doubleClick: handleDoubleClick,
            oncontext: handleNodeContextMenu,
        },
    });
    const { graph, events } = state;
    return (
        <div>
            <Graph graph={graph} options={options} events={events} style={{ height: "100vh" }} />
            {isNodeContextMenuVisible && (
                <NodeContextMenu
                    xPos={contextMenuPos.xPos}
                    yPos={contextMenuPos.yPos}
                    selectedNodeId={contextMenuPos.nodeId}
                    onClose={closeContextMenu}
                    deleteNode={deleteNode}
                />
            )}
        </div>
    );
};

export default MindMap;
