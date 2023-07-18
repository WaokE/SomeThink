import Graph from "react-graph-vis";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
    handleDoubleClick,
    handleNodeDragEnd,
    handleClickOutside,
    handleCanvasDrag,
    handleAddTextNode,
    handleAddImageNode as handleAddImageNodeOriginal,
    handleNodeContextMenu,
} from "./eventHandler";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

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
        enabled: false,
    },
    interaction: {
        multiselect: false,
    },
};

const rootNode = {
    id: 1,
    label: "Root",
    x: 0,
    y: 0,
    physics: false,
    fixed: true,
    color: "#f5b252",
};

const MindMap = () => {
    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);
    const contextMenuRef = useRef(null);
    const [isCreatingText, setIsCreatingText] = useState(false);
    const [selectedNodeLabels, setSelectedNodeLabels] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const memoizedHandleClickOutside = useCallback(
        handleClickOutside(contextMenuRef, setIsNodeContextMenuVisible),
        [contextMenuRef, setIsNodeContextMenuVisible]
    );
    const handleAddImageNode = (imageUrl) => handleAddImageNodeOriginal({ imageUrl, setState });
    const openNodeContextMenu = handleNodeContextMenu(
        setContextMenuPos,
        setIsNodeContextMenuVisible
    );

    const ydocRef = useRef(null);
    const ymapRef = useRef(null);

    useEffect(() => {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("ws://localhost:1234", "Te", ydoc);
        const ymap = ydoc.getMap("MindMap");
        ymap.set("Node 1", JSON.stringify(rootNode));
        ymap.set("Counter", 2);

        ymap.observe((MindMapEvent) => {
            setState((prevState) => {
                const updatedGraph = {
                    nodes: [],
                    edges: [],
                };

                ymapRef.current.forEach((value, key) => {
                    if (key.startsWith("Node")) {
                        const node = JSON.parse(value);
                        console.log(node);
                        updatedGraph.nodes.push(node);
                    } else if (key.startsWith("Edge")) {
                        const edge = JSON.parse(value);
                        console.log(edge);
                        updatedGraph.edges.push(edge);
                    }
                });

                return {
                    ...prevState,
                    graph: updatedGraph,
                };
            });
        });

        ydocRef.current = ydoc;
        ymapRef.current = ymap;
    }, []);

    const createNode = (selectedNodeId) => {
        const selectedNode = state.graph.nodes.find((node) => node.id === selectedNodeId);
        const nodeCount = ymapRef.current.get("Counter");

        if (!selectedNode) {
            return;
        }

        setState((prevState) => {
            ymapRef.current.set(
                `Node ${nodeCount}`,
                JSON.stringify({
                    id: nodeCount,
                    label: `Node ${nodeCount}`,
                    x: selectedNode.x,
                    y: selectedNode.y + 100,
                    color: "#FBD85D",
                })
            );

            ymapRef.current.set(
                `Edge ${selectedNodeId} to ${nodeCount}`,
                JSON.stringify({ from: selectedNodeId, to: nodeCount })
            );

            return prevState;
        });
        ymapRef.current.set("Counter", nodeCount + 1);
    };

    const closeContextMenu = () => {
        setIsNodeContextMenuVisible(false);
    };

    const modifyNode = (nodeId, newLabel, x, y) => {
        setState((prevState) => {
            const updatedNodes = prevState.graph.nodes.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, label: newLabel, x, y };
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

    useEffect(() => {
        const handleAddNode = (event) => {
            createNode(selectedNode);
        };
        document.addEventListener("click", memoizedHandleClickOutside);
        window.addEventListener("addNode", handleAddNode);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("addNode", handleAddNode);
        };
    }, [selectedNode, memoizedHandleClickOutside]);

    const deleteSingleNode = (nodeId) => {
        ymapRef.current.delete(`Node ${nodeId}`);
    };

    const deleteNodes = (nodeId) => {
        const childNodes = state.graph.edges
            .filter((edge) => edge.from === nodeId)
            .map((edge) => edge.to);
        childNodes.forEach((childNodeId) => {
            deleteSingleNode(childNodeId);
            deleteNodes(childNodeId);
        });
        deleteSingleNode(nodeId);
    };

    const handleNodeSelect = async ({ nodes }) => {
        if (nodes.length === 0) {
            return;
        }

        const clickedNodeId = nodes[0];
        const clickedNode = state.graph.nodes.find((node) => node.id === clickedNodeId);

        if (!clickedNode) {
            return;
        }

        const connectedNodeIds = [clickedNodeId];
        let currentNodeId = clickedNodeId;

        while (currentNodeId !== 1) {
            const parentNodeId = state.graph.edges.find((edge) => edge.to === currentNodeId)?.from;

            if (!parentNodeId) {
                break;
            }

            connectedNodeIds.push(parentNodeId);
            currentNodeId = parentNodeId;
        }

        const rootLabel = state.graph.nodes.find((node) => node.id === 1)?.label;
        const connectedNodeLabels = connectedNodeIds.map(
            (nodeId) => state.graph.nodes.find((node) => node.id === nodeId)?.label
        );

        setSelectedNodeLabels((prevLabels) => [
            clickedNode.label,
            ...connectedNodeLabels,
            rootLabel,
            ...prevLabels,
        ]);

        const allNodeLabels = state.graph.nodes.map((node) => node.label);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    connectedKeywords: connectedNodeLabels.join(", "),
                    allKeywords: allNodeLabels.join(", "),
                }),
            });

            const data = await response.json();
            if (response.status !== 200) {
                throw data.error || new Error(`Request failed with status ${response.status}`);
            }

            const newNodeLabels = data.result.split(",");
            const newNodes = newNodeLabels.map((label, index) => ({
                id: state.counter + 1 + index,
                label: label.trim(),
                x: clickedNode.x + 100 * (index + 1),
                y: clickedNode.y + 100,
                physics: false,
                color: "#FBD85D",
            }));

            const newEdges = newNodes.map((node) => ({
                from: clickedNodeId,
                to: node.id,
            }));

            setState((prevState) => ({
                ...prevState,
                counter: prevState.counter + newNodeLabels.length,
                graph: {
                    nodes: [...prevState.graph.nodes, ...newNodes],
                    edges: [...prevState.graph.edges, ...newEdges],
                },
            }));
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const [state, setState] = useState(() => {
        return {
            counter: 2,
            graph: {
                nodes: [rootNode],
                edges: [],
            },
            rootNode,
            events: {
                select: ({ nodes, edges }) => {
                    if (nodes.length === 1) {
                        setSelectedNode(nodes[0]);
                        setContextMenuPos((prevState) => ({
                            ...prevState,
                            selectedNodeId: nodes[0],
                        }));
                    }
                },
                doubleClick: (events) => handleDoubleClick(events, modifyNode),
                oncontext: openNodeContextMenu,
            },
        };
    });

    const { graph, events } = state;
    return (
        <div>
            <Graph
                graph={state.graph}
                options={options}
                events={{
                    ...state.events,
                    dragEnd: (events) => handleNodeDragEnd(events, ymapRef),
                    drag: handleCanvasDrag,
                    click: (events) =>
                        handleAddTextNode(events, isCreatingText, setState, setIsCreatingText),
                    oncontext: openNodeContextMenu,
                }}
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
                        selectedNodeId={contextMenuPos.selectedNodeId}
                        onClose={closeContextMenu}
                        deleteNode={deleteNodes}
                        createNode={createNode}
                        setIsCreatingText={setIsCreatingText}
                        handleAddImageNode={handleAddImageNode}
                        handleNodeSelect={handleNodeSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default MindMap;
