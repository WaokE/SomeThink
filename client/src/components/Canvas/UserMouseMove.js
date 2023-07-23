const UserMouseMove = (props) => {
    return props.userMouseData.map((data) => {
        const [id, x, y] = data;
        const coord = props.networkRef.current.canvasToDOM({ x: x, y: y });
        const nx = coord.x;
        const ny = coord.y;

        return (
            <div
                key={id}
                style={{
                    position: "absolute",
                    left: `${nx}px`,
                    top: `${ny}px`,
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                }}
            ></div>
        );
    });
};

export default UserMouseMove;
