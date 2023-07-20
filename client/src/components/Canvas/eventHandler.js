export const handleDoubleClick = (event, ymapRef, modifyNode) => {
    if (event.nodes.length > 0) {
        const selectedNodeId = event.nodes[0];
        const nodeData = ymapRef.current.get(`Node ${selectedNodeId}`);
        if (nodeData) {
            const node = JSON.parse(nodeData);
            const canvas = document.querySelector(".vis-network canvas");
            if (canvas) {
                const canvasRect = canvas.getBoundingClientRect();
                const textField = document.createElement("input");
                textField.value = node.label;
                textField.style.position = "absolute";
                textField.style.top = `${canvasRect.top + canvasRect.height / 2}px`;
                textField.style.left = `${canvasRect.left + canvasRect.width / 2}px`;
                textField.style.transform = "translate(-50%, -50%)";
                textField.style.width = "150px";
                textField.style.height = "30px";
                textField.style.zIndex = "10";
                textField.style.textAlign = "center";
                document.body.appendChild(textField);
                textField.focus();

                const handleKeyDown = (e) => {
                    if (e.key === "Enter") {
                        const newLabel = textField.value.trim();
                        if (newLabel === "") {
                            // Show an alert if the user tries to set an empty label
                            alert("키워드를 입력해주세요");
                            textField.value = node.label; // Revert the text field value to the original label
                        } else {
                            modifyNode(selectedNodeId, newLabel);
                            document.body.removeChild(textField);
                            document.removeEventListener("mousedown", handleOutside);
                            textField.removeEventListener("keydown", handleKeyDown);
                        }
                    } else if (e.key === "Escape") {
                        document.body.removeChild(textField);
                        document.removeEventListener("mousedown", handleOutside);
                        textField.removeEventListener("keydown", handleKeyDown);
                    }
                };

                const handleOutside = (e) => {
                    if (!textField.contains(e.target)) {
                        const newLabel = textField.value.trim();
                        if (newLabel === "") {
                            // Show an alert if the user tries to set an empty label
                            alert("키워드를 입력해주세요");
                            textField.value = node.label; // Revert the text field value to the original label
                        } else {
                            modifyNode(selectedNodeId, newLabel);
                            document.body.removeChild(textField);
                            document.removeEventListener("mousedown", handleOutside);
                            textField.removeEventListener("keydown", handleKeyDown);
                        }
                    }
                };

                // Add keydown event listener to the textarea
                textField.addEventListener("keydown", handleKeyDown);

                // Prevent the click event from propagating to the document when the user clicks inside the textarea
                textField.addEventListener("click", (e) => e.stopPropagation());

                // Add mousedown event listener to the document
                document.addEventListener("mousedown", handleOutside);
            }
        }
    }
};

export const handleNodeDragEnd = (event, ymapRef) => {
    const { nodes, pointer } = event;
    if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
        return;
    }
    const nodeId = nodes[0];
    const { x, y } = pointer.canvas;

    const movedNode = ymapRef.current.get(`Node ${nodeId}`);
    ymapRef.current.set(`Node ${nodeId}`, JSON.stringify({ ...JSON.parse(movedNode), x: x, y: y }));
};

export const handleNodeDragging = (event, ymapRef) => {
    const { nodes, pointer } = event;
    if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
        return;
    }
    const nodeId = nodes[0];
    const { x, y } = pointer.canvas;

    const movedNode = ymapRef.current.get(`Node ${nodeId}`);
    ymapRef.current.set(`Node ${nodeId}`, JSON.stringify({ ...JSON.parse(movedNode), x: x, y: y }));
};

export const handleClickOutside =
    (
        contextMenuRef,
        setIsNodeContextMenuVisible,
        setIsEdgeContextMenuVisible,
        setIsImageContextMenuVisible,
        setIsCreatingImage
    ) =>
    (event) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
            setIsNodeContextMenuVisible(false);
            setIsEdgeContextMenuVisible(false);
            setIsImageContextMenuVisible(false);
            setIsCreatingImage(false);
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
    setState,
    setSelectedNode,
    setIsCreatingText
) => {
    if (!isCreatingText) return;
    const { pointer } = event;
    const label = prompt("");
    if (label) {
        const nodeCount = ymapRef.current.get("Counter");
        const newNode = {
            id: nodeCount,
            shape: "text",
            label: label,
            x: pointer.canvas.x,
            y: pointer.canvas.y,
            physics: false,
            font: {
                size: 30,
            },
        };
        ymapRef.current.set(`Node ${nodeCount}`, JSON.stringify(newNode));
        ymapRef.current.set("Counter", nodeCount + 1);

        setSelectedNode(null);
        setIsCreatingText(false);
    } else {
        setIsCreatingText(false);
    }
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
        };

        ymapRef.current.set(`Node ${nodeCount}`, JSON.stringify(newNode));
        ymapRef.current.set("Counter", nodeCount + 1);
    };

export const handleNodeContextMenu = (
    setContextMenuPos,
    setIsNodeContextMenuVisible,
    setIsEdgeContextMenuVisible,
    setIsImageContextMenuVisible,
    isCreatingImage
) => {
    return ({ event, nodes, edges }) => {
        event.preventDefault();

        if (nodes.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedNodeId = nodes[0];
            setContextMenuPos({ xPos, yPos, selectedNodeId });
            setIsNodeContextMenuVisible(true);
        } else if (nodes.length === 0 && edges.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedEdge = edges;
            setContextMenuPos({ xPos, yPos, selectedEdge });
            setIsEdgeContextMenuVisible(true);
        } else if (isCreatingImage) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            setContextMenuPos({ xPos, yPos });
            setIsImageContextMenuVisible(true);
        }
    };
};
