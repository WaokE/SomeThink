import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const TextInputComponent = ({ initialValue, onEnter, onCancel }) => {
    const textFieldRef = useRef(null);

    useEffect(() => {
        const textField = textFieldRef.current;

        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                const newLabel = textField.value.trim();
                onEnter(newLabel);
                removeTextFieldEventListeners();
            } else if (e.key === "Escape") {
                onCancel();
                removeTextFieldEventListeners();
            }
        };

        const handleOutside = (e) => {
            if (!textField.contains(e.target)) {
                onCancel();
                removeTextFieldEventListeners();
            }
        };

        const removeTextFieldEventListeners = () => {
            document.removeEventListener("mousedown", handleOutside);
            textField.removeEventListener("keydown", handleKeyDown);
        };

        textField.addEventListener("keydown", handleKeyDown);
        textField.addEventListener("click", (e) => e.stopPropagation());
        document.addEventListener("mousedown", handleOutside);

        return () => {
            removeTextFieldEventListeners();
        };
    }, [onEnter, onCancel]);

    return <input ref={textFieldRef} defaultValue={initialValue} style={inputStyle} />;
};

const inputStyle = {
    position: "absolute",
    width: "150px",
    height: "30px",
    zIndex: "10",
    textAlign: "center",
    transform: "translate(-50%, -50%)",
};

export const createTextInput = (initialValue, onEnter, onCancel) => {
    const textFieldContainer = document.createElement("div");
    const textField = (
        <TextInputComponent initialValue={initialValue} onEnter={onEnter} onCancel={onCancel} />
    );

    ReactDOM.render(textField, textFieldContainer);

    document.body.appendChild(textFieldContainer);

    return textFieldContainer;
};
