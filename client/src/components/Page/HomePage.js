import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Slide } from "@mui/material";
import "./HomePage.css";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function HomePage(props) {
    const {
        isLoading,
        handleCreateSession,
        handleChangeUserName,
        myUserName,
        handleJoinSession,
        handleChangeSessionId,
        // handleSetisLoading,
    } = props;
    const [showModal, setShowModal] = useState(false);
    const [rootWord, setRootWord] = useState("");

    const handleCreateSessionWithText = (keyword) => {
        if (!keyword) {
            alert("Please enter a keyword.");
            return;
        }

        handleCreateSession();
        navigate("/session", { state: { keyword } });
    };

    const navigate = useNavigate();

    const redirectToSessionPage = () => {
        if (!rootWord) {
            alert("Please enter a keyword."); // 또는 원하는 경고 메시지를 표시
            return;
        }

        openCreatePopup();
        if (showModal) {
            handleCreateSession();
            navigate("/session", { state: { keyword: rootWord } });
        }
    };

    const redirectToSessionPage2 = () => {
        handleJoinSession((response) => {
            if (response) {
                navigate("/session"); // SessionPage로 이동
            }
        });
    };

    const openCreatePopup = () => {
        setShowModal(true);
    };

    const closeCreatePopup = () => {
        setShowModal(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0] || e.target.files[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const textContent = event.target.result;

                try {
                    // 줄 단위로 나누어서 각 JSON 객체 파싱
                    const lines = textContent.split("\n");
                    for (const line of lines) {
                        if (line.trim() === "") {
                            continue;
                        }

                        const data = JSON.parse(line);
                        if (data.id === 1 && data.label) {
                            const label = data.label;
                            setRootWord(label);
                            handleCreateSession();
                            navigate("/session", {
                                state: {
                                    keyword: label,
                                    textData: textContent,
                                },
                            });
                            break;
                        }
                    }
                } catch (error) {
                    alert("Error parsing JSON.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Please drop a valid text file.");
        }
    };
    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const textContent = event.target.result;

                try {
                    // Extract the keyword from the text content (similar to your handleDrop logic)
                    const lines = textContent.split("\n");
                    for (const line of lines) {
                        if (line.trim() === "") {
                            continue;
                        }

                        const data = JSON.parse(line);
                        if (data.id === 1 && data.label) {
                            const label = data.label;
                            setRootWord(label);
                            handleCreateSession();
                            navigate("/session", {
                                state: {
                                    keyword: label,
                                    textData: textContent,
                                },
                            });
                            break;
                        }
                    }
                } catch (error) {
                    alert("Error parsing JSON.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid text file.");
        }
    };

    const fileInputRef = React.createRef();

    return (
        <div id="join">
            <div className="big-circles" style={{ pointerEvents: "none" }}>
                <div className="big-circle"></div>
                <div className="big-circle"></div>
                <div className="big-circle"></div>
            </div>
            <section id="home">
                <div className="slide-wrapper">
                    <div className="smallcircles" style={{ pointerEvents: "none" }}>
                        <div className="small-circle"></div>
                        <div className="small-circle"></div>
                        <div className="small-circle"></div>
                        <div className="small-circle"></div>
                        <div className="small-circle"></div>
                        <div className="small-circle"></div>
                    </div>
                    <div id="join-dialog" className="jumbotron vertical-center">
                        <a href="https://somethink.online/dino" className="logo" draggable="false">
                            {" "}
                        </a>
                        <form className="form-group name" onSubmit={redirectToSessionPage}>
                            <p>
                                <label> NAME </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="userName"
                                    value={myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </p>
                        </form>
                        <div id="join-dialog-content">
                            <div className="first">
                                <p className="create">
                                    <label id="label-create"> NEW ROOM </label>
                                    <input
                                        onClick={openCreatePopup}
                                        className="btn btn-lg btn-success create"
                                        name="commit"
                                        type="button"
                                        value="CREATE"
                                    />
                                </p>
                            </div>
                            <div>
                                <form
                                    className="form-group"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        redirectToSessionPage2();
                                    }}
                                >
                                    <p>
                                        <input
                                            className="form-control"
                                            type="text"
                                            id="sessionId"
                                            onChange={handleChangeSessionId}
                                            style={{ pointerEvents: "auto" }}
                                            placeholder="   # INVITE CODE"
                                        />
                                    </p>
                                    <p className="text-center">
                                        <input
                                            className="btn btn-lg btn-success"
                                            name="commit"
                                            type="submit"
                                            value="JOIN"
                                        />
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {showModal && (
                <Dialog
                    open={showModal}
                    onClose={closeCreatePopup}
                    TransitionComponent={Transition}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    sx={{
                        "& .MuiDialog-paper": {
                            borderRadius: "20px",
                        },
                    }}
                    BackdropProps={{
                        onClick: (event) => {
                            event.stopPropagation(); // 이벤트 전파 중지
                        },
                    }}
                >
                    <DialogContent>
                        {/* 드래그 앤 드롭 박스 */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "16px",
                                flexDirection: "column",
                            }}
                        >
                            <p className="text-center">마인드맵 파일을 넣으세요</p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center", // 가로 가운데 정렬
                                    alignItems: "center", // 세로 가운데 정렬
                                    border: "2px dashed #aaa",
                                    borderRadius: "4px",
                                    padding: "8px",
                                    cursor: "pointer",
                                }}
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={handleDrop}
                            >
                                <p
                                    style={{
                                        display: "block",
                                        margin: "0 auto",
                                        maxWidth: "100%",
                                        maxHeight: "100%",
                                    }}
                                >
                                    drag & drop
                                </p>
                            </div>
                        </div>
                        <hr
                            style={{
                                width: "100%",
                                border: "none",
                                height: "1px",
                                backgroundColor: "#ddd",
                                margin: "8px 0",
                            }}
                        />
                        <p className="text-center">새로운 키워드</p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "16px",
                            }}
                        >
                            <TextField
                                id="outlined-required"
                                value={rootWord}
                                onChange={(e) => setRootWord(e.target.value)}
                                size="small"
                                margin="normal"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleCreateSessionWithText(rootWord, "");
                                    }
                                }}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        borderRadius: "20px",
                                        width: "100%",
                                        marginTop: "16px",
                                    },
                                }}
                            />
                            <p className="text-center">
                                <input
                                    className="btn btn-lg btn-start"
                                    name="commit"
                                    type="submit"
                                    onClick={redirectToSessionPage}
                                    variant="contained"
                                />
                            </p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".txt" // Limit accepted file types
                            onChange={handleFileSelection}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default HomePage;
