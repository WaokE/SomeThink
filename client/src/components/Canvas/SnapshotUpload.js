import React, { useRef, useEffect } from "react";

function FileUploader({ onUploadDone }) {
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.click();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            onUploadDone(content);
        };

        reader.readAsText(file);
        event.target.value = null; // 입력값 초기화
    };

    return (
        <input
            type="file"
            ref={inputRef}
            accept=".txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
        />
    );
}

export default FileUploader;
