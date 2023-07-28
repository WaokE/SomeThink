import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const TextInputComponent = ({ initialValue, onEnter, onCancel }) => {
    const textFieldRef = useRef(null);

    useEffect(() => {
        const textField = textFieldRef.current;

        const canvasRect = document.querySelector(".vis-network canvas").getBoundingClientRect();
        textField.value = initialValue;
        textField.style.position = "absolute";
        textField.style.width = "150px";
        textField.style.height = "30px";
        textField.style.zIndex = "10";
        textField.style.textAlign = "center";
        textField.style.top = `${canvasRect.top + canvasRect.height / 2}px`;
        textField.style.left = `${canvasRect.left + canvasRect.width / 2}px`;
        textField.style.transform = "translate(-50%, -50%)";

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
    }, [initialValue, onEnter, onCancel]);

    return <input ref={textFieldRef} />;
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