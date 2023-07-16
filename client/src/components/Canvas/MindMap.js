import Graph from "react-graph-vis";
import React, { useState, useEffect, useRef } from "react";
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
    physics: {
        enabled: true,
        solver: "barnesHut",
        barnesHut: {
            centralGravity: -0.1,
            springConstant: 1,
            damping: 0.09,
            avoidOverlap: 0.5,
            maxVelocity: 5,
            minVelocity: 0.5,
        },
    },
    interaction: {
        multiselect: false,
    },
};

const MindMap = () => {
    const [graph, setGraph] = useState({
        nodes: [
            { id: 1, label: "Node 1", x: 0, y: 0 },
        ],
        edges: [],
    });

    const [selectedNode, setSelectedNode] = useState(null);
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const contextMenuRef = useRef(null);

    const state = {
        graph: graph,
        events: {
            select: ({ nodes }) => {
                if (nodes.length === 1) {
                    setSelectedNode(nodes[0]);
                    setContextMenuPos(prevState => ({
                        ...prevState,
                        selectedNodeId: nodes[0],
                    }));
                    setIsNodeContextMenuVisible(true);
                }
            },
            deselect: () => {
                setIsNodeContextMenuVisible(false);
            },
        }
    };

    const deleteNode = (nodeId) => {
        setGraph(prevGraph => ({
            nodes: prevGraph.nodes.filter(node => node.id !== nodeId),
            edges: prevGraph.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId),
        }));
    };

    const createNode = (x, y) => {
        if (selectedNode != null) {
            setGraph(prevGraph => {
                const newNodeId = prevGraph.nodes.length ? Math.max(...prevGraph.nodes.map(node => node.id)) + 1 : 1;
                return {
                    nodes: [...prevGraph.nodes, { id: newNodeId, label: `Node ${newNodeId}`, x: x, y: y }],
                    edges: [...prevGraph.edges, { from: selectedNode, to: newNodeId }],
                };
            });
        }
    };

    const closeContextMenu = () => {
        setIsNodeContextMenuVisible(false);
    };

    useEffect(() => {
        const handleAddNode = (event) => {
            createNode(event.detail.x, event.detail.y);
        };

        window.addEventListener('addNode', handleAddNode);

        return () => {
            window.removeEventListener('addNode', handleAddNode);
        };
    }, [selectedNode]);

    return (
        <div>
            <Graph
                graph={state.graph}
                options={options}
                events={state.events}
                style={{ height: "100vh" }}
            />
            {isNodeContextMenuVisible && (
                <div
                    ref={contextMenuRef}
                    className="context-menu"
                    style={{
                        position: "absolute",
                        left: contextMenuPos.xPos,
                        top: contextMenuPos.yPos,
                    }}
                >
                    <NodeContextMenu
                        xPos={contextMenuPos.xPos}
                        yPos={contextMenuPos.yPos}
                        selectedNodeId={contextMenuPos.selectedNodeId}
                        onClose={closeContextMenu}
                        deleteNode={deleteNode}
                        createNode={createNode}
                    />
                </div>
            )}
        </div>
    );
};

export default MindMap;
