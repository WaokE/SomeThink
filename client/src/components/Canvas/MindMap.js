//  node ./node_modules/y-websocket/bin/server.js
import Graph from "react-graph-vis";
import React, { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "../TopBar/TopBar";
import html2canvas from "html2canvas";
import fileDownload from "js-file-download";
import ImageSearch from "./ImageSearch";

import {
    handleDoubleClick,
    handleNodeDragEnd,
    handleClickOutside,
    handleCanvasDrag,
    handleAddTextNode,
    handleNodeContextMenu,
    handleNodeDragging,
    createTextInput,
    makeHandleMemoChange,
    handleMouseWheel,
    makeHandleStartTimeChange,
    makeHandleDurationChange,
    makeHandleTimerRunning,
} from "./EventHandler";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import NodeContextMenu from "./NodeContextMenu";
import EdgeContextMenu from "./EdgeContextMenu";
import TextContextMenu from "./TextContextMenu";
import LowToolBar from "../LowToolBar/LowToolBar";
import UserMouseMove from "./UserMouseMove";
import Memo from "./MemoNode";
import Timer from "./Timer";
import AlertToast from "../ToastMessage/Alert";
import InformationToast from "../ToastMessage/Information";
import GraphToMarkdown from "./MarkDown";

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

// const MindMap = (sessionId, leaveSession, toggleAudio, audioEnabled) => {
const MindMap = ({ sessionId, leaveSession, toggleAudio, audioEnabled, userName }) => {
    const ydocRef = useRef(null);
    const ymapRef = useRef(null);
    const networkRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState(false);

    const colors = [
        "#FF5733", // 빨간색
        "#33A7FF", // 파란색
        "#9A33FF", // 보라색
        "#FF33E4", // 분홍색
        "#33FFC4", // 청록색
        "#336DFF", // 하늘색
        "#FF33A9", // 자홍색
        "#33FF49", // 녹색
        "#FF8C33", // 적갈색
        "#9AFF33", // 연두색
    ];

    let options = {
        layout: {
            hierarchical: false,
        },
        nodes: {
            shape: "circle",
            size: 30,
            mass: 1,
            color: "#FBD85D",
            widthConstraint: {
                maximum: 60,
            },
        },
        edges: {
            arrows: {
                to: {
                    enabled: true,
                },
            },
            color: "#000000",
        },
        physics: {
            enabled: false,
        },
        interaction: {
            multiselect: false,
            zoomView: false,
        },
        manipulation: {
            addEdge: (data, callback) => {},
        },
    };

    const templateNodes = [
        {
            id: 1,
            label: "Root",
            x: 0,
            y: 0,
            physics: false,
            fixed: true,
            color: "#f5b252",
        },
        {
            id: 2,
            label: "노드를 우클릭하여 메뉴를 열 수 있습니다.",
            x: 100,
            y: 100,
            physics: false,
            fixed: true,
            color: "#FBD85D",
            shape: "box",
            widthConstraint: 100,
        },
        {
            id: 3,
            label: "노드를 더블클릭하여 키워드를 수정할 수 있습니다.",
            x: -100,
            y: 100,
            physics: false,
            fixed: true,
            color: "#FBD85D",
            shape: "box",
            widthConstraint: 100,
        },
        {
            id: 4,
            label: "노드를 드래그하여 이동할 수 있습니다.",
            x: 100,
            y: -100,
            physics: false,
            fixed: true,
            color: "#FBD85D",
            shape: "box",
            widthConstraint: 100,
        },
        {
            id: 5,
            label: "하단 메뉴를 통해 이미지와 텍스트, 노드를 쉽게 추가할 수 있습니다.",
            x: -100,
            y: -100,
            physics: false,
            fixed: true,
            color: "#FBD85D",
            shape: "box",
            widthConstraint: 100,
        },
    ];

    const templateEdges = [
        {
            from: 1,
            to: 2,
            id: "1 to 2",
        },
        {
            from: 1,
            to: 3,
            id: "1 to 3",
        },
        {
            from: 1,
            to: 4,
            id: "1 to 4",
        },
        {
            from: 1,
            to: 5,
            id: "1 to 5",
        },
    ];

    if (!selectedImage) {
        options = {
            ...options,
            interaction: {
                ...options.interaction,
                zoomView: true,
            },
        };
    }

    const [isInfoMessageVisible, setIsInfoMessageVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");
    const [isAlertMessageVisible, setIsAlertMessageVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isImageSearchVisible, setIsImageSearchVisible] = useState(false);
    const [fromNode, setFromNode] = useState(null);
    const [isCreatingEdge, setIsCreatingEdge] = useState(false);
    const [inputId, setInputId] = useState("");
    const [mouseCoordinates, setMouseCoordinates] = useState([]);
    const [contextMenuPos, setContextMenuPos] = useState({ xPos: 0, yPos: 0 });
    const [isNodeContextMenuVisible, setIsNodeContextMenuVisible] = useState(false);
    const [isEdgeContextMenuVisible, setIsEdgeContextMenuVisible] = useState(false);
    const [isTextContextMenuVisible, setIsTextContextMenuVisible] = useState(false);
    const contextMenuRef = useRef(null);
    const [isCreatingText, setIsCreatingText] = useState(false);
    const [memo, setMemo] = useState("");
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [duration, setDuration] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isMemoVisible, setIsMemoVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const memoizedHandleClickOutside = useCallback(
        handleClickOutside(
            contextMenuRef,
            setIsNodeContextMenuVisible,
            setIsEdgeContextMenuVisible,
            setIsTextContextMenuVisible
        ),
        [contextMenuRef, setIsNodeContextMenuVisible]
    );

    const openNodeContextMenu = handleNodeContextMenu({
        setContextMenuPos,
        setIsNodeContextMenuVisible,
        setIsEdgeContextMenuVisible,
        setIsTextContextMenuVisible,
        ymapRef,
    });

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

    useEffect(() => {
        ydocRef.current = new Y.Doc();
        const provider = new WebsocketProvider(
            "wss://somethink.online/room",
            sessionId,
            ydocRef.current
        );

        ymapRef.current = ydocRef.current.getMap("MindMap");
        ymapRef.current.set(`Node 1`, JSON.stringify(templateNodes[0]));

        // templateNodes.forEach((node) => {
        //     ymapRef.current.set(`Node ${node.id}`, JSON.stringify(node));
        // });
        // templateEdges.forEach((edge) => {
        //     ymapRef.current.set(`Edge ${edge.from} to ${edge.to}`, JSON.stringify(edge));
        // });

        ymapRef.current.observe((event) => {
            const updatedGraph = {
                nodes: [],
                edges: [],
            };

            const updatedMemo = {
                memo: "",
            };

            const Mouses = [];
            let newStartTime, newDuration, newIsTimerRunning;

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
                } else if (key === "StartTime") {
                    newStartTime = Number(value);
                } else if (key === "Duration") {
                    newDuration = Number(value);
                } else if (key === "TimerRunning") {
                    newIsTimerRunning = Boolean(value);
                }
            });

            setMindMap((prevState) => ({
                ...prevState,
                graph: updatedGraph,
            }));
            setMemo(updatedMemo.memo);
            setMouseCoordinates(Mouses);

            // update startTime, duration, and isTimerRunning
            if (newStartTime !== undefined) {
                setStartTime(newStartTime);
            }
            if (newDuration !== undefined) {
                setDuration(newDuration);
            }
            if (newIsTimerRunning !== undefined) {
                setIsTimerRunning(newIsTimerRunning);
            }
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

    const handleMouseMove = (e) => {
        if (networkRef.current !== null) {
            const coord = networkRef.current.DOMtoCanvas({
                x: e.clientX,
                y: e.clientY,
            });
            const nx = coord.x;
            const ny = coord.y;
            ymapRef.current.set(
                `Mouse ${userName}`,
                JSON.stringify({ x: nx, y: ny, id: userName })
            );
        }
    };

    const handleUserSelect = (event) => {
        const tempUserId = userName;
        const indexOfUser = getUserListFromYMap().indexOf(tempUserId);

        if (isCreatingEdge) {
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
                    background: "#FBD85D",
                };
            }
            selectedNode.owner = tempUserId;
            ymapRef.current.set(`Node ${event.nodes[0]}`, JSON.stringify(selectedNode));
        }
        // 선택 해제시
        else {
            setSelectedNode(null);
            checkPrevSelected(tempUserId);
        }
    };

    // 유저가 선택한 값이 있는지 검사
    const checkPrevSelected = (userId) => {
        const tempValue = ymapRef.current.get(`User ${userId} selected`);
        // 있다면 해당 값 원래대로 돌려놓음
        if (tempValue) {
            let userData = JSON.parse(ymapRef.current.get(tempValue));
            if (userData) {
                if (userData.label) {
                    userData.borderWidth = 1;
                    if (userData.id === 1) {
                        userData.color = "#f5b252";
                    } else {
                        userData.color = "#FBD85D";
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
                deleteEdge([`${selectedEdge}`]);
            }
        }
    };

    const handleFocusButtonClick = () => {
        networkRef.current.moveTo({
            position: { x: 0, y: 0 },
            scale: 1.0,
            offset: { x: 0, y: 0 },
        });
    };

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

            ymapRef.current.clear();
            ymapRef.current.set(`Node 1`, JSON.stringify(templateNodes[0]));

            currentUserData.forEach((user) => {
                console.log(user);
                ymapRef.current.set(user, true);
            });
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
    };

    const sortEdgesCorrectly = (edges, createdEdge) => {
        let edgeList = edges.filter((edge) => edge != createdEdge);
        let newEdgeList = [];
        let bfsq = [`${createdEdge.split(" ")[3]}`];
        while (bfsq.length > 0) {
            const current = bfsq.shift();
            edgeList.forEach((edge) => {
                if (edge.startsWith(`Edge ${current} to `)) {
                    newEdgeList.push(edge);
                    ymapRef.current.delete(edge);
                    // FIXME: 반복을 인덱싱을 통해 하도록 해서 삭제 성능개선을 할 수 있을듯?
                    edgeList = edgeList.filter((e) => e != edge);
                    bfsq.push(edge.split(" ")[3]);
                } else if (edge.endsWith(` to ${current}`)) {
                    newEdgeList.push(`Edge ${current} to ${edge.split(" ")[1]}`);
                    ymapRef.current.delete(edge);
                    // FIXME: 반복을 인덱싱을 통해 하도록 해서 삭제 성능개선을 할 수 있을듯?
                    edgeList = edgeList.filter((e) => e != edge);
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

    const deleteEdge = (selectedEdge) => {
        selectedEdge.forEach((edge) => {
            const splitedEdge = edge.split(" ");
            const from = splitedEdge[0];
            const to = splitedEdge[2];
            ymapRef.current.delete(`Edge ${from} to ${to}`);
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
            setInfoMessage("노드를 선택한 후에 버튼을 눌러 노드를 추가하세요!");
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
                const quadrant = checkquadrant(selectedNode.x, selectedNode.y);
                console.log(quadrant);
                const newNode = {
                    id: nodeId,
                    label: label,
                    x: selectedNode.x + nx[quadrant - 1],
                    y: selectedNode.y + ny[quadrant - 1],
                    color: "#FBD85D",
                };

                ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));
                ymapRef.current.set(
                    `Edge ${selectedNodeId} to ${nodeId}`,
                    JSON.stringify({
                        from: selectedNodeId,
                        to: nodeId,
                        id: `${selectedNodeId} to ${nodeId}`,
                    })
                );

                removeTextInput();
            }
        };

        const removeTextInput = () => {
            const textField = document.getElementById("createNodeTextField");
            if (textField) {
                document.body.removeChild(textField);
            }
        };

        const textField = createTextInput(``, createNodeCallback, () => {
            setSelectedNode(null);
            removeTextInput();
        });

        textField.id = "createNodeTextField";

        document.body.appendChild(textField);
        textField.focus();
    };

    const handleCreateImage = (url, searchWord) => {
        const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);
        const newNode = {
            id: nodeId,
            label: searchWord,
            shape: "image",
            image: url,
            x: 0,
            y: 0,
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
            node.label = newLabel;
            ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(node));
        }
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

    const deleteSingleNode = (nodeId) => {
        // NOTE: 임시 유저 ID
        const tempUserId = userName;
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
        const childNodes = Array.from(ymapRef.current.keys())
            .filter((key) => key.startsWith(`Edge ${nodeId} to `))
            .map((key) => key.split(" ")[3]);

        childNodes.forEach((childNodeId) => {
            deleteSingleNode(childNodeId);
            deleteNodes(childNodeId);
        });

        deleteSingleNode(nodeId);
        setSelectedNode(null);
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

            const newNodes = newNodeLabels.map((label, index) => {
                const quadrant = checkquadrant(clickedNode.x, clickedNode.y);
                const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);
                const newNode = {
                    id: nodeId,
                    label: label.trim(),
                    x: clickedNode.x + nx[quadrant - 1] * (1 - index),
                    y: clickedNode.y + ny[quadrant - 1] * index,
                    physics: false,
                    color: "#FBD85D",
                    size: 30,
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
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleMemoChange = makeHandleMemoChange(ymapRef, setMemo);

    const [MindMap, setMindMap] = useState(() => {
        return {
            graph: {
                nodes: templateNodes,
                edges: [],
            },
        };
    });

    const captureRef = useRef(null);

    const handleExportClick = () => {
        if (captureRef.current) {
            html2canvas(captureRef.current).then((canvas) => {
                canvas.toBlob((blob) => {
                    fileDownload(blob, `${sessionId}.png`);
                });
            });
        }
    };

    const { graph, events } = MindMap;
    const { nodes, edges } = graph;

    return (
        <div
            onKeyDown={handleKeyPress}
            onMouseMove={(e) => handleMouseMove(e)}
            style={{
                position: "absolute",
                width: "100vw",
                height: "100vh",
                zIndex: 0,
            }}
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
            />
            <GraphToMarkdown nodes={nodes} edges={edges} sessionId={sessionId} />
            <div ref={captureRef} style={{ width: "100%", height: "100%" }}>
                <div type="text" value={sessionId} style={{ position: "absolute", zIndex: 1 }} />
                <PreventRefresh />
                {isTimerVisible && (
                    <Timer
                        ymapRef={ymapRef}
                        handleStartTimeChange={makeHandleStartTimeChange(ymapRef)}
                        handleDurationChange={makeHandleDurationChange(ymapRef)}
                        setIsTimerRunning={makeHandleTimerRunning(ymapRef)}
                    />
                )}
                {isMemoVisible && <Memo memo={memo} handleMemoChange={handleMemoChange} />}
                <Graph
                    graph={MindMap.graph}
                    options={options}
                    events={{
                        ...MindMap.events,
                        dragging: (events) => handleNodeDragging(events, ymapRef, userName),
                        dragEnd: (events) => handleNodeDragEnd(events, ymapRef, setSelectedNode),
                        drag: handleCanvasDrag,
                        click: (events) => {
                            handleAddTextNode(
                                events,
                                isCreatingText,
                                ymapRef,
                                setSelectedNode,
                                setSelectedEdge,
                                setIsCreatingText
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
                                setIsAlertMessageVisible
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
                            selectedNodeId={contextMenuPos.selectedNodeId}
                            selectedNode={selectedNode}
                            onClose={closeNodeContextMenu}
                            deleteNode={deleteNodes}
                            createNode={createNode}
                            setIsCreatingEdge={setIsCreatingEdge}
                            setFromNode={setFromNode}
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
                            selectedText={contextMenuPos.selectedNodeId}
                            onClose={closeTextContextMenu}
                            deleteNode={deleteNodes}
                        />
                    </div>
                )}
            </div>
            <LowToolBar
                FocusButton={handleFocusButtonClick}
                NodeButton={createNode}
                TextButton={handleTextButton}
                ImageButton={setIsImageSearchVisible}
                ImageMenuState={isImageSearchVisible}
                selectedNode={selectedNode}
                onExportClick={handleExportClick}
            />
            <ImageSearch
                createImage={handleCreateImage}
                isImageSearchVisible={isImageSearchVisible}
            />
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
        </div>
    );
};

export default MindMap;
