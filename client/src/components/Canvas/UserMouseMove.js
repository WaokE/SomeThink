const UserMouseMove = (props) => {
    const { userMouseData, networkRef, userName } = props;
    const filteredUserMouseData = userMouseData.filter((data) => {
        const [id] = data;
        return id !== userName; // Exclude data with matching id
    });

    return filteredUserMouseData.map((data) => {
        const [id, x, y] = data;
        const coord = networkRef.current.canvasToDOM({ x: x, y: y });
        const nx = coord.x;
        const ny = coord.y;

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
                        backgroundColor: "red",
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
