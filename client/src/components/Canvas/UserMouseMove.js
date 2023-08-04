import React from "react";
import { colors } from "../../Constant";

const UserMouseMove = (props) => {
    const { userMouseData, networkRef, userName, userList } = props;

    const filteredUserMouseData = userMouseData.filter((data) => {
        const [id] = data;
        return userList.includes(id);
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
                    whiteSpace: "nowrap",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "-10px", // Adjust the left value to position the arrow on the left side of the red circle
                        top: "-10px", // Adjust the top value to center the arrow vertically
                        fontSize: "9px",
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
                            borderLeft: "3px solid transparent",
                            borderRight: "3px solid transparent",
                            borderBottom: "5px solid white",
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
