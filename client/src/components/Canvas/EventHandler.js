import { CreateTextInput } from "./TextInputComponent";

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

export const handleDoubleClick = (
    event,
    ymapRef,
    modifyNode,
    setAlertMessage,
    setIsAlertMessageVisible
) => {
    if (event.nodes.length > 0) {
        const selectedNodeId = event.nodes[0];
        const nodeData = ymapRef.current.get(`Node ${selectedNodeId}`);
        if (nodeData) {
            const canvas = document.querySelector(".vis-network canvas");
            if (canvas) {
                const node = JSON.parse(nodeData);

                const textField = CreateTextInput(
                    node.label,
                    (newLabel) => {
                        if (newLabel === "") {
                            setAlertMessage("유효한 값을 입력해주세요!");
                            setIsAlertMessageVisible(true);
                            textField.value = node.label;
                        } else {
                            modifyNode(selectedNodeId, newLabel);
                        }
                        document.body.removeChild(textField);
                    },
                    () => {
                        document.body.removeChild(textField);
                    }
                );

                document.body.appendChild(textField);
                const inputField = textField.querySelector("input");
                if (inputField) {
                    inputField.focus();
                }
            }
        }
    }
};

export const handleNodeDragEnd = (event, ymapRef, setSelectedNode) => {
    const { nodes, pointer } = event;
    if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
        return;
    }
    const nodeId = nodes[0];
    const { x, y } = pointer.canvas;

    const movedNode = ymapRef.current.get(`Node ${nodeId}`);
    ymapRef.current.set(`Node ${nodeId}`, JSON.stringify({ ...JSON.parse(movedNode), x: x, y: y }));
    setSelectedNode(nodeId);
};

export const handleNodeDragging = (event, ymapRef, userName) => {
    const userList = [];
    ymapRef.current.forEach((value, key) => {
        if (typeof value === "boolean" && value === true && key !== "TimerRunning") {
            // 만약 값이 true인 경우, 해당 키를 유저명으로 간주하고 userList에 추가합니다.
            userList.push(key);
        }
    });
    userList.sort();

    const indexOfUser = userList.indexOf(userName);

    const { nodes, pointer } = event;
    if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
        return;
    }
    const nodeId = nodes[0];
    const { x, y } = pointer.canvas;

    const movedNode = ymapRef.current.get(`Node ${nodeId}`);
    ymapRef.current.set(`Node ${nodeId}`, JSON.stringify({ ...JSON.parse(movedNode), x: x, y: y }));

    checkPrevSelected(userName, ymapRef);
    let selectedNode = JSON.parse(ymapRef.current.get(`Node ${event.nodes[0]}`));
    ymapRef.current.set(`User ${userName} selected`, `Node ${event.nodes[0]}`);
    selectedNode.borderWidth = 2;
    if (selectedNode.id === 1) {
        selectedNode.color = {
            border: "#CBFFA9",
        };
    } else {
        selectedNode.color = {
            border: colors[indexOfUser],
            background: "#FBD85D",
        };
    }
    selectedNode.owner = userName;
    ymapRef.current.set(`Node ${event.nodes[0]}`, JSON.stringify(selectedNode));
};

// 유저가 선택한 값이 있는지 검사
const checkPrevSelected = (userId, ymapRef) => {
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

export const handleClickOutside =
    (
        contextMenuRef,
        setIsNodeContextMenuVisible,
        setIsEdgeContextMenuVisible,
        setIsTextContextMenuVisible
    ) =>
    (event) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
            setIsNodeContextMenuVisible(false);
            setIsEdgeContextMenuVisible(false);
            setIsTextContextMenuVisible(false);
        }
    };

export const handleCanvasDrag = (event) => {
    // 캔버스 드래그가 진행 중일 때 호출되는 함수
    // 캔버스가 이동되지만 좌표는 저장하지 않습니다.
};

export const handleAddTextNode = (
    event,
    isCreatingText,
    ymapRef,
    setSelectedNode,
    setSelectedEdge,
    setIsCreatingText
) => {
    if (event.nodes.length === 0) setSelectedNode(null);
    if (event.edges.length === 0) setSelectedEdge(null);
    if (!isCreatingText) return;

    const { pointer } = event;
    const createTextCallback = (label) => {
        setIsCreatingText(false);

        if (label) {
            const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);
            const newNode = {
                id: nodeId,
                shape: "text",
                label: label,
                x: pointer.canvas.x,
                y: pointer.canvas.y,
                physics: false,
                font: {
                    size: 15,
                },
                widthConstraint: false,
            };

            ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));

            setSelectedNode(null);
        }
    };

    const handleTextInputBlur = () => {
        setIsCreatingText(false);
    };

    const textField = CreateTextInput(
        "",
        (newLabel) => {
            if (newLabel === "") {
                alert("키워드를 입력해주세요");
                handleTextInputBlur(); // Call the handleTextInputBlur function when the label is empty
            } else {
                createTextCallback(newLabel);
            }
            document.body.removeChild(textField);
            document.removeEventListener("mousedown", handleOutside); // Remove the event listener when text creation is complete
        },
        () => {
            handleTextInputBlur(); // Call the handleTextInputBlur function when the text box is canceled
            document.body.removeChild(textField);
            document.removeEventListener("mousedown", handleOutside); // Remove the event listener when text creation is canceled
        }
    );

    const handleOutside = (e) => {
        if (!textField.contains(e.target)) {
            handleTextInputBlur(); // Call the handleTextInputBlur function when clicking outside the textField
        }
    };

    document.body.appendChild(textField);
    textField.focus();

    document.addEventListener("mousedown", handleOutside); // Add the event listener to detect clicks outside the textField
};

export const handleAddImageNode =
    ({ imageUrl, ymapRef }) =>
    () => {
        const nodeCount = ymapRef.current.get("Counter");
        const newNode = {
            id: nodeCount,
            shape: "image",
            image: imageUrl,
            x: 0,
            y: 0,
            physics: false,
            size: 30,
        };

        ymapRef.current.set(`Node ${nodeCount}`, JSON.stringify(newNode));
        ymapRef.current.set("Counter", nodeCount + 1);
    };

export const handleNodeContextMenu = ({
    setContextMenuPos,
    setIsNodeContextMenuVisible,
    setIsEdgeContextMenuVisible,
    setIsTextContextMenuVisible,
    ymapRef,
}) => {
    return ({ event, nodes, edges }) => {
        event.preventDefault();
        if (nodes.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedNodeId = nodes[0];
            const selectedNodeShape = JSON.parse(
                ymapRef.current.get(`Node ${selectedNodeId}`)
            ).shape;
            if (selectedNodeShape === "text") {
                setContextMenuPos({ xPos, yPos, selectedNodeId });
                setIsTextContextMenuVisible(true);
            } else {
                setContextMenuPos({ xPos, yPos, selectedNodeId });
                setIsNodeContextMenuVisible(true);
            }
        } else if (nodes.length === 0 && edges.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedEdge = edges;
            setContextMenuPos({ xPos, yPos, selectedEdge });
            setIsEdgeContextMenuVisible(true);
        }
    };
};

export const makeHandleMemoChange = (ymapRef, setMemo) => (event) => {
    const newMemo = event.target.value;
    ymapRef.current.set("Memo", newMemo);
    setMemo(newMemo);
};

export const handleMouseWheel = (event, selectedNode, ymapRef) => {
    const node = JSON.parse(ymapRef.current.get(`Node ${selectedNode}`));
    if (node.shape === "image") {
        if (event.deltaY < 0) {
            if (node.size < 70) {
                console.log("size up");
                ymapRef.current.set(
                    `Node ${selectedNode}`,
                    JSON.stringify({ ...node, size: node.size + 10 })
                );
            }
        } else if (event.deltaY > 0) {
            if (node.size > 20) {
                ymapRef.current.set(
                    `Node ${selectedNode}`,
                    JSON.stringify({ ...node, size: node.size - 10 })
                );
            }
        }
    }
};
