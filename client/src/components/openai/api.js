const getConnectedNodeLabels = (clickedNodeId, ymapRef) => {
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

    const connectedNodeLabels = connectedNodeIds.map((nodeId) => {
        const node = JSON.parse(ymapRef.current.get(`Node ${nodeId}`));
        return node ? node.label : null;
    });

    return connectedNodeLabels;
};

const getAllNodeLabels = (ymapRef) => {
    const allNodeLabels = Array.from(ymapRef.current.keys())
        .filter((key) => key.startsWith("Node "))
        .map((key) => {
            const node = JSON.parse(ymapRef.current.get(key));
            return node ? node.label : null;
        });

    return allNodeLabels;
};

const fetchNewNodeLabels = async (connectedNodeLabels, allNodeLabels) => {
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

        return data.result.split(",");
    } catch (error) {
        console.error(error);
        alert(error.message);
        return [];
    }
};
const addNewNodesAndEdges = (clickedNode, newNodeLabels, clickedNodeId, ymapRef) => {
    return newNodeLabels.map((label, index) => {
        const nodeId = Math.floor(Math.random() * 1000 + Math.random() * 1000000);
        const newNode = {
            id: nodeId,
            label: label.trim(),
            x: clickedNode.x + 100 * (1 - index),
            y: clickedNode.y + 100 * index,
            physics: false,
            color: "#FBD85D",
            size: 30,
        };

        ymapRef.current.set(`Node ${nodeId}`, JSON.stringify(newNode));

        const edge = {
            from: clickedNodeId,
            to: nodeId,
            id: `${clickedNodeId} to ${nodeId}`,
        };
        const edgeKey = `Edge ${clickedNodeId} to ${nodeId}`;
        ymapRef.current.set(edgeKey, JSON.stringify(edge));

        return { newNode, edge };
    });
};
export { getConnectedNodeLabels, getAllNodeLabels, fetchNewNodeLabels, addNewNodesAndEdges };
