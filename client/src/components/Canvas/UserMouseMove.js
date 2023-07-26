import React from "react";

const UserMouseMove = (props) => {
    const { userMouseData, networkRef, userName, userList } = props;
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

    const filteredUserMouseData = userMouseData.filter((data) => {
        const [id] = data;
        return userList.includes(id) && id !== userName;
    });

    return filteredUserMouseData.map((data) => {
        const [id, x, y] = data;
        const userIndex = userList.indexOf(id);
        const color = colors[userIndex % colors.length];
        const coord = networkRef.current.canvasToDOM({ x: x, y: y });
        const nx = coord.x;
        const ny = coord.y;
    
        // 만약 id가 userName과 일치하면 출력하지 않도록 처리합니다.
        if (id === userName) {
            return null;
        }
    
        return (
            <div
                key={id}
                style={{
                    position: "absolute",
                    left: nx, // Use the cursor's X-coordinate directly
                    top: ny, // Use the cursor's Y-coordinate directly
                    zIndex: 9999,
                    pointerEvents: "none", // Disable interactivity for the arrow element
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "-10px", // Adjust the left value to position the arrow on the left side of the red circle
                        top: "-10px", // Adjust the top value to center the arrow vertically
                        fontSize: "12px",
                        color: "white",
                        backgroundColor: color, // Assign colors from the colors array based on the user's index
                        padding: "5px",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {/* Mouse Cursor Arrow */}
                    <div
                        style={{
                            width: "0",
                            height: "0",
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderBottom: "10px solid white",
                            marginRight: "5px",
                        }}
                    />
                    {id}
                </div>
            </div>
        );
    });
};    

export default UserMouseMove;
