import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./TextInputComponent.css";

const TextInputComponent = ({ initialValue, onEnter, onCancel, networkRef, x, y }) => {
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

        const coord = networkRef.current.canvasToDOM({ x: x, y: y });

        textField.style.position = "absolute";
        textField.style.left = coord.x + "px";
        textField.style.top = coord.y + "px";
        textFieldRef.current.focus();

        return () => {
            removeTextFieldEventListeners();
        };
    }, [x, y, onEnter, onCancel]);

    return <input ref={textFieldRef} defaultValue={initialValue} className="text-input" />;
};

export const CreateTextInput = (initialValue, onEnter, onCancel, networkRef, x, y) => {
    const textFieldContainer = document.createElement("div");
    const textField = (
        <TextInputComponent
            initialValue={initialValue}
            onEnter={onEnter}
            onCancel={onCancel}
            networkRef={networkRef}
            x={x}
            y={y}
        />
    );

    ReactDOM.render(textField, textFieldContainer);

    document.body.appendChild(textFieldContainer);

    return textFieldContainer;
};
