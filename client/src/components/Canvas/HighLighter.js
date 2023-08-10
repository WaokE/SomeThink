import pointerImage from "../../img/icon/pointer.png";

const HighLighter = (props) => {
    return (
        <div
            style={{
                position: "fixed",
                left: "calc(50% - 25px)",
                top: "calc(50% + 30px)",
                width: "30px",
                height: "30px",
            }}
        >
            <img src={pointerImage} alt="pointer" style={{ width: "50px", height: "50px" }} />
        </div>
    );
};

export default HighLighter;
