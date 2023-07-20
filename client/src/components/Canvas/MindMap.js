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
    handleNodeDragging,
} from "./eventHandler";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import NodeContextMenu from "./NodeContextMenu";
import EdgeContextMenu from "./EdgeContextMenu";

import "./MindMap.css";

const PreventRefresh = () => {
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = ""; // 이 줄은 최신 버전의 Chrome에서 필요합니다.
        };

        const handleUnload = () => {
            // 페이지를 떠날 때 처리할 작업을 여기에 추가합니다.
            // 예를 들어, 변경된 데이터를 저장하거나 서버에 업데이트를 요청하는 등의 작업을 수행할 수 있습니다.
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("unload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("unload", handleUnload);
        };
    }, []);

    return <></>;
};

const isCyclic = (graph, fromNode, toNode) => {
    const insertEdge = `Edge ${fromNode} to ${toNode}`;
    graph.push(insertEdge);
    const visited = new Set();
    let dfsq = ["1"];
    while (dfsq.length > 0) {
        const current = dfsq.shift();
        if (visited.has(current)) {
            return false;
        }
        visited.add(current);
        graph.forEach((edge) => {
            if (edge.startsWith(`Edge ${current} to `)) {
                dfsq.push(edge.split(" ")[3]);
            }
        });
    }
    return true;
};

const MindMap = () => {
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
        manipulation: {
            enabled: true,
            initiallyActive: true,
            addEdge: (data, callback) => {
                const fromNode = data.from;
                const toNode = data.to;
                if (fromNode === toNode) {
                    alert("자기 자신을 가리키는 엣지는 만들 수 없습니다!");
                    return;
                }
                if (
                    ymapRef.current.has(`Edge ${fromNode} to ${toNode}`) ||
                    ymapRef.current.has(`Edge ${toNode} to ${fromNode}`)
                ) {
                    alert("이미 존재하는 엣지입니다!");
                    return;
                }
                if (
                    !isCyclic(
                        Array.from(ymapRef.current.keys()).filter((key) => key.startsWith("Edge ")),
                        fromNode,
                        toNode
                    )
                ) {
                    alert("순환 구조를 만들 수 없습니다!");
                    return;
                }

                ymapRef.current.set(
                    `Edge ${fromNode} to ${toNode}`,
                    JSON.stringify({
                        from: fromNode,
                        to: toNode,
                        id: `${fromNode} to ${toNode}`,
                    })
                );
            },
            addNode: false,
            editEdge: false,
            deleteNode: false,
            deleteEdge: false,
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

    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);
    const [isEdgeContextMenuVisible, setIsEdgeContextMenuVisible] = useState(false);
    const contextMenuRef = useRef(null);
    const [isCreatingText, setIsCreatingText] = useState(false);
    const [selectedNodeLabels, setSelectedNodeLabels] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const memoizedHandleClickOutside = useCallback(
        handleClickOutside(
            contextMenuRef,
            setIsNodeContextMenuVisible,
            setIsEdgeContextMenuVisible
        ),
        [contextMenuRef, setIsNodeContextMenuVisible]
    );
    const handleAddImageNode = (imageUrl) => handleAddImageNodeOriginal({ imageUrl, ymapRef });
    const openNodeContextMenu = handleNodeContextMenu(
        setContextMenuPos,
        setIsNodeContextMenuVisible,
        setIsEdgeContextMenuVisible
    );
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };

        // 컴포넌트가 마운트될 때와 사이즈 변경 시에 이벤트 핸들러를 등록합니다.
        window.addEventListener("resize", handleResize);

        // 컴포넌트가 언마운트될 때 이벤트 핸들러를 해제합니다.
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    const ydocRef = useRef(null);
    const ymapRef = useRef(null);

    useEffect(() => {
        ydocRef.current = new Y.Doc();
        const provider = new WebsocketProvider("wss://somethink.online", "17", ydocRef.current);
        ymapRef.current = ydocRef.current.getMap("MindMap");
        ymapRef.current.set("Node 1", JSON.stringify(rootNode));
        ymapRef.current.set("Counter", 2);

        ymapRef.current.observe((event) => {
            setSelectedNode(null);
            setSelectedNodeLabels([]);

            const updatedGraph = {
                nodes: [],
                edges: [],
            };

            ymapRef.current.forEach((value, key) => {
                if (key.startsWith("Node")) {
                    const node = JSON.parse(value);
                    updatedGraph.nodes.push(node);
                } else if (key.startsWith("Edge")) {
                    const edge = JSON.parse(value);
                    updatedGraph.edges.push(edge);
                }
            });

            setState((prevState) => ({
                ...prevState,
                graph: updatedGraph,
            }));
        });
    }, []);

    const handleReset = () => {
        if (ymapRef.current) {
            // ymap이 초기화되었을 경우에만 clear() 메서드를 호출합니다.
            ymapRef.current.clear();
            ymapRef.current.set("Node 1", JSON.stringify(rootNode));
            ymapRef.current.set("Counter", 2);
            // Re-render the MindMap component
            window.location.reload();
        }
    };

    const deleteEdge = (selectedEdge) => {
        selectedEdge.forEach((edge) => {
            const splitedEdge = edge.split(" ");
            const from = splitedEdge[0];
            const to = splitedEdge[2];
            ymapRef.current.delete(`Edge ${from} to ${to}`);
        });
        setIsEdgeContextMenuVisible(false);
    };

    const createNode = (selectedNodeId) => {
        const selectedNode = JSON.parse(ymapRef.current.get(`Node ${selectedNodeId}`));
        const nodeCount = ymapRef.current.get("Counter");

        if (!selectedNode) {
            return;
        }

        const newNode = {
            id: nodeCount,
            label: `Node ${nodeCount}`,
            x: selectedNode.x,
            y: selectedNode.y + 100,
            color: "#FBD85D",
        };

        ymapRef.current.set(`Node ${nodeCount}`, JSON.stringify(newNode));
        ymapRef.current.set(
            `Edge ${selectedNodeId} to ${nodeCount}`,
            JSON.stringify({
                from: selectedNodeId,
                to: nodeCount,
                id: `${selectedNodeId} to ${nodeCount}`,
            })
        );

        ymapRef.current.set("Counter", nodeCount + 1);
        setSelectedNode(null);
    };

    const closeNodeContextMenu = () => {
        setIsNodeContextMenuVisible(false);
    };

    const closeEdgeContextMenu = () => {
        setIsEdgeContextMenuVisible(false);
    };

    const modifyNode = (nodeId, newLabel) => {
        const node = JSON.parse(ymapRef.current.get(`Node ${nodeId}`));
        if (node) {
            node.label = newLabel;
            ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(node));
        }
    };

    useEffect(() => {
        const handleAddNode = (event) => {
            if (!selectedNode) {
                return;
            }
            createNode(selectedNode);
        };
        const __handleAddTextNode = (event) => {
            setIsCreatingText(true);
        };
        document.addEventListener("click", memoizedHandleClickOutside);
        window.addEventListener("addNode", handleAddNode);
        window.addEventListener("addText", __handleAddTextNode);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("addNode", handleAddNode);
            window.removeEventListener("addText", __handleAddTextNode);
        };
    }, [selectedNode, memoizedHandleClickOutside]);

    const deleteSingleNode = (nodeId) => {
        ymapRef.current.delete(`Node ${nodeId}`);
    };

    const deleteNodes = (nodeId) => {
        const childNodes = Array.from(ymapRef.current.keys())
            .filter((key) => key.startsWith(`Edge ${nodeId} to `))
            .map((key) => key.split(" ")[3]);

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
        const clickedNode = JSON.parse(ymapRef.current.get(`Node ${clickedNodeId}`));

        if (!clickedNode) {
            return;
        }

        const connectedNodeIds = [clickedNodeId];
        let currentNodeId = clickedNodeId;

        while (currentNodeId !== 1) {
            const parentNodeId = Array.from(ymapRef.current.keys())
                .find((key) => key.startsWith("Edge ") && key.endsWith(` to ${currentNodeId}`))
                ?.split(" ")[1];

            if (!parentNodeId) {
                break;
            }

            connectedNodeIds.push(parentNodeId);
            currentNodeId = parentNodeId;
        }

        const rootLabel = ymapRef.current.get("Node 1")
            ? JSON.parse(ymapRef.current.get("Node 1"))?.label
            : null;

        const connectedNodeLabels = connectedNodeIds.map((nodeId) => {
            const node = JSON.parse(ymapRef.current.get(`Node ${nodeId}`));
            return node ? node.label : null;
        });

        setSelectedNodeLabels((prevLabels) => [
            clickedNode.label,
            ...connectedNodeLabels,
            rootLabel,
            ...prevLabels,
        ]);

        const allNodeLabels = Array.from(ymapRef.current.keys())
            .filter((key) => key.startsWith("Node "))
            .map((key) => {
                const node = JSON.parse(ymapRef.current.get(key));
                return node ? node.label : null;
            });

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
            const nodeCount = Number(ymapRef.current.get("Counter"));

            const newNodes = newNodeLabels.map((label, index) => {
                const nodeId = nodeCount + index++;
                const newNode = {
                    id: nodeId,
                    label: label.trim(),
                    x: clickedNode.x + 100 * (index + 1),
                    y: clickedNode.y + 100,
                    physics: false,
                    color: "#FBD85D",
                };

                ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));
                return newNode;
            });

            const newEdges = newNodes.map((node) => {
                const edge = {
                    from: clickedNodeId,
                    to: node.id,
                    id: `${clickedNodeId} to ${node.id}`,
                };
                const edgeKey = `Edge ${clickedNodeId} to ${node.id}`;
                ymapRef.current.set(edgeKey, JSON.stringify(edge));

                return edge;
            });

            ymapRef.current.set("Counter", nodeCount + newNodeLabels.length);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const [state, setState] = useState(() => {
        return {
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
                doubleClick: (events) => handleDoubleClick(events, ymapRef, modifyNode),
                oncontext: openNodeContextMenu,
            },
        };
    });

    const { graph, events } = state;
    return (
        <div>
            <button onClick={handleReset}>리셋 MindMap</button>
            <PreventRefresh />
            <h2 id="eventSpanHeading"></h2>
            <pre id="eventSpanContent"></pre>
            <Graph
                graph={state.graph}
                options={options}
                events={{
                    ...state.events,
                    dragging: (events) => handleNodeDragging(events, ymapRef),
                    dragEnd: (events) => handleNodeDragEnd(events, ymapRef),
                    drag: handleCanvasDrag,
                    click: (events) =>
                        handleAddTextNode(
                            events,
                            isCreatingText,
                            ymapRef,
                            setState,
                            setSelectedNode,
                            setIsCreatingText
                        ),
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
                        onClose={closeNodeContextMenu}
                        deleteNode={deleteNodes}
                        createNode={createNode}
                        setIsCreatingText={setIsCreatingText}
                        handleAddImageNode={handleAddImageNode}
                        handleNodeSelect={handleNodeSelect}
                    />
                </div>
            )}
            {isEdgeContextMenuVisible && (
                <div
                    ref={contextMenuRef}
                    className="context-menu"
                    style={{
                        position: "absolute",
                        left: contextMenuPos.xPos,
                        top: contextMenuPos.yPos,
                    }}
                >
                    <EdgeContextMenu
                        selectedEdge={contextMenuPos.selectedEdge}
                        onClose={closeEdgeContextMenu}
                        deleteEdge={deleteEdge}
                    />
                </div>
            )}
        </div>
    );
};

export default MindMap;
