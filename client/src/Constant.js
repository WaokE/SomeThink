export const colors = [
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

export const mindMapOptions = {
    layout: {
        hierarchical: false,
    },
    nodes: {
        shape: "circle",
        size: 30,
        mass: 1,
        color: "#FBD85D",
        widthConstraint: {
            maximum: 100,
        },
        font: {
            face: "MainFont",
        },
    },
    edges: {
        arrows: {
            to: {
                enabled: false,
            },
        },
        width: 2,
        color: "#000000",
    },
    physics: {
        enabled: false,
    },
    interaction: {
        multiselect: false,
        zoomView: false,
    },
};

export const rootNode = {
    id: 1,
    label: "start",
    x: 0,
    y: 0,
    physics: false,
    fixed: true,
    color: "#f5b252",
    widthConstraint: { minimum: 100, maximum: 200 }, // 너비를 100으로 고정
    heightConstraint: { minimum: 100, maximum: 200 }, // 높이를 100으로 고정
    font: { size: 30 },
};

export const MAX_STACK_LENGTH = 10;

export const ROOT_NODE_COLOR = "#f5b252";
export const NORMAL_NODE_COLOR = "#FBD85D";

export const throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
};

export const BOOKMARK_ICON = "🔴";
