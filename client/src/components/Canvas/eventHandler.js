export const handleDoubleClick = (event, modifyNode) => {
    if (event.nodes.length > 0) {
        const selectedNodeId = event.nodes[0];
        const newLabel = prompt("새로운 노드 이름을 입력하세요");
        if (newLabel === null) return;
        modifyNode(selectedNodeId, newLabel, event.pointer.canvas.x, event.pointer.canvas.y);
    }
};

export const handleNodeDragEnd = (event, ymapRef) => {
    const { nodes, pointer } = event;
    if (!nodes || nodes.length === 0 || event.nodes[0] === 1) {
        return;
    }
    console.log(event);
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
    console.log(event);
    const nodeId = nodes[0];
    const { x, y } = pointer.canvas;

    const movedNode = ymapRef.current.get(`Node ${nodeId}`);
    ymapRef.current.set(`Node ${nodeId}`, JSON.stringify({ ...JSON.parse(movedNode), x: x, y: y }));
};

export const handleClickOutside = (contextMenuRef, setIsNodeContextMenuVisible) => (event) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setIsNodeContextMenuVisible(false);
    }
};

export const handleCanvasDrag = (event) => {
    // 캔버스 드래그가 진행 중일 때 호출되는 함수
    // 캔버스가 이동되지만 좌표는 저장하지 않습니다.
};

export const handleAddTextNode = (event, isCreatingText, setState, setIsCreatingText) => {
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

export const handleAddImageNode =
    ({ imageUrl, setState }) =>
    () => {
        console.log("imageUrl");
        console.log(imageUrl);
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

export const handleNodeContextMenu = (setContextMenuPos, setIsNodeContextMenuVisible) => {
    return ({ event, nodes }) => {
        event.preventDefault();

        if (nodes.length > 0) {
            const xPos = event.clientX;
            const yPos = event.clientY;
            const selectedNodeId = nodes[0];
            setContextMenuPos({ xPos, yPos, selectedNodeId });
            setIsNodeContextMenuVisible(true);
        }
    };
};
