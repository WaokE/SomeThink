//  node ./node_modules/y-websocket/bin/server.js
import {
    colors,
    mindMapOptions,
    rootNode,
    MAX_STACK_LENGTH,
    ROOT_NODE_COLOR,
    NORMAL_NODE_COLOR,
    BOOKMARK_ICON,
    throttle,
    DECIMAL_PLACES,
} from "../../Constant";

import Graph from "react-graph-vis";
import React, { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "../TopBar/TopBar";
import html2canvas from "html2canvas";
import fileDownload from "js-file-download";
import ImageSearch from "./ImageSearch";
import { CreateTextInput } from "./TextInputComponent";
import {
    getConnectedNodeLabels,
    getAllNodeLabels,
    fetchNewNodeLabels,
    addNewNodesAndEdges,
} from "../openai/api";
import NodeLabelsPopup from "../openai/NodeLabelsPopup";

import {
    handleDoubleClick,
    handleNodeDragEnd,
    handleClickOutside,
    handleCanvasDrag,
    handleAddTextNode,
    handleNodeContextMenu,
    handleNodeDragging,
    makeHandleMemoChange,
    handleMouseWheel,
    handleNodeDragStart,
    handleUndo,
    handleRedo,
} from "./EventHandler";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import NodeContextMenu from "../ContextMenu/NodeContextMenu";
import EdgeContextMenu from "../ContextMenu/EdgeContextMenu";
import TextContextMenu from "../ContextMenu/TextContextMenu";
import LowToolBar from "../LowToolBar/LowToolBar";
import UserMouseMove from "./UserMouseMove";
import Memo from "./MemoNode";
import Timer from "./Timer";
import AlertToast from "../ToastMessage/Alert";
import InformationToast from "../ToastMessage/Information";
import GraphToMarkdown from "./MarkDown";
import { SnackbarProvider } from "notistack";
import HighLighter from "./HighLighter";

import "./MindMap.css";

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

const MindMap = ({
    sessionId,
    leaveSession,
    toggleAudio,
    audioEnabled,
    userName,
    speakingUserName,
    isLoading,
}) => {
    const ydocRef = useRef(new Y.Doc());
    const ymapRef = useRef(null);
    const networkRef = useRef(null);
    const mindMapRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState(false);

    let options = { ...mindMapOptions };

    if (!selectedImage) {
        options = {
            ...options,
            interaction: {
                ...options.interaction,
                zoomView: true,
            },
        };
    }

    const [userActionStack, setUserActionStack] = useState([]);
    const [userActionStackPointer, setUserActionStackPointer] = useState(-1);
    const [isInfoMessageVisible, setIsInfoMessageVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");
    const [isAlertMessageVisible, setIsAlertMessageVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isImageSearchVisible, setIsImageSearchVisible] = useState(false);
    const [fromNode, setFromNode] = useState(null);
    const [isCreatingEdge, setIsCreatingEdge] = useState(false);
    const [mouseCoordinates, setMouseCoordinates] = useState([]);
    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);
    const [isEdgeContextMenuVisible, setIsEdgeContextMenuVisible] = useState(false);
    const [isTextContextMenuVisible, setIsTextContextMenuVisible] = useState(false);
    const [isMarkdownVisible, setIsMarkdownVisible] = useState(false);
    const contextMenuRef = useRef(null);
    const [isCreatingText, setIsCreatingText] = useState(false);
    const [memo, setMemo] = useState("");
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [isMemoVisible, setIsMemoVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [newNodeLabels, setNewNodeLabels] = useState([]);
    const [clickedNodeId, setClickedNodeId] = useState("");
    const [connectedNodeLabels, setConnectedNodeLabels] = useState([]);
    const [allNodeLabels, setAllNodeLabels] = useState([]);
    const [highLightPos, setHighLightPos] = useState(false);

    const memoizedHandleClickOutside = useCallback(
        handleClickOutside(
            contextMenuRef,
            setIsNodeContextMenuVisible,
            setIsEdgeContextMenuVisible,
            setIsTextContextMenuVisible
        ),
        [contextMenuRef, setIsNodeContextMenuVisible]
    );

    const openNodeContextMenu = (event) => {
        const VisEvent = event;
        const DOMEvent = event.event;
        const tempUserId = userName;
        const indexOfUser = getUserListFromYMap().indexOf(tempUserId);
        const selectedNode = networkRef.current.getNodeAt(VisEvent.pointer.DOM);
        const selectedEdge = networkRef.current.getEdgeAt(VisEvent.pointer.DOM);
        DOMEvent.preventDefault();

        // 노드 위에서 우클릭 시
        if (selectedNode !== undefined) {
            networkRef.current.selectNodes([selectedNode]);
            const xPos = DOMEvent.clientX;
            const yPos = DOMEvent.clientY;
            const selectedNodeObject = JSON.parse(ymapRef.current.get(`Node ${selectedNode}`));
            const selectedNodeShape = selectedNodeObject.shape;
            if (selectedNodeShape === "text") {
                setContextMenuPos({ xPos, yPos });
                setSelectedNode(selectedNode);
                setIsTextContextMenuVisible(true);
                closeNodeContextMenu();
                closeEdgeContextMenu();
            } else {
                setContextMenuPos({ xPos, yPos });
                setSelectedNode(selectedNode);
                setIsNodeContextMenuVisible(true);
                closeEdgeContextMenu();
                closeTextContextMenu();
            }
            checkPrevSelected(tempUserId);
            ymapRef.current.set(`User ${tempUserId} selected`, `Node ${selectedNode}`);
            selectedNodeObject.borderWidth = 2;

            if (selectedNode === 1) {
                selectedNodeObject.color = {
                    border: colors[indexOfUser],
                };
            } else {
                selectedNodeObject.color = {
                    border: colors[indexOfUser],
                    background: NORMAL_NODE_COLOR,
                };
            }
            selectedNodeObject.owner = tempUserId;
            ymapRef.current.set(`Node ${selectedNode}`, JSON.stringify(selectedNodeObject));
        }
        // 엣지 위에서 우클릭 시
        else if (selectedNode === undefined && selectedEdge !== undefined) {
            const xPos = DOMEvent.clientX;
            const yPos = DOMEvent.clientY;
            setContextMenuPos({ xPos, yPos });
            setSelectedEdge(selectedEdge);
            setIsEdgeContextMenuVisible(true);
            closeNodeContextMenu();
            closeTextContextMenu();
            setSelectedNode(null);
            checkPrevSelected(tempUserId);
        } else {
            setSelectedNode(null);
            setSelectedEdge(null);
            checkPrevSelected(tempUserId);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            networkRef.current.redraw();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        // ydocRef.current = new Y.Doc();
        const storedSessionId = sessionStorage.getItem("sessionId");
        const newSessionId = storedSessionId ? storedSessionId : sessionId;
        sessionStorage.setItem("sessionId", newSessionId);
        const provider = new WebsocketProvider(
            "wss://somethink.online/room",
            newSessionId,
            ydocRef.current
        );
        // const provider = new WebsocketProvider(
        //     "ws://localhost:1234",
        //     newSessionId,
        //     ydocRef.current
        // );
        ymapRef.current = ydocRef.current.getMap("MindMap");

        ymapRef.current.observe((event) => {
            const updatedGraph = {
                nodes: [],
                edges: [],
            };

            const updatedMemo = {
                memo: "",
            };

            const Mouses = [];

            ymapRef.current.forEach((value, key) => {
                if (key.startsWith("Node")) {
                    const node = JSON.parse(value);
                    updatedGraph.nodes.push(node);
                } else if (key.startsWith("Edge")) {
                    const edge = JSON.parse(value);
                    updatedGraph.edges.push(edge);
                } else if (key === "Memo") {
                    updatedMemo.memo = value;
                } else if (key.startsWith("Mouse")) {
                    const coordinate = JSON.parse(value);
                    Mouses.push([coordinate.id, coordinate.x, coordinate.y]);
                }
            });

            setMindMap((prevState) => ({
                ...prevState,
                graph: updatedGraph,
            }));
            setMemo(updatedMemo.memo);
            setMouseCoordinates(Mouses);
        });

        const handleResetNode = () => {
            handleReset();
        };

        window.addEventListener("resetNode", handleResetNode);

        return () => {
            window.removeEventListener("resetNode", handleResetNode);
        };
    }, []);

    const handleSessionJoin = useCallback(() => {
        if (userName && ymapRef.current && !ymapRef.current.has(userName)) {
            ymapRef.current.set(userName, true);
        }
    }, [userName]);

    const handleSessionLeave = useCallback(() => {
        if (userName && ymapRef.current && ymapRef.current.has(userName)) {
            ymapRef.current.delete(userName);
        }
    }, [userName]);

    useEffect(() => {
        handleSessionJoin();
    }, [handleSessionJoin]);

    useEffect(() => {
        return () => {
            handleSessionLeave();
        };
    }, [handleSessionLeave]);

    const getUserListFromYMap = useCallback(() => {
        if (!ymapRef.current) {
            return [];
        }

        const userList = [];
        ymapRef.current.forEach((value, key) => {
            if (typeof value === "boolean" && value === true && key !== "TimerRunning") {
                // 만약 값이 true인 경우, 해당 키를 유저명으로 간주하고 userList에 추가합니다.
                userList.push(key);
            }
        });

        userList.sort();
        return userList;
    }, []);

    const handleMouseMove = throttle((e) => {
        if (networkRef.current !== null) {
            const coord = networkRef.current.DOMtoCanvas({
                x: e.clientX,
                y: e.clientY,
            });
            const nx = parseFloat(coord.x.toFixed(DECIMAL_PLACES));
            const ny = parseFloat(coord.y.toFixed(DECIMAL_PLACES));
            ymapRef.current.set(
                `Mouse ${userName}`,
                JSON.stringify({ x: nx, y: ny, id: userName })
            );
        }
    }, 10);

    const handleUserSelect = (event) => {
        const tempUserId = userName;
        const indexOfUser = getUserListFromYMap().indexOf(tempUserId);

        if (isCreatingEdge) {
            checkPrevSelected(tempUserId);
            if (event.nodes.length > 0) {
                const toNode = event.nodes[0];
                if (toNode === fromNode) {
                    setAlertMessage("자기 자신을 가리키는 엣지는 만들 수 없습니다!");
                    setIsAlertMessageVisible(true);
                    setIsCreatingEdge(false);
                    setFromNode(null);
                    return;
                }
                if (
                    ymapRef.current.has(`Edge ${fromNode} to ${toNode}`) ||
                    ymapRef.current.has(`Edge ${toNode} to ${fromNode}`)
                ) {
                    setAlertMessage("이미 존재하는 엣지입니다!");
                    setIsAlertMessageVisible(true);
                    setIsCreatingEdge(false);
                    setFromNode(null);
                    return;
                }
                if (
                    !isCyclic(
                        Array.from(ymapRef.current.keys()).filter((key) => key.startsWith("Edge ")),
                        fromNode,
                        toNode
                    )
                ) {
                    setAlertMessage("순환 구조를 가지는 엣지는 만들 수 없습니다!");
                    setIsAlertMessageVisible(true);
                    setIsCreatingEdge(false);
                    setFromNode(null);
                    return;
                }
                let createdEdge;
                if (
                    checkIsConnectedToRoot(
                        Array.from(ymapRef.current.keys()).filter((key) => key.startsWith("Edge ")),
                        toNode
                    )
                ) {
                    createEdge(toNode, fromNode);
                    createdEdge = `Edge ${toNode} to ${fromNode}`;
                } else {
                    createEdge(fromNode, toNode);
                    createdEdge = `Edge ${fromNode} to ${toNode}`;
                }
                sortEdgesCorrectly(
                    Array.from(ymapRef.current.keys()).filter((key) => key.startsWith("Edge ")),
                    createdEdge
                );
                setIsCreatingEdge(false);
                setFromNode(null);
            }
            return;
        }

        // 노드 선택시
        if (event.nodes.length > 0) {
            setSelectedNode(event.nodes[0]);
            checkPrevSelected(tempUserId);
            let selectedNode = JSON.parse(ymapRef.current.get(`Node ${event.nodes[0]}`));
            ymapRef.current.set(`User ${tempUserId} selected`, `Node ${event.nodes[0]}`);
            selectedNode.borderWidth = 2;
            if (selectedNode.id === 1) {
                selectedNode.color = {
                    border: colors[indexOfUser],
                };
            } else {
                selectedNode.color = {
                    border: colors[indexOfUser],
                    background: NORMAL_NODE_COLOR,
                };
            }
            selectedNode.owner = tempUserId;
            ymapRef.current.set(`Node ${event.nodes[0]}`, JSON.stringify(selectedNode));
        }
        // 엣지 선택시
        else if (event.edges.length > 0) {
            checkPrevSelected(tempUserId);
            setSelectedNode(null);
            setSelectedEdge(event.edges[0]);
        }
        // 선택 해제시
        else {
            setSelectedNode(null);
            setSelectedEdge(null);
            checkPrevSelected(tempUserId);
        }
    };

    // 유저가 기존에 선택했던 값이 있는지 검사
    const checkPrevSelected = (userId) => {
        const tempValue = ymapRef.current.get(`User ${userId} selected`);
        // 있다면 해당 값 원래대로 돌려놓음
        if (tempValue) {
            if (ymapRef.current.get(tempValue) === undefined) return;
            let userData = JSON.parse(ymapRef.current.get(tempValue));
            if (userData) {
                if (userData.label) {
                    userData.borderWidth = 1;
                    if (userData.id === 1) {
                        userData.color = ROOT_NODE_COLOR;
                    } else {
                        userData.color = NORMAL_NODE_COLOR;
                    }
                    ymapRef.current.set(`Node ${userData.id}`, JSON.stringify(userData));
                }
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Delete") {
            if (selectedNode) {
                deleteNodes(selectedNode);
            } else if (selectedEdge) {
                deleteEdge();
            }
        }
        if (
            ((e.key === "z" || e.key === "Z") && e.ctrlKey && e.shiftKey) ||
            ((e.key === "z" || e.key === "Z") && e.metaKey && e.shiftKey)
        ) {
            handleRedo(
                setAlertMessage,
                setIsAlertMessageVisible,
                userActionStack,
                setUserActionStack,
                userActionStackPointer,
                setUserActionStackPointer,
                ymapRef
            );
        } else if (
            ((e.key === "z" || e.key === "Z") && e.ctrlKey) ||
            (e.key === "z" && e.metaKey)
        ) {
            handleUndo(
                setAlertMessage,
                setIsAlertMessageVisible,
                userActionStack,
                setUserActionStack,
                userActionStackPointer,
                setUserActionStackPointer,
                setMindMap,
                setMemo,
                setMouseCoordinates,
                ymapRef
            );
        }
    };

    const handleFocusButtonClick = (x, y) => {
        setHighLightPos({ x: x, y: y });
        networkRef.current.moveTo({
            position: { x: x, y: y },
            scale: 2.0,
            offset: { x: 0, y: 0 },
            animation: {
                duration: 600,
                easingFunction: "easeOutCubic",
            },
        });
    };

    useEffect(() => {
        let showTimer = null;
        let hideTimer = null;

        if (highLightPos !== null) {
            showTimer = setTimeout(() => {
                hideTimer = setTimeout(() => {
                    setHighLightPos(null);
                }, 300);
            }, 400);
        }

        return () => {
            clearTimeout(showTimer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [highLightPos]);

    const handleTextButton = () => {
        setIsCreatingText(true);
        setInfoMessage("원하는 위치를 클릭하여 텍스트를 추가하세요.");
        setIsInfoMessageVisible(true);
    };

    const handleReset = () => {
        const IsReset = window.confirm("모든 노드를 삭제하시겠습니까?");
        if (ymapRef.current && IsReset) {
            // Create a copy of currentUserData to preserve the original data
            const currentUserData = getUserListFromYMap();

            setUserActionStack((prev) => {
                // 스택의 길이가 최대 길이를 초과할 경우, 가장 오래된 기록을 삭제
                if (prev.length >= MAX_STACK_LENGTH) {
                    setUserActionStackPointer(prev.length - 1);
                    return [
                        ...prev.slice(1),
                        {
                            action: "reset",
                            prevYmap: ymapRef.current.toJSON(),
                        },
                    ];
                }
                // 새로운 동작을 하였으므로, 스택 포인터를 스택의 가장 마지막 인덱스로 설정
                else {
                    setUserActionStackPointer(prev.length);
                    return [
                        ...prev,
                        {
                            action: "reset",
                            prevYmap: ymapRef.current.toJSON(),
                        },
                    ];
                }
            });

            ymapRef.current.forEach((value, key) => {
                if (!currentUserData.includes(key)) {
                    ymapRef.current.delete(key);
                }
            });

            ymapRef.current.set(`Node 1`, JSON.stringify(rootNode));
            ymapRef.current.set("RootQuadrant", 0);
        }
    };

    const checkIsConnectedToRoot = (edges, node) => {
        let dfsq = [`${node}`];
        while (dfsq.length > 0) {
            const current = dfsq.shift();
            if (current === "1") {
                return true;
            }
            edges.forEach((edge) => {
                if (edge.endsWith(` to ${current}`)) {
                    dfsq.push(edge.split(" ")[1]);
                }
            });
        }
        return false;
    };

    const createEdge = (fromNode, toNode) => {
        ymapRef.current.set(
            `Edge ${fromNode} to ${toNode}`,
            JSON.stringify({
                from: fromNode,
                to: toNode,
                id: `${fromNode} to ${toNode}`,
            })
        );
        setUserActionStack((prev) => {
            if (prev.length >= MAX_STACK_LENGTH) {
                setUserActionStackPointer(prev.length - 1);
                return [
                    ...prev.slice(1),
                    {
                        action: "create",
                        createdEdge: [`Edge ${fromNode} to ${toNode}`],
                    },
                ];
            } else {
                setUserActionStackPointer(prev.length);
                return [
                    ...prev,
                    {
                        action: "create",
                        createdEdge: [`Edge ${fromNode} to ${toNode}`],
                    },
                ];
            }
        });
    };

    const sortEdgesCorrectly = (edges, createdEdge) => {
        let edgeList = edges.filter((edge) => edge !== createdEdge);
        let newEdgeList = [];
        let bfsq = [`${createdEdge.split(" ")[3]}`];
        while (bfsq.length > 0) {
            const current = bfsq.shift();
            edgeList.forEach((edge) => {
                if (edge.startsWith(`Edge ${current} to `)) {
                    newEdgeList.push(edge);
                    ymapRef.current.delete(edge);
                    edgeList = edgeList.filter((e) => e !== edge);
                    bfsq.push(edge.split(" ")[3]);
                } else if (edge.endsWith(` to ${current}`)) {
                    newEdgeList.push(`Edge ${current} to ${edge.split(" ")[1]}`);
                    ymapRef.current.delete(edge);
                    edgeList = edgeList.filter((e) => e !== edge);
                    bfsq.push(edge.split(" ")[1]);
                }
            });
        }

        newEdgeList.forEach((edge) => {
            const from = edge.split(" ")[1];
            const to = edge.split(" ")[3];
            ymapRef.current.set(
                `Edge ${from} to ${to}`,
                JSON.stringify({
                    from: from,
                    to: to,
                    id: `${from} to ${to}`,
                })
            );
        });
    };

    const deleteEdge = () => {
        const selectedEdgeArray = [selectedEdge];
        selectedEdgeArray.forEach((edge) => {
            const splitedEdge = edge.split(" ");
            const from = splitedEdge[0];
            const to = splitedEdge[2];
            ymapRef.current.delete(`Edge ${from} to ${to}`);

            setUserActionStack((prev) => {
                if (prev.length >= MAX_STACK_LENGTH) {
                    setUserActionStackPointer(prev.length - 1);
                    return [
                        ...prev.slice(1),
                        {
                            action: "delete",
                            deletedEdge: [edge],
                        },
                    ];
                } else {
                    setUserActionStackPointer(prev.length);
                    return [
                        ...prev,
                        {
                            action: "delete",
                            deletedEdge: [edge],
                        },
                    ];
                }
            });
        });
        setIsEdgeContextMenuVisible(false);
    };

    const checkquadrant = (x, y) => {
        if (x > 0 && y > 0) {
            return 1;
        } else if (x < 0 && y > 0) {
            return 2;
        } else if (x < 0 && y < 0) {
            return 3;
        } else {
            return 4;
        }
    };

    const nx = [100, -100, -100, 100];
    const ny = [100, 100, -100, -100];

    const createNode = (selectedNodeId) => {
        if (!selectedNodeId) {
            setInfoMessage("노드를 선택한 후에 버튼을 눌러 자식 노드를 추가하세요!");
            setIsInfoMessageVisible(true);
            return;
        }
        const selectedNode = JSON.parse(ymapRef.current.get(`Node ${selectedNodeId}`));
        const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);

        if (!selectedNode) {
            return;
        }

        const createNodeCallback = (label) => {
            if (!label || label.trim() === "") {
                setAlertMessage("키워드를 입력하세요!");
                setIsAlertMessageVisible(true);
                removeTextInput();
            } else {
                let quadrant = "";
                if (selectedNode.id === 1) {
                    quadrant = (ymapRef.current.get("RootQuadrant") % 4) + 1;
                    ymapRef.current.set("RootQuadrant", ymapRef.current.get("RootQuadrant") + 1);
                } else {
                    quadrant = checkquadrant(selectedNode.x, selectedNode.y);
                }
                const newNode = {
                    id: nodeId,
                    label: label,
                    x: selectedNode.x + nx[quadrant - 1],
                    y: selectedNode.y + ny[quadrant - 1],
                    color: NORMAL_NODE_COLOR,
                    widthConstraint: { minimum: 50, maximum: 100 },
                    heightConstraint: { minimum: 50, maximum: 100 },
                };
                setUserActionStack((prev) => {
                    // 스택의 길이가 최대 길이를 초과할 경우, 가장 오래된 기록을 삭제
                    if (prev.length >= MAX_STACK_LENGTH) {
                        setUserActionStackPointer(prev.length - 1);
                        return [
                            ...prev.slice(1),
                            {
                                action: "create",
                                nodeId: newNode.id,
                                newNode: newNode,
                            },
                        ];
                    }
                    // 새로운 동작을 하였으므로, 스택 포인터를 스택의 가장 마지막 인덱스로 설정
                    else {
                        setUserActionStackPointer(prev.length);
                        return [
                            ...prev,
                            {
                                action: "create",
                                nodeId: newNode.id,
                                newNode: newNode,
                            },
                        ];
                    }
                });

                ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));
                ymapRef.current.set(
                    `Edge ${selectedNodeId} to ${nodeId}`,
                    JSON.stringify({
                        from: selectedNodeId,
                        to: nodeId,
                        id: `${selectedNodeId} to ${nodeId}`,
                    })
                );
                mindMapRef.current.focus();

                removeTextInput();
            }
        };

        const removeTextInput = () => {
            const textField = document.getElementById("createNodeTextField");
            if (textField) {
                document.body.removeChild(textField);
            }
        };

        const textField = CreateTextInput(
            ``,
            createNodeCallback,
            () => {
                setSelectedNode(null);
                removeTextInput();
            },
            networkRef,
            selectedNode.x,
            selectedNode.y
        );

        textField.id = "createNodeTextField";

        document.body.appendChild(textField);
        textField.focus();
    };

    const handleCreateImage = (url, searchWord) => {
        const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);

        if (url.includes("data:image")) {
            createNodeWithImage(url, searchWord, nodeId);
        } else {
            fetch(`/api/proxyImage?url=${encodeURIComponent(url)}`)
                .then((response) => response.json()) // JSON 형식으로 응답을 받음
                .then((data) => {
                    const proxyImageUrl = data.imageUrl; // 프록시 서버에서 생성한 짧은 URL을 사용
                    createNodeWithImage(proxyImageUrl, searchWord, nodeId);
                })
                .catch((error) => {
                    console.error("이미지 다운로드 및 전달 중 에러:", error);
                    createNodeWithImage(url, searchWord, nodeId);
                });
        }
    };

    const createNodeWithImage = (imageUrl, searchWord, nodeId) => {
        console.log("이미지 다운로드 및 전달 완료:", imageUrl);
        const coord = networkRef.current.DOMtoCanvas({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        const newNode = {
            id: nodeId,
            label: searchWord,
            shape: "image",
            image: imageUrl, // 짧은 URL을 사용
            x: coord.x,
            y: coord.y,
            physics: false,
            size: 20,
        };

        ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));
    };

    const closeNodeContextMenu = () => {
        setIsNodeContextMenuVisible(false);
    };

    const closeEdgeContextMenu = () => {
        setIsEdgeContextMenuVisible(false);
    };

    const closeTextContextMenu = () => {
        setIsTextContextMenuVisible(false);
    };

    const modifyNode = (nodeId, newLabel) => {
        const node = JSON.parse(ymapRef.current.get(`Node ${nodeId}`));
        if (node) {
            setUserActionStack((prev) => {
                // 스택의 길이가 최대 길이를 초과할 경우, 가장 오래된 기록을 삭제
                if (prev.length >= MAX_STACK_LENGTH) {
                    setUserActionStackPointer(prev.length - 1);
                    return [
                        ...prev.slice(1),
                        {
                            action: "modify",
                            nodeId: nodeId,
                            prevLabel: node.label,
                            newLabel: newLabel,
                        },
                    ];
                }
                // 새로운 동작을 하였으므로, 스택 포인터를 스택의 가장 마지막 인덱스로 설정
                else {
                    setUserActionStackPointer(prev.length);
                    return [
                        ...prev,
                        {
                            action: "modify",
                            nodeId: nodeId,
                            prevLabel: node.label,
                            newLabel: newLabel,
                        },
                    ];
                }
            });
            node.label = newLabel;
            ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(node));
        }
    };

    const bookMarkNode = () => {
        const nodeKey = `Node ${selectedNode}`;
        let selectedNodeObject = JSON.parse(ymapRef.current.get(nodeKey));

        setUserActionStack((prev) => {
            // 스택의 길이가 최대 길이를 초과할 경우, 가장 오래된 기록을 삭제
            if (prev.length >= MAX_STACK_LENGTH) {
                setUserActionStackPointer(prev.length - 1);
                return [
                    ...prev.slice(1),
                    {
                        action: "bookmark",
                        nodeId: selectedNode,
                        prevBookMarked: selectedNodeObject.bookMarked,
                        newBookMarked: !selectedNodeObject.bookMarked,
                    },
                ];
            }
            // 새로운 동작을 하였으므로, 스택 포인터를 스택의 가장 마지막 인덱스로 설정
            else {
                setUserActionStackPointer(prev.length);
                return [
                    ...prev,
                    {
                        action: "bookmark",
                        nodeId: selectedNode,
                        prevBookMarked: selectedNodeObject.bookMarked,
                        newBookMarked: !selectedNodeObject.bookMarked,
                    },
                ];
            }
        });

        // 북마크 상태 토글
        selectedNodeObject.bookMarked = !selectedNodeObject.bookMarked;

        // 북마크 상태에 따라 라벨과 폰트 설정 변경
        const isImageShape = selectedNodeObject.shape === "image";
        const bookmarkIconLabel = `${BOOKMARK_ICON}\n`;

        if (selectedNodeObject.bookMarked) {
            selectedNodeObject.label =
                (isImageShape ? BOOKMARK_ICON : bookmarkIconLabel) +
                selectedNodeObject.label +
                "\n ";
            selectedNodeObject.font = { multi: true };
        } else {
            const regex = isImageShape
                ? new RegExp(`${BOOKMARK_ICON}|(\\n\\s)`, "g")
                : new RegExp(`${BOOKMARK_ICON}\\n|(\\n\\s)`, "g");
            selectedNodeObject.label = selectedNodeObject.label.replace(regex, "");
            selectedNodeObject.font = { multi: false };
        }

        ymapRef.current.set(nodeKey, JSON.stringify(selectedNodeObject));
    };

    useEffect(() => {
        if (selectedNode !== null) {
            const node = JSON.parse(ymapRef.current.get(`Node ${selectedNode}`));
            if (node.shape === "image") {
                setSelectedImage(true);
            }
        } else {
            setSelectedImage(false);
        }

        const handleAddNode = (event) => {
            if (!selectedNode) {
                return;
            }
            createNode(selectedNode);
        };

        const handleSwitchMemo = (event) => {
            setIsMemoVisible((prev) => !prev);
        };
        const __handleMouseWheel = (event) => {
            if (selectedNode) {
                handleMouseWheel(event, selectedNode, ymapRef);
            }
        };
        const __handleSetTimer = (event) => {
            setIsTimerVisible((prev) => !prev);
        };
        document.addEventListener("click", memoizedHandleClickOutside);
        window.addEventListener("switchMemo", handleSwitchMemo);
        window.addEventListener("wheel", __handleMouseWheel);
        window.addEventListener("setTimer", __handleSetTimer);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("switchMemo", handleSwitchMemo);
            window.removeEventListener("wheel", __handleMouseWheel);
            window.removeEventListener("setTimer", __handleSetTimer);
        };
    }, [selectedNode, memoizedHandleClickOutside, selectedImage]);

    const deleteRecursion = (nodeId) => {
        const childNodes = Array.from(ymapRef.current.keys())
            .filter((key) => key.startsWith(`Edge ${nodeId} to `))
            .map((key) => key.split(" ")[3]);

        childNodes.forEach((childNodeId) => {
            deleteSingleNode(childNodeId);
            deleteRecursion(childNodeId);
        });

        deleteSingleNode(nodeId);
        setSelectedNode(null);
    };

    const deleteSingleNode = (nodeId) => {
        const tempUserId = userName;
        const willDeleteNode = ymapRef.current.get(`Node ${nodeId}`);

        setUserActionStack((prev) => {
            if (willDeleteNode) {
                let lastAction = prev[prev.length - 1];
                lastAction.deletedNodes.push(JSON.parse(willDeleteNode));
                prev[prev.length - 1] = lastAction;
                return [...prev];
            } else {
                return [...prev];
            }
        });

        ymapRef.current.delete(`Node ${nodeId}`);
        ymapRef.current.get(`User ${tempUserId} selected`) === `Node ${nodeId}` &&
            ymapRef.current.delete(`User ${tempUserId} selected`);
    };

    const deleteNodes = (nodeId) => {
        if (nodeId === 1) {
            setAlertMessage("루트 노드는 삭제할 수 없습니다!");
            setIsAlertMessageVisible(true);
            return;
        }

        setUserActionStack((prev) => {
            // 스택의 길이가 최대 길이를 초과할 경우, 가장 오래된 기록을 삭제
            if (prev.length >= MAX_STACK_LENGTH) {
                setUserActionStackPointer(prev.length - 1);
                return [
                    ...prev.slice(1),
                    {
                        action: "delete",
                        deletedNodes: [],
                    },
                ];
            }
            // 새로운 동작을 하였으므로, 스택 포인터를 스택의 가장 마지막 인덱스로 설정
            else {
                setUserActionStackPointer(prev.length);
                return [
                    ...prev,
                    {
                        action: "delete",
                        deletedNodes: [],
                    },
                ];
            }
        });

        deleteRecursion(nodeId);
    };

    const handleNodeSelect = async ({ nodes }) => {
        if (nodes.length === 0) {
            return;
        }

        const clickedNodeId = nodes[0];
        setClickedNodeId(clickedNodeId);
        const clickedNode = JSON.parse(ymapRef.current.get(`Node ${clickedNodeId}`));
        if (!clickedNode) {
            return;
        }

        const connectedNodeLabels = getConnectedNodeLabels(clickedNodeId, ymapRef);
        const allNodeLabels = getAllNodeLabels(ymapRef, clickedNodeId);
        const newNodeLabels = await fetchNewNodeLabels(connectedNodeLabels, allNodeLabels);

        if (newNodeLabels.length === 0) {
            alert("No new node labels fetched.");
            return;
        }
        setShowPopup(true);
        setNewNodeLabels(newNodeLabels);
        setConnectedNodeLabels(connectedNodeLabels);
        setAllNodeLabels(allNodeLabels);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleRestart = async () => {
        const mergedLabels = Array.from(new Set(allNodeLabels.concat(newNodeLabels)));
        setAllNodeLabels(mergedLabels);
        const addedLabels = await fetchNewNodeLabels(connectedNodeLabels, allNodeLabels);
        const mergedNewLabels = Array.from(new Set(newNodeLabels.concat(addedLabels)));
        setNewNodeLabels(mergedNewLabels);
    };

    const handleDeleteLabel = (labelToDelete) => {
        setNewNodeLabels((prevLabels) => prevLabels.filter((label) => label !== labelToDelete));
    };

    const handleCreate = () => {
        const clickedNode = JSON.parse(ymapRef.current.get(`Node ${clickedNodeId}`));
        addNewNodesAndEdges(clickedNode, newNodeLabels, clickedNodeId, ymapRef);
        setShowPopup(false);
    };

    const handleMemoChange = makeHandleMemoChange(ymapRef, setMemo);

    const [MindMap, setMindMap] = useState(() => {
        return {
            graph: {
                nodes: [rootNode],
                edges: [],
            },
        };
    });

    const captureRef = useRef(null);

    const handleExportClick = () => {
        if (captureRef.current) {
            html2canvas(captureRef.current, {
                onclone: (clonedDocument) => {
                    Array.from(clonedDocument.querySelectorAll("textarea")).forEach((textArea) => {
                        if (!textArea.value) return;

                        const div = clonedDocument.createElement("div");
                        div.innerText = textArea.value;
                        div.style.position = "fixed";
                        div.style.top = "10vh";
                        div.style.right = "2vh";
                        div.style.width = "250px";
                        div.style.height = "15%";
                        div.style.backgroundColor = "#fbeeac";
                        div.style.border = "2px solid #e8c55b";
                        div.style.borderRadius = "5px";
                        div.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
                        div.style.padding = "15px";
                        div.style.fontFamily = '"Noto Sans KR", sans-serif';
                        div.style.fontSize = "16px";
                        div.style.lineHeight = "1.6";
                        div.style.color = "#333";
                        div.style.zIndex = "1";
                        div.style.overflow = "hidden";
                        div.style.whiteSpace = "pre-wrap";
                        textArea.parentElement.replaceChild(div, textArea);
                    });
                },
            }).then((canvas) => {
                canvas.toBlob((blob) => {
                    fileDownload(blob, `${sessionId}.png`);
                });
            });
        }
    };

    const { graph, events } = MindMap;
    const { nodes, edges } = graph;

    return (
        <div className="mind-map-container">
            <div
                onMouseMove={(e) => handleMouseMove(e)}
                style={{
                    position: "absolute",
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                }}
                tabIndex={0}
                ref={mindMapRef}
            >
                <UserMouseMove
                    userMouseData={mouseCoordinates}
                    networkRef={networkRef}
                    userName={userName}
                    userList={getUserListFromYMap()}
                />
                <TopBar
                    onExportClick={handleExportClick}
                    sessionId={sessionId}
                    leaveSession={leaveSession}
                    toggleAudio={toggleAudio}
                    audioEnabled={audioEnabled}
                    userList={getUserListFromYMap()}
                    userName={userName}
                    speakingUserName={speakingUserName}
                    ymapRef={ymapRef}
                    isLoading={isLoading}
                    setInfoMessage={setInfoMessage}
                    setIsInfoMessageVisible={setIsInfoMessageVisible}
                />
                <div
                    ref={captureRef}
                    style={{ width: "100%", height: "100%" }}
                    onKeyDown={handleKeyPress}
                >
                    <div
                        type="text"
                        value={sessionId}
                        style={{ position: "absolute", zIndex: 1 }}
                    />
                    <div
                        className={`
                ${isTimerVisible ? "visible" : "hidden"}`}
                    >
                        <Timer
                            sessionId={sessionId}
                            isTimerRunning={isTimerRunning}
                            setIsTimerRunning={setIsTimerRunning}
                        />
                    </div>
                    <Graph
                        graph={MindMap.graph}
                        options={options}
                        events={{
                            ...MindMap.events,
                            dragStart: (events) =>
                                handleNodeDragStart(
                                    events,
                                    ymapRef,
                                    setUserActionStack,
                                    setUserActionStackPointer
                                ),
                            dragging: (events) => handleNodeDragging(events, ymapRef, userName),
                            dragEnd: (events) =>
                                handleNodeDragEnd(
                                    events,
                                    ymapRef,
                                    setSelectedNode,
                                    setUserActionStack
                                ),
                            drag: handleCanvasDrag,
                            click: (events) => {
                                handleAddTextNode(
                                    events,
                                    isCreatingText,
                                    ymapRef,
                                    setSelectedNode,
                                    setSelectedEdge,
                                    setIsCreatingText,
                                    networkRef
                                );
                            },
                            select: handleUserSelect,
                            oncontext: openNodeContextMenu,
                            doubleClick: (events) =>
                                handleDoubleClick(
                                    events,
                                    ymapRef,
                                    modifyNode,
                                    setAlertMessage,
                                    setIsAlertMessageVisible,
                                    networkRef
                                ),
                        }}
                        style={{ height: "100%", width: "100%" }}
                        getNetwork={(network) => {
                            network.on("initRedraw", () => {
                                networkRef.current = network;
                            });
                        }}
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
                                selectedNode={selectedNode}
                                onClose={closeNodeContextMenu}
                                deleteNode={deleteNodes}
                                createNode={createNode}
                                bookMarkNode={bookMarkNode}
                                setIsCreatingEdge={setIsCreatingEdge}
                                setFromNode={setFromNode}
                                handleNodeSelect={handleNodeSelect}
                                setInfoMessage={setInfoMessage}
                                setIsInfoMessageVisible={setIsInfoMessageVisible}
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
                    {isTextContextMenuVisible && (
                        <div
                            ref={contextMenuRef}
                            className="context-menu"
                            style={{
                                position: "absolute",
                                left: contextMenuPos.xPos,
                                top: contextMenuPos.yPos,
                            }}
                        >
                            <TextContextMenu
                                selectedText={selectedNode}
                                onClose={closeTextContextMenu}
                                deleteNode={deleteNodes}
                            />
                        </div>
                    )}
                </div>
                {isMemoVisible && <Memo memo={memo} handleMemoChange={handleMemoChange} />}
                <LowToolBar
                    FocusButton={handleFocusButtonClick}
                    NodeButton={createNode}
                    TextButton={handleTextButton}
                    isImageSearchVisible={isImageSearchVisible}
                    setIsImageSearchVisible={setIsImageSearchVisible}
                    isMarkdownVisible={isMarkdownVisible}
                    setIsMarkdownVisible={setIsMarkdownVisible}
                    selectedNode={selectedNode}
                    onExportClick={handleExportClick}
                    setAlertMessage={setAlertMessage}
                    setIsAlertMessageVisible={setIsAlertMessageVisible}
                    userActionStack={userActionStack}
                    setUserActionStack={setUserActionStack}
                    userActionStackPointer={userActionStackPointer}
                    setUserActionStackPointer={setUserActionStackPointer}
                    setMindMap={setMindMap}
                    setMemo={setMemo}
                    setMouseCoordinates={setMouseCoordinates}
                    ymapRef={ymapRef}
                />
                <GraphToMarkdown
                    style={{ height: isMemoVisible ? "calc(80% - 23%)" : "80%" }}
                    nodes={nodes}
                    edges={edges}
                    isMarkdownVisible={isMarkdownVisible}
                    setIsMarkdownVisible={setIsMarkdownVisible}
                    networkRef={networkRef}
                    handleFocusButtonClick={handleFocusButtonClick}
                    ymapRef={ymapRef}
                />
                <ImageSearch
                    style={{ height: isTimerVisible ? "calc(80% - 13%)" : "80%" }}
                    createImage={handleCreateImage}
                    isImageSearchVisible={isImageSearchVisible}
                    setIsImageSearchVisible={setIsImageSearchVisible}
                />
                <SnackbarProvider maxSnack={3}>
                    <AlertToast
                        message={alertMessage}
                        open={isAlertMessageVisible}
                        visible={setIsAlertMessageVisible}
                    />
                    <InformationToast
                        message={infoMessage}
                        open={isInfoMessageVisible}
                        visible={setIsInfoMessageVisible}
                    />
                </SnackbarProvider>
                {showPopup && (
                    <NodeLabelsPopup
                        newNodeLabels={newNodeLabels}
                        onDelete={handleDeleteLabel}
                        onCreate={handleCreate}
                        onClose={handleClosePopup}
                        onRestart={handleRestart}
                    />
                )}
                {highLightPos && (
                    <HighLighter pos={highLightPos} setHighLightPos={setHighLightPos} />
                )}
            </div>
        </div>
    );
};

export default MindMap;
