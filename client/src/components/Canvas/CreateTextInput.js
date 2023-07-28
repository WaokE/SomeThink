import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

const TextInputComponent = ({ initialValue, onEnter, onCancel }) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const textFieldRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const newLabel = inputValue.trim();
            onEnter(newLabel);
        } else if (e.key === "Escape") {
            onCancel();
        }
    };

    const handleOutside = (e) => {
        if (textFieldRef.current && !textFieldRef.current.contains(e.target)) {
            onCancel();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutside);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
        };
    }, []);

    useEffect(() => {
        const textField = textFieldRef.current;
        if (textField) {
            textField.focus();
        }
    }, []);

    return (
        <input
            ref={textFieldRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
                position: "absolute",
                width: "150px",
                height: "30px",
                zIndex: "10",
                textAlign: "center",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}
        />
    );
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
