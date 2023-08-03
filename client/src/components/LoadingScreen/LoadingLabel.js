const LoadingLabel = (props) => {
    return (
        <div
            style={{
                height: "10vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                color: "black",
            }}
        >
            {`${props.roomNumb}로 입장중입니다.`}
        </div>
    );
};

export default LoadingLabel;
