import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./TextInputComponent.css";

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

        textFieldRef.current.focus();

        return () => {
            removeTextFieldEventListeners();
        };
    }, [onEnter, onCancel]);

    return (
        <div className="text-input-container">
            <input ref={textFieldRef} defaultValue={initialValue} className="text-input" />
        </div>
    );
};

export const CreateTextInput = (initialValue, onEnter, onCancel) => {
    const textFieldContainer = document.createElement("div");
    const textField = (
        <TextInputComponent initialValue={initialValue} onEnter={onEnter} onCancel={onCancel} />
    );

    ReactDOM.render(textField, textFieldContainer);

    document.body.appendChild(textFieldContainer);

    return textFieldContainer;
};
