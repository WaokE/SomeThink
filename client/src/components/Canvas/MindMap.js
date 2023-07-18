import Graph from "react-graph-vis";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
        // solver: "barnesHut",
        // barnesHut: {
        //     centralGravity: -0.1,
        //     springConstant: 1,
        //     damping: 0.09,
        //     avoidOverlap: 0.5,
        // },
        // maxVelocity: 5,
        // minVelocity: 0.5,
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
    const [result, setResult] = useState("");
    const [selectedNodeLabels, setSelectedNodeLabels] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const ydocRef = useRef(null);
    const ymapRef = useRef(null);

    useEffect(() => {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("ws://localhost:1234", "Test ", ydoc);
        const ymap = ydoc.getMap("MindMap");

        ymap.observe((MindMapEvent) => {
            setState((prevState) => {
                const updatedGraph = {
                    nodes: [rootNode],
                    edges: [],
                };

                ymapRef.current.forEach((value, key) => {
                    const updatedData = JSON.parse(ymap.get(key));
                    const node = updatedData.node;
                    const edge = updatedData.edge;

                    updatedGraph.nodes.push(node);
                    updatedGraph.edges.push(edge);
                });

                return {
                    ...prevState,
                    graph: updatedGraph,
                    counter: prevState.counter + 1,
                };
            });
        });

        ydocRef.current = ydoc;
        ymapRef.current = ymap;
    }, []);

    const createNode = (selectedNodeId) => {
        const selectedNode = state.graph.nodes.find((node) => node.id === selectedNodeId);

        if (!selectedNode) {
            return;
        }

        setState((prevState) => {
            ymapRef.current.set(
                `Node ${prevState.counter + 1}`,
                JSON.stringify({
                    node: {
                        id: prevState.counter + 1,
                        label: `Node ${prevState.counter + 1}`,
                        x: selectedNode.x,
                        y: selectedNode.y + 100,
                        color: "#FBD85D",
                    },
                    edge: { from: selectedNodeId, to: prevState.counter + 1 },
                })
            );

            return {
                ...prevState,
            };
        });
    };

    const handleNodeDragEnd = (event) => {
        const { nodes, pointer } = event;
        if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
            return;
        }
        console.log(event);
        const nodeId = nodes[0];
        const { x, y } = pointer.canvas;

        setState((prevState) => {
            const updatedNodes = prevState.graph.nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        x,
                        y,
                    };
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

    const handleCanvasDrag = (event) => {
        // 캔버스 드래그가 진행 중일 때 호출되는 함수
        // 캔버스가 이동되지만 좌표는 저장하지 않습니다.
    };

    const handleAddTextNode = (event) => {
        if (!isCreatingText) return;
        const { pointer } = event;
        const label = prompt("");
        if (label) {
            const newNode = {
                shape: "text",
                label: label,
                x: pointer.canvas.x,
                y: pointer.canvas.y,
                physics: false,
                font: {
                    size: 30,
                },
            };
            setState((prevState) => ({
                ...prevState,
                graph: {
                    ...prevState.graph,
                    nodes: [...prevState.graph.nodes, newNode],
                },
            }));
            setIsCreatingText(false);
        }
    };

    const handleAddImageNode = ({ imageUrl }) => {
        const newNode = {
            shape: "image",
            image: imageUrl,
            x: 0,
            y: -100,
            physics: false,
        };
        setState((prevState) => ({
            ...prevState,
            graph: {
                ...prevState.graph,
                nodes: [...prevState.graph.nodes, newNode],
            },
        }));
    };

    const handleNodeContextMenu = ({ event, nodes }) => {
        event.preventDefault();

        if (nodes.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedNodeId = nodes[0];
            setContextMenuPos({ xPos, yPos, selectedNodeId });
            setIsNodeContextMenuVisible(true);
        }
    };

    const handleDoubleClick = (event) => {
        if (event.nodes.length > 0) {
            const selectedNodeId = event.nodes[0];
            const newLabel = prompt("새로운 노드 이름을 입력하세요");
            if (newLabel === null) return;
            modifyNode(selectedNodeId, newLabel, event.pointer.canvas.x, event.pointer.canvas.y);
        }
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

    const handleClickOutside = (event) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
            setIsNodeContextMenuVisible(false);
        }
    };

    useEffect(() => {
        const handleAddNode = (event) => {
            createNode(selectedNode);
        };
        document.addEventListener("click", handleClickOutside);
        window.addEventListener("addNode", handleAddNode);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("addNode", handleAddNode);
        };
    }, [selectedNode]);

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
            counter: 1,
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
                doubleClick: handleDoubleClick,
                oncontext: handleNodeContextMenu,
            },
        };
    });

    const { graph, events } = state;
    return (
        <div>
            <div>{result}</div>
            <Graph
                graph={state.graph}
                options={options}
                events={{
                    ...state.events,
                    dragEnd: handleNodeDragEnd,
                    drag: handleCanvasDrag,
                    click: handleAddTextNode,
                    oncontext: handleNodeContextMenu,
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
